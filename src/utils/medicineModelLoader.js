/**
 * Medicine Model Loader
 * Loads and provides access to the trained medicine recommendation model
 */

let medicineModel = null;
let isLoading = false;
let loadPromise = null;

/**
 * Load the medicine model from JSON file
 */
export async function loadMedicineModel() {
  if (medicineModel) {
    return medicineModel;
  }

  if (isLoading) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      // Get base URL from Vite config
      const baseUrl = import.meta.env.BASE_URL || '/';
      
      // Try multiple paths to handle different configurations
      const pathsToTry = [
        '/medicineModel.json',  // Direct root path (works in most cases)
        `${baseUrl}medicineModel.json`.replace(/\/+/g, '/'),  // With base URL
        './medicineModel.json',  // Relative path
        'medicineModel.json',    // Just filename
      ];
      
      let lastError = null;
      for (const path of pathsToTry) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            const data = await response.json();
            // Validate that it's the correct model structure
            if (data && data.medicines && Array.isArray(data.medicines)) {
              medicineModel = data;
              isLoading = false;
              console.log('✅ Medicine model loaded successfully from:', path);
              return medicineModel;
            } else {
              throw new Error('Invalid model structure');
            }
          }
        } catch (err) {
          lastError = err;
          // Continue to next path
          continue;
        }
      }
      
      // If all paths failed
      throw new Error(
        `Failed to load model from all attempted paths: ${pathsToTry.join(', ')}. ` +
        `Last error: ${lastError?.message || 'Unknown error'}. ` +
        `Make sure medicineModel.json exists in the public folder and restart the dev server.`
      );
    } catch (error) {
      console.error('❌ Error loading medicine model:', error);
      console.error('Base URL:', import.meta.env.BASE_URL);
      console.error('💡 Solution: Make sure medicineModel.json is in the public/ folder and restart your dev server');
      isLoading = false;
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Get the loaded model
 */
export function getMedicineModel() {
  return medicineModel;
}

/**
 * Check if model is loaded
 */
export function isModelLoaded() {
  return medicineModel !== null;
}
