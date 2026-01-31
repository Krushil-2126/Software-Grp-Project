import React, { useState } from 'react';
import styles from './MedicineAI.module.css';
import { suggestMedicine } from '../utils/medicineAI';

const MedicineAI = () => {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [allergies, setAllergies] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const allergyList = allergies.split(',').map(a => a.trim()).filter(a => a);
      
      // Use client-side AI model
      const data = await suggestMedicine(
        symptoms,
        age ? parseInt(age) : null,
        allergyList
      );

      if (data.error) {
        setError(data.error || 'Failed to get medicine suggestions');
      } else {
        setResults({
          success: true,
          ...data
        });
      }
    } catch (err) {
      console.error('Error getting medicine suggestions:', err);
      setError(`Error: ${err.message || 'Failed to process your request. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Medicine Suggestion</h1>
        <p className={styles.subtitle}>
          Enter your symptoms and get personalized medicine recommendations
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Describe your symptoms *</label>
          <textarea
            className={styles.textarea}
            placeholder="e.g., I have a fever and headache for the past 2 days..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            required
            rows={5}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Age (optional)</label>
            <input
              type="number"
              className={styles.input}
              placeholder="25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="1"
              max="120"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Known Allergies (optional)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Paracetamol, Penicillin (comma separated)"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Analyzing with AI...' : 'Get Medicine Suggestions →'}
        </button>
      </form>

      {error && (
        <div className={styles.errorBox}>
          <h3>⚠️ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div className={styles.results}>
          {results.severityWarnings && results.severityWarnings.length > 0 && (
            <div className={styles.warningBox}>
              <h3>⚠️ Important Warning</h3>
              {results.severityWarnings.map((warning, idx) => (
                <p key={idx}>{warning}</p>
              ))}
            </div>
          )}

          {results.matchedSymptoms && results.matchedSymptoms.length > 0 && (
            <div className={styles.matchedSymptoms}>
              <h3>Matched Symptoms:</h3>
              <div className={styles.symptomTags}>
                {results.matchedSymptoms.map((symptom, idx) => (
                  <span key={idx} className={styles.tag}>{symptom}</span>
                ))}
              </div>
            </div>
          )}

          {results.suggestions && results.suggestions.length > 0 ? (
            <div className={styles.suggestions}>
              <h3>Recommended Medicines:</h3>
              {results.suggestions.map((medicine, idx) => (
                <div key={idx} className={styles.medicineCard}>
                  <div className={styles.medicineHeader}>
                    <h4>{medicine.name}</h4>
                    <span className={styles.confidence}>
                      {(medicine.confidence * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <div className={styles.medicineDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Dosage:</span>
                      <span>{medicine.dosage}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Frequency:</span>
                      <span>{medicine.frequency}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Duration:</span>
                      <span>{medicine.duration}</span>
                    </div>
                    {medicine.precautions && (
                      <div className={styles.precautions}>
                        <span className={styles.detailLabel}>Precautions:</span>
                        <span>{medicine.precautions}</span>
                      </div>
                    )}
                  </div>
                  {medicine.symptom && (
                    <div className={styles.symptomBadge}>
                      For: {medicine.symptom}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <p>No specific medicine suggestions found. Please consult a healthcare professional.</p>
            </div>
          )}

          {results.aiInsights && (
            <div className={styles.aiInsights}>
              <h3>AI Medical Insights:</h3>
              <p>{results.aiInsights}</p>
            </div>
          )}

          <div className={styles.disclaimer}>
            <p>{results.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineAI;
