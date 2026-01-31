"""
AI Model Training Script for Medicine Recommendation System
Processes Medicine_Details.csv and creates a searchable model
"""

import pandas as pd
import json
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def preprocess_text(text):
    """Clean and preprocess text for better matching"""
    if pd.isna(text):
        return ""
    # Convert to lowercase
    text = str(text).lower()
    # Remove special characters but keep spaces
    text = re.sub(r'[^\w\s]', ' ', text)
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text

def extract_keywords(text):
    """Extract important medical keywords from text"""
    # Common medical terms that should be preserved
    medical_terms = [
        'fever', 'headache', 'cough', 'cold', 'pain', 'nausea', 'vomiting',
        'diarrhea', 'infection', 'bacterial', 'viral', 'allergy', 'asthma',
        'hypertension', 'diabetes', 'cancer', 'ulcer', 'inflammation',
        'anxiety', 'depression', 'insomnia', 'arthritis', 'migraine'
    ]
    
    text_lower = text.lower()
    found_terms = [term for term in medical_terms if term in text_lower]
    return ' '.join(found_terms) + ' ' + text

def train_model(csv_path='Medicine_Details.csv', output_path='src/utils/medicineModel.json', public_path='public/medicineModel.json'):
    """Train the model and export it"""
    print("Loading CSV data...")
    df = pd.read_csv(csv_path)
    
    print(f"Loaded {len(df)} medicines")
    
    # Prepare data
    medicines = []
    for idx, row in df.iterrows():
        # Combine Uses and Composition for better matching
        uses_text = preprocess_text(row.get('Uses', ''))
        composition_text = preprocess_text(row.get('Composition', ''))
        combined_text = uses_text + ' ' + composition_text
        
        # Extract keywords
        enhanced_text = extract_keywords(combined_text)
        
        medicine_data = {
            'name': str(row.get('Medicine Name', '')),
            'composition': str(row.get('Composition', '')),
            'uses': str(row.get('Uses', '')),
            'side_effects': str(row.get('Side_effects', '')),
            'image_url': str(row.get('Image URL', '')),
            'manufacturer': str(row.get('Manufacturer', '')),
            'excellent_review': float(row.get('Excellent Review %', 0)) if pd.notna(row.get('Excellent Review %', 0)) else 0,
            'average_review': float(row.get('Average Review %', 0)) if pd.notna(row.get('Average Review %', 0)) else 0,
            'poor_review': float(row.get('Poor Review %', 0)) if pd.notna(row.get('Poor Review %', 0)) else 0,
            'search_text': enhanced_text
        }
        medicines.append(medicine_data)
    
    print("Creating TF-IDF vectorizer...")
    # Create TF-IDF vectorizer
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),  # Unigrams and bigrams
        stop_words='english',
        min_df=2,  # Minimum document frequency
        max_df=0.95  # Maximum document frequency
    )
    
    # Fit and transform
    search_texts = [med['search_text'] for med in medicines]
    tfidf_matrix = vectorizer.fit_transform(search_texts)
    
    print("Saving model...")
    # Get feature names for JavaScript
    feature_names = vectorizer.get_feature_names_out().tolist()
    
    # Convert sparse matrix to dense for JSON serialization
    # We'll use a more efficient approach - save the vectorizer vocabulary and transform function
    vocabulary = vectorizer.vocabulary_
    idf = vectorizer.idf_
    
    # Save medicines and model parameters
    model_data = {
        'medicines': medicines,
        'vocabulary': {str(k): int(v) for k, v in vocabulary.items()},
        'idf': idf.tolist(),
        'feature_names': feature_names,
        'max_features': len(feature_names)
    }
    
    # Save to JSON
    import os
    
    # Save to src/utils (for reference)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(model_data, f, ensure_ascii=False, indent=2)
    
    # Also save to public folder (for React app to access)
    os.makedirs(os.path.dirname(public_path), exist_ok=True)
    with open(public_path, 'w', encoding='utf-8') as f:
        json.dump(model_data, f, ensure_ascii=False, indent=2)
    
    print(f"Model saved to {output_path}")
    print(f"Model also saved to {public_path} (for React app)")
    print(f"Total medicines: {len(medicines)}")
    print(f"Vocabulary size: {len(vocabulary)}")
    
    # Test the model
    print("\nTesting model with sample query: 'fever and headache'")
    test_query = "fever and headache"
    test_vector = vectorizer.transform([preprocess_text(test_query)])
    similarities = cosine_similarity(test_vector, tfidf_matrix)[0]
    top_indices = np.argsort(similarities)[-5:][::-1]
    
    print("\nTop 5 matches:")
    for idx in top_indices:
        if similarities[idx] > 0:
            print(f"  - {medicines[idx]['name']}: {similarities[idx]:.3f}")
            print(f"    Uses: {medicines[idx]['uses'][:100]}...")
    
    return model_data

if __name__ == '__main__':
    try:
        train_model()
        print("\n[SUCCESS] Model training completed successfully!")
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
