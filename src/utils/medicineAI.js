// AI Medicine Suggestion Logic using Trained Model
import { loadMedicineModel, getMedicineModel, isModelLoaded } from './medicineModelLoader';
import { vectorizeQuery, precomputeDocumentVectors, cosineSimilarity } from './tfidf';

let modelLoaded = false;
let documentVectors = null;

/**
 * Initialize the model (load and precompute vectors)
 */
async function initializeModel() {
  if (modelLoaded && documentVectors) {
    return true;
  }

  try {
    const model = await loadMedicineModel();
    documentVectors = precomputeDocumentVectors(model);
    modelLoaded = true;
    return true;
  } catch (error) {
    console.error('Failed to load medicine model:', error);
    return false;
  }
}

/**
 * Extract symptoms from user input
 */
function extractSymptoms(symptomText) {
  const symptomLower = symptomText.toLowerCase();
  const symptoms = [];
  
  const symptomKeywords = {
    fever: ['fever', 'high temperature', 'hot', 'burning', 'temperature'],
    headache: ['headache', 'head pain', 'migraine', 'head ache', 'head'],
    cough: ['cough', 'coughing', 'dry cough', 'wet cough'],
    cold: ['cold', 'runny nose', 'sneezing', 'nasal congestion', 'congestion'],
    pain: ['pain', 'ache', 'sore', 'hurting', 'discomfort'],
    stomach: ['stomach', 'nausea', 'vomiting', 'indigestion', 'heartburn', 'abdominal', 'stomach pain'],
    allergy: ['allergy', 'allergic', 'sneezing', 'runny nose', 'itching'],
    infection: ['infection', 'bacterial', 'viral'],
    anxiety: ['anxiety', 'stress', 'worried', 'nervous'],
    insomnia: ['insomnia', 'sleepless', 'sleep', 'sleeping'],
  };

  for (const [symptom, keywords] of Object.entries(symptomKeywords)) {
    if (keywords.some(keyword => symptomLower.includes(keyword))) {
      symptoms.push(symptom);
    }
  }

  return symptoms;
}

/**
 * Check if medicine contains allergens
 */
function hasAllergen(medicine, allergies) {
  if (!allergies || allergies.length === 0) {
    return false;
  }

  const medicineText = `${medicine.name} ${medicine.composition}`.toLowerCase();
  return allergies.some(allergy => 
    medicineText.includes(allergy.toLowerCase())
  );
}

/**
 * Calculate confidence score with review ratings
 */
function calculateConfidence(similarity, medicine) {
  // Base confidence from similarity (0-1)
  let confidence = Math.min(1, Math.max(0, similarity));
  
  // Boost confidence based on review ratings
  const excellentReview = medicine.excellent_review || 0;
  const averageReview = medicine.average_review || 0;
  const reviewScore = (excellentReview * 1.0 + averageReview * 0.5) / 100;
  
  // Combine similarity (70%) with review score (30%)
  confidence = confidence * 0.7 + reviewScore * 0.3;
  
  return Math.min(0.95, confidence);
}

/**
 * Main function to suggest medicines using AI model
 */
