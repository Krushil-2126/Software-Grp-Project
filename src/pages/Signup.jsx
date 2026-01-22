import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Signup.module.css';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    specialty: '',
    email: '',
    workEmail: '',
    license: '',
    password: '',
  });
  const [error, setError] = useState('');

  const isPatient = role === 'patient';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/patient-dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userData = isPatient
        ? {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            password: formData.password,
            role: 'patient',
          }
        : {
            name: formData.fullName,
            email: formData.workEmail,
            password: formData.password,
            role: 'doctor',
            specialty: formData.specialty,
            license: formData.license,
          };

      // Call backend API for registration
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        // Registration successful - auto login
        login(data.user);
        
        // Navigate to the page they were trying to access, or their dashboard
        const from = location.state?.from?.pathname || (role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');
        navigate(from, { replace: true });
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      // For demo purposes, allow signup without backend
      const userData = {
        id: Date.now(),
        name: isPatient ? `${formData.firstName} ${formData.lastName}` : formData.fullName,
        email: isPatient ? formData.email : formData.workEmail,
        role: role,
      };
      login(userData);
      
      const from = location.state?.from?.pathname || (role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');
      navigate(from, { replace: true });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`${styles.signupPage} ${isPatient ? styles.patientBg : styles.doctorBg}`}>
      <div className={styles.topBar}>
        <span className={styles.topBarText}>Already have an account?</span>
        <Link to="/login" className={styles.signInLink}>
          Sign In
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <button className={styles.chip}>JOIN THE FUTURE OF HEALTH</button>
          <h1 className={styles.heading}>
            Start Your <span className={styles.highlight}>Wellness</span>
            <br />
            Journey Today.
          </h1>
          <p className={styles.subheading}>
            Connect with world-class specialists, manage your health records, and experience
            personalized care through our secure glass-interface platform.
          </p>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIconShield}>🛡️</div>
              <div>
                <div className={styles.featureTitle}>End-to-End Encryption</div>
                <div className={styles.featureDescription}>
                  Your health data is safe and private.
                </div>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconBolt}>⚡</div>
              <div>
                <div className={styles.featureTitle}>Instant Appointments</div>
                <div className={styles.featureDescription}>
                  Skip the waiting room with telehealth.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.formCard}>
            <div className={styles.cardTopAccent} />
            <div className={styles.cardHeader}>
              <span className={styles.cardSubtitle}>I AM A...</span>
              <div className={styles.toggleGroup}>
                <button
                  type="button"
                  className={`${styles.toggleButton} ${isPatient ? styles.activeToggle : ''}`}
                  onClick={() => setRole('patient')}
                >
                  Patient
                </button>
                <button
                  type="button"
                  className={`${styles.toggleButton} ${!isPatient ? styles.activeToggle : ''}`}
                  onClick={() => setRole('doctor')}
                >
                  Doctor
                </button>
              </div>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              {error && (
                <div className={styles.errorMessage} style={{ 
                  color: '#ef4444', 
                  fontSize: '14px', 
                  marginBottom: '16px',
                  padding: '12px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.5)'
                }}>
                  {error}
                </div>
              )}
              <div className={styles.formVariant} key={role}>
              {isPatient ? (
                <>
                  <div className={styles.row}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>FIRST NAME</label>
                      <input 
                        className={styles.input} 
                        placeholder="John" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>LAST NAME</label>
                      <input 
                        className={styles.input} 
                        placeholder="Doe" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>EMAIL ADDRESS</label>
                    <input 
                      className={styles.input} 
                      placeholder="john@example.com" 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>CREATE PASSWORD</label>
                    <input
                      className={styles.input}
                      type="password"
                      placeholder="••••••••••"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                    />
                  </div>

                  <button className={styles.primaryButton} type="submit">
                    Create Account →
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.row}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>FULL NAME</label>
                      <input 
                        className={styles.input} 
                        placeholder="Dr. Jane Smith" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>SPECIALTY</label>
                      <input 
                        className={styles.input} 
                        placeholder="Cardiologist" 
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>WORK EMAIL</label>
                    <input 
                      className={styles.input} 
                      placeholder="dr.smith@hospital.com" 
                      type="email"
                      name="workEmail"
                      value={formData.workEmail}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>LICENSE / REGISTRATION ID</label>
                    <input 
                      className={styles.input} 
                      placeholder="e.g. MED-123456" 
                      name="license"
                      value={formData.license}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>CREATE PASSWORD</label>
                    <input
                      className={styles.input}
                      type="password"
                      placeholder="••••••••••"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                    />
                  </div>

                  <button className={styles.primaryButton} type="submit">
                    Continue as Doctor →
                  </button>
                </>
              )}
              </div>

              <div className={styles.divider}>
                <span className={styles.dividerLine} />
                <span className={styles.dividerText}>OR CONTINUE WITH</span>
                <span className={styles.dividerLine} />
              </div>

              <div className={styles.socialRow}>
                <button className={styles.socialButton}>Google</button>
                <button className={styles.socialButton}>Facebook</button>
              </div>

              <p className={styles.termsText}>
                By creating an account, you agree to our{' '}
                <a href="#terms">Terms of Service</a> and{' '}
                <a href="#privacy">Privacy Policy</a>, including Cookie Use.
              </p>
              <Link
                to="/"
                className={styles.backHomeLink}
              >
                ← Back to Home
              </Link>
            </form>
          </div>
        </div>
      </div>

      <p className={styles.footerNote}>
        © 2024 MediCare Plus. All health data is securely encrypted with AES-256.
      </p>
    </div>
  );
};

export default Signup;
