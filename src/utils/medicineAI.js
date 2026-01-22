// AI Medicine Suggestion Logic
import { medicineDatabase } from './mockData';

export const suggestMedicine = (symptoms, age = null, allergies = []) => {
  const suggestions = [];
  const symptomLower = symptoms.toLowerCase();
  
  // Simple keyword matching for symptom recognition
  const symptomKeywords = {
    fever: ['fever', 'high temperature', 'hot', 'burning'],
    headache: ['headache', 'head pain', 'migraine', 'head ache'],
    cough: ['cough', 'coughing', 'dry cough', 'wet cough'],
    cold: ['cold', 'runny nose', 'sneezing', 'nasal congestion'],
    pain: ['pain', 'ache', 'sore', 'hurting'],
    stomach: ['stomach', 'nausea', 'vomiting', 'indigestion', 'heartburn', 'abdominal'],
  };

  // Find matching symptoms
  const matchedSymptoms = [];
  for (const [key, keywords] of Object.entries(symptomKeywords)) {
    if (keywords.some(keyword => symptomLower.includes(keyword))) {
      matchedSymptoms.push(key);
    }
  }

  // Get medicine suggestions for matched symptoms
  matchedSymptoms.forEach(symptom => {
    const medicines = medicineDatabase[symptom] || [];
    medicines.forEach(medicine => {
      // Check for allergies
      const medicineName = medicine.name.toLowerCase();
      const hasAllergy = allergies.some(allergy => 
        medicineName.includes(allergy.toLowerCase())
      );

      if (!hasAllergy) {
        suggestions.push({
          ...medicine,
          symptom,
          confidence: calculateConfidence(symptom, symptomLower),
        });
      }
    });
  });

  // If no specific match, suggest general pain relief
  if (suggestions.length === 0 && symptomLower.includes('pain')) {
    suggestions.push({
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Every 6 hours',
      duration: 'As needed',
      precautions: 'Take with food. Consult doctor if pain persists.',
      symptom: 'general',
      confidence: 0.5,
    });
  }

  // Sort by confidence
  suggestions.sort((a, b) => b.confidence - a.confidence);

  // Add severity warning for certain symptoms
  const severityWarnings = [];
  if (symptomLower.includes('high fever') || symptomLower.includes('fever above 103')) {
    severityWarnings.push('High fever detected. Please consult a doctor immediately if fever persists for more than 3 days.');
  }
  if (symptomLower.includes('chest pain') || symptomLower.includes('difficulty breathing')) {
    severityWarnings.push('Chest pain or breathing difficulties require immediate medical attention. Please visit emergency room.');
  }

  return {
    suggestions: suggestions.slice(0, 3), // Top 3 suggestions
    matchedSymptoms,
    severityWarnings,
    disclaimer: 'These suggestions are for informational purposes only. Always consult a healthcare professional before taking any medication, especially if you have existing medical conditions or are taking other medications.',
  };
};

const calculateConfidence = (symptom, symptomText) => {
  // Simple confidence calculation based on keyword matching
  const keywords = {
    fever: ['fever', 'temperature', 'hot'],
    headache: ['headache', 'head', 'migraine'],
    cough: ['cough', 'coughing'],
    cold: ['cold', 'runny nose', 'congestion'],
    pain: ['pain', 'ache', 'sore'],
    stomach: ['stomach', 'nausea', 'vomiting'],
  };

  const symptomKeywords = keywords[symptom] || [];
  const matches = symptomKeywords.filter(keyword => 
    symptomText.includes(keyword)
  ).length;

  return Math.min(0.9, 0.5 + (matches * 0.15));
};

// Additional helper function for symptom analysis
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