export const suggestMedicine = async (symptoms, age = null, allergies = []) => {
  // Initialize model if not loaded
  const modelReady = await initializeModel();
  
  if (!modelReady) {
    // Fallback to basic response if model fails to load
    return {
      suggestions: [],
      matchedSymptoms: [],
      severityWarnings: [],
      disclaimer: 'Model not available. Please consult a healthcare professional.',
      error: 'Model failed to load'
    };
  }

  const model = getMedicineModel();
  if (!model || !documentVectors) {
    return {
      suggestions: [],
      matchedSymptoms: [],
      severityWarnings: [],
      disclaimer: 'Model not available. Please consult a healthcare professional.',
      error: 'Model not initialized'
    };
  }

  // Extract symptoms for display
  const matchedSymptoms = extractSymptoms(symptoms);

  // Vectorize the query
  const queryVector = vectorizeQuery(symptoms, model);
  
  if (!queryVector) {
    return {
      suggestions: [],
      matchedSymptoms,
      severityWarnings: [],
      disclaimer: 'Unable to process query. Please try rephrasing your symptoms.',
    };
  }

  // Calculate similarities
  const similarities = documentVectors.map(({ medicine, vector }) => {
    const similarity = cosineSimilarity(queryVector, vector);
    return {
      medicine,
      similarity,
      confidence: calculateConfidence(similarity, medicine)
    };
  });

  // Filter out medicines with allergens
  const filtered = similarities
    .filter(({ medicine }) => !hasAllergen(medicine, allergies))
    .filter(({ similarity }) => similarity > 0.01); // Only include relevant matches

  // Sort by confidence
  filtered.sort((a, b) => b.confidence - a.confidence);

  // Get top suggestions
  const topSuggestions = filtered.slice(0, 5).map(({ medicine, confidence, similarity }) => ({
    name: medicine.name,
    composition: medicine.composition,
    uses: medicine.uses,
    side_effects: medicine.side_effects,
    image_url: medicine.image_url,
    manufacturer: medicine.manufacturer,
    excellent_review: medicine.excellent_review,
    average_review: medicine.average_review,
    poor_review: medicine.poor_review,
    confidence: confidence,
    similarity: similarity,
    // Format for display
    dosage: extractDosage(medicine.composition),
    frequency: 'As prescribed by doctor',
    duration: 'As prescribed by doctor',
    precautions: medicine.side_effects || 'Consult your doctor before use',
  }));

  // Generate severity warnings
  const severityWarnings = generateSeverityWarnings(symptoms);

  return {
    suggestions: topSuggestions,
    matchedSymptoms,
    severityWarnings,
    disclaimer: 'These suggestions are for informational purposes only. Always consult a healthcare professional before taking any medication, especially if you have existing medical conditions or are taking other medications.',
  };
};

/**
 * Extract dosage from composition
 */
function extractDosage(composition) {
  if (!composition) return 'As prescribed';
  
  // Try to extract dosage information
  const dosageMatch = composition.match(/(\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|IU)\/?\d*(?:\s*(?:mg|g|ml|mcg|IU))?)/i);
  if (dosageMatch) {
    return dosageMatch[1];
  }
  
  return 'As prescribed by doctor';
}

/**
 * Generate severity warnings based on symptoms
 */
function generateSeverityWarnings(symptomText) {
  const warnings = [];
  const symptomLower = symptomText.toLowerCase();

  if (symptomLower.includes('chest pain') || symptomLower.includes('difficulty breathing')) {
    warnings.push('Chest pain or breathing difficulties require immediate medical attention. Please visit emergency room.');
  }
  
  if (symptomLower.includes('high fever') || symptomLower.includes('fever above 103')) {
    warnings.push('High fever detected. Please consult a doctor immediately if fever persists for more than 3 days.');
  }
  
  if (symptomLower.includes('severe') && (symptomLower.includes('pain') || symptomLower.includes('bleeding'))) {
    warnings.push('Severe symptoms detected. Please seek immediate medical attention.');
  }
  
  if (symptomLower.includes('unconscious') || symptomLower.includes('fainting')) {
    warnings.push('Loss of consciousness requires immediate emergency medical care. Call emergency services.');
  }

  return warnings;
}

/**
 * Analyze symptoms for urgency (kept from original)
 */
export const analyzeSymptoms = (symptoms) => {
  const symptomText = symptoms.toLowerCase();
  const analysis = {
    urgency: 'normal',
    recommendations: [],
  };

  // Check for urgent symptoms
  if (
    symptomText.includes('chest pain') ||
    symptomText.includes('difficulty breathing') ||
    symptomText.includes('severe') ||
    symptomText.includes('unconscious')
  ) {
    analysis.urgency = 'urgent';
    analysis.recommendations.push('Seek immediate medical attention');
  } else if (symptomText.includes('high fever') || symptomText.includes('persistent')) {
    analysis.urgency = 'high';
    analysis.recommendations.push('Consult a doctor within 24 hours');
  }

  return analysis;
};
