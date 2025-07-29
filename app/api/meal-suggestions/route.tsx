import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      prompt, 
      familyMembers, 
      mealTypes, 
      cookingTime, 
      cuisinePreferences, 
      specialRequests 
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const enhancedPrompt = `
${prompt}

IMPORTANT: You must respond with ONLY a valid JSON array. No other text, explanations, or markdown formatting.

Example format:
[
  {
    "name": "Grilled Chicken with Vegetables",
    "type": "dinner",
    "ingredients": ["chicken breast", "broccoli", "carrots", "olive oil", "garlic"],
    "prepTime": 15,
    "cookTime": 20,
    "difficulty": "easy",
    "cuisine": "American",
    "description": "Healthy grilled chicken with roasted vegetables",
    "tags": ["gluten-free", "high-protein"],
    "allergenWarnings": [],
    "safetyNotes": "Safe for all listed family members"
  }
]

Generate exactly ${Math.min(mealTypes.length * 2, 6)} meal suggestions following this format.
`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a family nutrition expert specializing in allergy-safe meal planning. You must respond with valid JSON arrays only. Never include markdown formatting or explanations - just pure JSON.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate meal suggestions', details: errorData },
        { status: openaiResponse.status }
      );
    }

    const openaiData = await openaiResponse.json();
    let aiContent = openaiData.choices[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json(
        { error: 'No content returned from OpenAI' },
        { status: 500 }
      );
    }

    aiContent = aiContent.trim();
    if (aiContent.startsWith('```json')) {
      aiContent = aiContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (aiContent.startsWith('```')) {
      aiContent = aiContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let suggestions;
    try {
      suggestions = JSON.parse(aiContent);
      
      if (!Array.isArray(suggestions)) {
        suggestions = [suggestions];
      }

      suggestions = suggestions.map((suggestion: any, index: number) => ({
        name: suggestion.name || `AI Meal ${index + 1}`,
        type: mealTypes.includes(suggestion.type) ? suggestion.type : mealTypes[0],
        ingredients: Array.isArray(suggestion.ingredients) ? suggestion.ingredients : [],
        prepTime: typeof suggestion.prepTime === 'number' ? suggestion.prepTime : 10,
        cookTime: typeof suggestion.cookTime === 'number' ? suggestion.cookTime : 15,
        difficulty: ['easy', 'medium', 'hard'].includes(suggestion.difficulty) ? suggestion.difficulty : 'easy',
        cuisine: suggestion.cuisine || 'American',
        description: suggestion.description || 'Delicious family-friendly meal',
        tags: Array.isArray(suggestion.tags) ? suggestion.tags : ['family-friendly'],
        allergenWarnings: Array.isArray(suggestion.allergenWarnings) ? suggestion.allergenWarnings : [],
        safetyNotes: suggestion.safetyNotes || 'Reviewed for family safety'
      }));

    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw AI content:', aiContent);
      
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response as JSON',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          rawContent: aiContent.substring(0, 500)
        },
        { status: 500 }
      );
    }

    console.log(`Generated ${suggestions.length} meal suggestions for user ${session.user.email}`);

    return NextResponse.json({
      success: true,
      suggestions,
      metadata: {
        generatedAt: new Date().toISOString(),
        familyMembers: familyMembers.length,
        mealTypes,
        cookingTime,
        cuisinePreferences
      }
    });

  } catch (error) {
    console.error('Meal suggestions API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}