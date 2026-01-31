# Quick Start - AI Medicine Recommendation

## ✅ Setup Complete!

The AI model has been trained and is ready to use. The model includes **11,825 medicines** from your CSV file.

## How to Use

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the Medicine AI page** in your app

3. **Enter symptoms** (e.g., "I have a fever and headache")

4. **Get AI-powered recommendations** - The system will:
   - Match your symptoms to relevant medicines using TF-IDF semantic search
   - Filter out medicines with your allergies
   - Rank results by relevance and user reviews
   - Show top 5 recommendations with confidence scores

## Model Details

- **Total Medicines**: 11,825
- **Vocabulary Size**: 5,000 features
- **Model Size**: ~8.3 MB
- **Algorithm**: TF-IDF Vectorization + Cosine Similarity
- **Location**: `public/medicineModel.json`

## Features

✅ Semantic search (understands meaning, not just keywords)  
✅ Allergy filtering  
✅ Review-based confidence scoring  
✅ Client-side processing (no server needed)  
✅ Fast and responsive  

## Retraining

To retrain with updated data:
```bash
python train_model.py
```

The model will automatically be saved to both `src/utils/` and `public/` folders.
