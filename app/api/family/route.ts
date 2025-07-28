// app/api/family/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Load family members
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        families: {
          include: {
            members: {
              include: {
                allergies: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create default family
    let family = user.families[0];
    if (!family) {
      family = await prisma.family.create({
        data: {
          name: "My Family",
          userId: user.id
        },
        include: {
          members: {
            include: {
              allergies: true
            }
          }
        }
      });
    }

    // Transform data to match frontend interface
    const familyMembers = family.members.map(member => ({
      id: member.id,
      name: member.name,
      role: 'family', // You might want to add role field to schema later
      allergies: member.allergies.map(allergy => ({
        id: allergy.id,
        allergen: allergy.name,
        severity: allergy.severity.toLowerCase(),
        notes: allergy.notes
      }))
    }));

    return NextResponse.json({ familyMembers });
  } catch (error) {
    console.error('Family GET error:', error);
    return NextResponse.json({ error: 'Failed to load family members' }, { status: 500 });
  }
}

// POST - Add family member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, age, role, allergies } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { families: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create default family
    let family = user.families[0];
    if (!family) {
      family = await prisma.family.create({
        data: {
          name: "My Family",
          userId: user.id
        }
      });
    }

    // Create family member
    const newMember = await prisma.familyMember.create({
      data: {
        name,
        familyId: family.id,
        allergies: {
          create: (allergies || []).map((allergy: any) => ({
            name: allergy.allergen,
            severity: allergy.severity.toUpperCase(),
            notes: allergy.notes || null
          }))
        }
      },
      include: {
        allergies: true
      }
    });

    // Transform to frontend format
    const transformedMember = {
      id: newMember.id,
      name: newMember.name,
      role: role || 'family',
      allergies: newMember.allergies.map(allergy => ({
        id: allergy.id,
        allergen: allergy.name,
        severity: allergy.severity.toLowerCase(),
        notes: allergy.notes
      }))
    };

    // Get all family members for response
    const updatedFamily = await prisma.family.findUnique({
      where: { id: family.id },
      include: {
        members: {
          include: {
            allergies: true
          }
        }
      }
    });

    const familyMembers = updatedFamily!.members.map(member => ({
      id: member.id,
      name: member.name,
      role: 'family',
      allergies: member.allergies.map(allergy => ({
        id: allergy.id,
        allergen: allergy.name,
        severity: allergy.severity.toLowerCase(),
        notes: allergy.notes
      }))
    }));

    return NextResponse.json({ 
      success: true, 
      member: transformedMember,
      familyMembers 
    });
  } catch (error) {
    console.error('Family POST error:', error);
    return NextResponse.json({ error: 'Failed to add family member' }, { status: 500 });
  }
}

// PUT - Update family member
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, age, role, allergies } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the member belongs to user's family
    const member = await prisma.familyMember.findFirst({
      where: {
        id,
        family: {
          userId: user.id
        }
      },
      include: {
        allergies: true,
        family: true
      }
    });

    if (!member) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
    }

    // Delete existing allergies
    await prisma.allergy.deleteMany({
      where: { memberId: id }
    });

    // Update member and create new allergies
    const updatedMember = await prisma.familyMember.update({
      where: { id },
      data: {
        name,
        allergies: {
          create: (allergies || []).map((allergy: any) => ({
            name: allergy.allergen,
            severity: allergy.severity.toUpperCase(),
            notes: allergy.notes || null
          }))
        }
      },
      include: {
        allergies: true
      }
    });

    // Get all family members for response
    const family = await prisma.family.findUnique({
      where: { id: member.familyId },
      include: {
        members: {
          include: {
            allergies: true
          }
        }
      }
    });

    const familyMembers = family!.members.map(member => ({
      id: member.id,
      name: member.name,
      role: 'family',
      allergies: member.allergies.map(allergy => ({
        id: allergy.id,
        allergen: allergy.name,
        severity: allergy.severity.toLowerCase(),
        notes: allergy.notes
      }))
    }));

    return NextResponse.json({ 
      success: true,
      familyMembers 
    });
  } catch (error) {
    console.error('Family PUT error:', error);
    return NextResponse.json({ error: 'Failed to update family member' }, { status: 500 });
  }
}

// DELETE - Remove family member
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the member belongs to user's family
    const member = await prisma.familyMember.findFirst({
      where: {
        id,
        family: {
          userId: user.id
        }
      },
      include: {
        family: true
      }
    });

    if (!member) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
    }

    // Delete member (allergies will be deleted due to cascade)
    await prisma.familyMember.delete({
      where: { id }
    });

    // Get remaining family members
    const family = await prisma.family.findUnique({
      where: { id: member.familyId },
      include: {
        members: {
          include: {
            allergies: true
          }
        }
      }
    });

    const familyMembers = family!.members.map(member => ({
      id: member.id,
      name: member.name,
      role: 'family',
      allergies: member.allergies.map(allergy => ({
        id: allergy.id,
        allergen: allergy.name,
        severity: allergy.severity.toLowerCase(),
        notes: allergy.notes
      }))
    }));

    return NextResponse.json({ 
      success: true, 
      familyMembers 
    });
  } catch (error) {
    console.error('Family DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove family member' }, { status: 500 });
  }
}