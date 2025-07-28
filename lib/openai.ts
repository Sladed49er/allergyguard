// lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AllergenAnalysis {
  isProblematic: boolean;
  detectedAllergens: string[];
  analysis: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
  ingredientHighlights: {
    safe: string[];
    concerning: string[];
    problematic: string[];
  };
}

export async function analyzeIngredients(
  ingredients: string,
  familyAllergies: string[] = []
): Promise<AllergenAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  if (!ingredients.trim()) {
    throw new Error('No ingredients provided');
  }

  const allergyList = familyAllergies.length > 0 
    ? familyAllergies.join(', ')
    : 'common allergens (milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soybeans, sesame)';

  const prompt = `You are an expert food safety analyst specializing in allergen detection. 

INGREDIENTS TO ANALYZE:
"${ingredients}"

FAMILY ALLERGIES TO CHECK FOR:
${allergyList}

Please analyze these ingredients for potential allergen risks and provide a comprehensive safety assessment.

Return your analysis as a JSON object with this exact structure:
{
  "isProblematic": boolean,
  "detectedAllergens": ["allergen1", "allergen2"],
  "analysis": "detailed explanation of findings",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "recommendations": ["recommendation1", "recommendation2"],
  "ingredientHighlights": {
    "safe": ["safe ingredient 1", "safe ingredient 2"],
    "concerning": ["may contain traces", "processed in facility"],
    "problematic": ["direct allergen", "contains allergen"]
  }
}

Risk Level Guidelines:
- LOW: No detected allergens, safe for consumption
- MEDIUM: Potential cross-contamination or "may contain" warnings
- HIGH: Contains allergens but not primary family allergies
- CRITICAL: Contains family-specific allergens, DO NOT CONSUME

Be thorough but family-friendly in your language. Focus on clear, actionable guidance for parents protecting their children.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional allergen detection expert who helps families stay safe. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent, factual responses
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const analysis: AllergenAnalysis = JSON.parse(content);
    
    // Validate the response structure
    if (!analysis.hasOwnProperty('isProblematic') ||
        !analysis.hasOwnProperty('riskLevel') ||
        !Array.isArray(analysis.detectedAllergens)) {
      throw new Error('Invalid response format from AI');
    }

    return analysis;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response');
    }
    
    throw new Error('Failed to analyze ingredients. Please try again.');
  }
}