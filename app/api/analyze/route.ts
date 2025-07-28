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
    const { ingredients } = body;

    if (!ingredients || typeof ingredients !== 'string') {
      return NextResponse.json(
        { error: 'Ingredients are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // For now, use common allergens since family management isn't implemented yet
    // TODO: Replace with actual family allergies when family management is built
    const familyAllergies: string[] = [
      'milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 
      'peanuts', 'wheat', 'soybeans', 'sesame'
    ];

    // Analyze ingredients with AI
    const analysis = await analyzeIngredients(ingredients, familyAllergies);

    // Save scan to history
    const scanHistory = await prisma.scanHistory.create({
      data: {
        userId: user.id,
        ingredients: ingredients.trim(),
        analysis: analysis.analysis,
        detectedAllergens: analysis.detectedAllergens,
        riskLevel: analysis.riskLevel,
        isProblematic: analysis.isProblematic,
        recommendations: analysis.recommendations,
        // Store additional data as JSON for now
        metadata: JSON.stringify({
          familyAllergies,
          ingredientHighlights: analysis.ingredientHighlights,
          timestamp: new Date().toISOString()
        })
      }
    });

    // Return analysis results
    return NextResponse.json({
      success: true,
      scanId: scanHistory.id,
      analysis: {
        ...analysis,
        scanDate: scanHistory.createdAt,
        familyAllergiesChecked: familyAllergies
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