// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeIngredients } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { ingredients, excludedMembers = [] } = body; // Allow excluding specific family members

    if (!ingredients || typeof ingredients !== 'string') {
      return NextResponse.json(
        { error: 'Ingredients are required' },
        { status: 400 }
      );
    }

    // Get user and their family data
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Collect family allergies (excluding any specified members)
    const familyAllergies: Array<{
      allergen: string;
      severity: string;
      memberName: string;
      memberId: string;
    }> = [];

    user.families.forEach(family => {
      family.members.forEach(member => {
        // Skip excluded members (useful for meal planning)
        if (excludedMembers.includes(member.id)) {
          return;
        }

        member.allergies.forEach(allergy => {
          familyAllergies.push({
            allergen: allergy.name,
            severity: allergy.severity,
            memberName: member.name,
            memberId: member.id
          });
        });
      });
    });

    // Create allergy summary for AI prompt
    const allergyList = familyAllergies.length > 0 
      ? familyAllergies.map(a => `${a.allergen} (${a.severity.toLowerCase()} - ${a.memberName})`).join(', ')
      : 'No specific family allergies recorded - check for common allergens';

    // Analyze ingredients with AI using family-specific allergies
    const analysis = await analyzeIngredients(ingredients, familyAllergies.map(a => a.allergen));

    // Enhanced analysis with family-specific information
    const enhancedAnalysis = {
      ...analysis,
      familySpecificWarnings: [] as string[],
      affectedMembers: [] as Array<{
        name: string;
        allergen: string;
        severity: string;
      }>,
      safeMealFor: [] as string[]
    };

    // Check which family members are affected
    const affectedMembersTemp: Array<{name: string, allergies: string[], maxSeverity: string}> = [];
    const safeMealFor: string[] = [];

    user.families.forEach(family => {
      family.members.forEach(member => {
        // Skip excluded members
        if (excludedMembers.includes(member.id)) {
          return;
        }

        const memberAllergies = member.allergies.filter(allergy => 
          analysis.detectedAllergens.some(detected => 
            detected.toLowerCase().includes(allergy.name.toLowerCase()) ||
            allergy.name.toLowerCase().includes(detected.toLowerCase())
          )
        );

        if (memberAllergies.length > 0) {
          const maxSeverity = memberAllergies.reduce((max, allergy) => {
            const severityOrder = ['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING'];
            return severityOrder.indexOf(allergy.severity) > severityOrder.indexOf(max) 
              ? allergy.severity 
              : max;
          }, 'MILD');

          affectedMembersTemp.push({
            name: member.name,
            allergies: memberAllergies.map(a => `${a.name} (${a.severity.toLowerCase()})`),
            maxSeverity
          });
        } else {
          safeMealFor.push(member.name);
        }
      });
    });

    // Convert affected members to the correct format for the interface
    const formattedAffectedMembers: Array<{
      name: string;
      allergen: string;
      severity: string;
    }> = [];

    affectedMembersTemp.forEach(member => {
      member.allergies.forEach(allergyString => {
        // Extract allergen name and severity from the formatted string
        const allergenMatch = allergyString.match(/^(.+) \((.+)\)$/);
        if (allergenMatch) {
          formattedAffectedMembers.push({
            name: member.name,
            allergen: allergenMatch[1],
            severity: allergenMatch[2]
          });
        }
      });
    });

    enhancedAnalysis.affectedMembers = formattedAffectedMembers;
    enhancedAnalysis.safeMealFor = safeMealFor;

    // Generate family-specific warnings
    if (affectedMembersTemp.length > 0) {
      enhancedAnalysis.familySpecificWarnings = [
        `⚠️ This product affects ${affectedMembersTemp.length} family member(s)`,
        ...affectedMembersTemp.map(member => 
          `🚨 ${member.name}: Allergic to ${member.allergies.join(', ')}`
        )
      ];

      // Update risk level based on family severity
      const hasLifeThreatening = affectedMembersTemp.some(m => m.maxSeverity === 'LIFE_THREATENING');
      const hasSevere = affectedMembersTemp.some(m => m.maxSeverity === 'SEVERE');
      
      if (hasLifeThreatening) {
        enhancedAnalysis.riskLevel = 'CRITICAL';
        enhancedAnalysis.isProblematic = true;
      } else if (hasSevere) {
        enhancedAnalysis.riskLevel = affectedMembersTemp.length > 1 ? 'CRITICAL' : 'HIGH';
        enhancedAnalysis.isProblematic = true;
      }
    }

    // Save scan to history
    const scanHistory = await prisma.scanHistory.create({
      data: {
        userId: user.id,
        ingredients: ingredients.trim(),
        analysis: enhancedAnalysis.analysis,
        detectedAllergies: analysis.detectedAllergens,
        riskLevel: enhancedAnalysis.riskLevel,
        isProblematic: enhancedAnalysis.isProblematic,
        recommendations: enhancedAnalysis.recommendations
      }
    });

    // Return enhanced analysis results
    return NextResponse.json({
      success: true,
      scanId: scanHistory.id,
      analysis: {
        ...enhancedAnalysis,
        scanDate: scanHistory.createdAt,
        familyAllergiesChecked: familyAllergies.length,
        excludedMembers: excludedMembers.length
      }
    });

  } catch (error) {
    console.error('Analysis API Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('OpenAI API key')) {
        return NextResponse.json(
          { error: 'AI service not configured. Please contact support.' },
          { status: 503 }
        );
      }
      
      if (error.message.includes('No ingredients provided')) {
        return NextResponse.json(
          { error: 'Please provide ingredients to analyze' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to analyze ingredients. Please try again.' },
      { status: 500 }
    );
  }
}

// Optional: Add rate limiting for production
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}