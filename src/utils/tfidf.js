/**
 * TF-IDF Vectorization in JavaScript
 * Implements TF-IDF for medicine recommendation matching
 */

/**
 * Calculate TF (Term Frequency)
 */
function calculateTF(term, document) {
  const words = document.toLowerCase().split(/\s+/);
  const termCount = words.filter(word => word === term.toLowerCase()).length;
  return termCount / words.length;
}

/**
 * Calculate IDF (Inverse Document Frequency)
 */
function calculateIDF(term, documents, vocabulary) {
  if (!vocabulary[term.toLowerCase()]) {
    return 0;
  }
  
  const termIndex = vocabulary[term.toLowerCase()];
  // Use pre-calculated IDF from training
  if (termIndex < idfArray.length) {
    return idfArray[termIndex];
  }
  return 0;
}

/**
 * Tokenize text
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Create n-grams (unigrams and bigrams)
 */
function createNgrams(tokens) {
  const ngrams = [...tokens]; // Unigrams
  
  // Bigrams
  for (let i = 0; i < tokens.length - 1; i++) {
    ngrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  
  return ngrams;
}

let idfArray = [];
let vocabulary = {};

/**
 * Initialize TF-IDF with model vocabulary and IDF values
 */
export function initializeTFIDF(model) {
  vocabulary = model.vocabulary || {};
  idfArray = model.idf || [];
}

/**
 * Vectorize a query text using TF-IDF
 */
export function vectorizeQuery(query, model) {
  if (!model || !model.vocabulary) {
    return null;
  }

  initializeTFIDF(model);
  
  const tokens = tokenize(query);
  const ngrams = createNgrams(tokens);
  const vector = new Array(model.max_features || Object.keys(vocabulary).length).fill(0);
  
  // Calculate TF for each term in query
  const queryWords = query.toLowerCase().split(/\s+/);
  const queryLength = queryWords.length;
  
  ngrams.forEach(ngram => {
    const term = ngram.toLowerCase();
    if (vocabulary[term] !== undefined) {
      const termIndex = vocabulary[term];
      const tf = queryWords.filter(w => w === term || term.includes(w)).length / queryLength;
      const idf = termIndex < idfArray.length ? idfArray[termIndex] : 0;
      vector[termIndex] = tf * idf;
    }
  });
  
  return vector;
}

/**
 * Vectorize a document (medicine search text)
 */
export function vectorizeDocument(docText, model) {
  if (!model || !model.vocabulary) {
    return null;
  }

  initializeTFIDF(model);
  
  const tokens = tokenize(docText);
  const ngrams = createNgrams(tokens);
  const vector = new Array(model.max_features || Object.keys(vocabulary).length).fill(0);
  
  const docWords = docText.toLowerCase().split(/\s+/);
  const docLength = docWords.length;
  
  ngrams.forEach(ngram => {
    const term = ngram.toLowerCase();
    if (vocabulary[term] !== undefined) {
      const termIndex = vocabulary[term];
      const tf = docWords.filter(w => w === term || term.includes(w)).length / docLength;
      const idf = termIndex < idfArray.length ? idfArray[termIndex] : 0;
      vector[termIndex] = tf * idf;
    }
  });
  
  return vector;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Pre-compute document vectors for all medicines (for faster search)
 */
let documentVectors = null;

export function precomputeDocumentVectors(model) {
  if (documentVectors) {
    return documentVectors;
  }
  
  documentVectors = model.medicines.map(medicine => ({
    medicine,
    vector: vectorizeDocument(medicine.search_text, model)
  }));
  
  return documentVectors;
}
