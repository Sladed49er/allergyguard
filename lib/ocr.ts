// lib/ocr.ts
import Tesseract from 'tesseract.js';

export async function extractTextFromImage(imageDataUrl: string): Promise<string> {
  try {
    console.log('🔍 Starting OCR text extraction...');
    
    const result = await Tesseract.recognize(
      imageDataUrl,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    console.log('📝 Raw OCR result:', result.data.text);
    
    // Clean up the extracted text for ingredient lists
    let cleanedText = result.data.text
      .replace(/\n+/g, ', ') // Replace line breaks with commas
      .replace(/,\s*,+/g, ',') // Remove multiple commas
      .replace(/[^\w\s,().%-]/g, '') // Keep only letters, numbers, basic punctuation
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/,\s*$/, '') // Remove trailing comma
      .trim();
    
    // If text looks like ingredients (contains commas), return it
    if (cleanedText.includes(',') && cleanedText.length > 20) {
      console.log('✅ Cleaned ingredient text:', cleanedText);
      return cleanedText;
    }
    
    // If no commas, might be ingredient list without commas - add them
    if (cleanedText.length > 20) {
      // Try to split by common ingredient separators
      const ingredients = cleanedText
        .split(/\s+(?=[A-Z])/) // Split before capital letters
        .filter(word => word.length > 2)
        .join(', ');
      
      console.log('✅ Processed ingredient text:', ingredients);
      return ingredients;
    }
    
    console.log('⚠️ No substantial text found');
    return '';
    
  } catch (error) {
    console.error('❌ OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}