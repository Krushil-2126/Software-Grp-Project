# AI Model Setup Guide

This guide explains how to train and integrate the AI model for medicine recommendations.

## Prerequisites

1. Python 3.8 or higher
2. Node.js and npm (for running the React app)

## Step 1: Install Python Dependencies

```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install pandas scikit-learn numpy
```

## Step 2: Train the Model

Run the training script to process the CSV file and generate the model:

```bash
python train_model.py
```

This will:
- Load `Medicine_Details.csv`
- Process all medicine data
- Create TF-IDF vectors for semantic search
- Generate `src/utils/medicineModel.json`

## Step 3: Copy Model to Public Folder

The model needs to be accessible by the React app. Copy it to the public folder:

**On Windows:**
```bash
copy src\utils\medicineModel.json public\medicineModel.json
```

**On Mac/Linux:**
```bash
cp src/utils/medicineModel.json public/medicineModel.json
```

Or manually copy `src/utils/medicineModel.json` to `public/medicineModel.json`

## Step 4: Run the Application

```bash
npm install
npm run dev
```

## How It Works

1. **Training Phase** (`train_model.py`):
   - Processes the CSV file with 11,000+ medicines
   - Creates TF-IDF vectors for each medicine based on:
     - Uses (conditions/symptoms treated)
     - Composition (active ingredients)
   - Exports model as JSON with vocabulary and IDF values

2. **Inference Phase** (`medicineAI.js`):
   - Loads the trained model on first use
   - Vectorizes user symptoms using TF-IDF
   - Calculates cosine similarity with all medicines
   - Returns top 5 matches with confidence scores
   - Filters out medicines with user allergies

## Model Features

- **Semantic Search**: Uses TF-IDF for intelligent matching
- **Allergy Filtering**: Automatically excludes medicines with allergens
- **Review Integration**: Confidence scores consider user reviews
- **Client-Side**: Runs entirely in the browser, no server needed

## Troubleshooting

### Model not loading
- Ensure `medicineModel.json` is in the `public/` folder
- Check browser console for errors
- Verify the file is accessible at `/medicineModel.json`

### Low accuracy
- The model uses TF-IDF which works best with specific symptom descriptions
- Try more detailed symptom descriptions
- Example: "I have a fever and headache" works better than just "fever"

### Training errors
- Ensure `Medicine_Details.csv` is in the project root
- Check that all required Python packages are installed
- Verify the CSV file format matches the expected structure

## Updating the Model

To retrain with new data:
1. Update `Medicine_Details.csv`
2. Run `python train_model.py`
3. Copy the new model to `public/medicineModel.json`
4. Restart the dev server
