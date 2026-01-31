import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const goToLogin = () => {
    navigate('/login', { state: { from: location } });
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsSidebarOpen(false);
  };

  const scrollToTop = () => {
    navigate('/');
    setIsSidebarOpen(false);
  };

  const handleLinkClick = (path) => {
    if (!isAuthenticated && path !== '/') {
      navigate('/login', { state: { from: { pathname: path } } });
      setIsSidebarOpen(false);
      return;
    }
    navigate(path);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div onClick={scrollToTop} className={styles.logo} style={{ cursor: 'pointer' }}>
          <div className={styles.logoIcon}>+</div>
          <h2>MediCare Plus</h2>
        </div>
        
        <div className={styles.navActions}>
          {isAuthenticated ? (
            <>
              <div className={styles.userInfo}>
                <span className={styles.userName}>Welcome, {user?.name}</span>
                <span className={styles.userRole}>({user?.role})</span>
              </div>
              <div className={styles.btn}>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </>
          ) : (
            <div className={styles.btn}>
              <button onClick={goToLogin}>Login / Sign Up →</button>
            </div>
          )}
          
          <button 
            className={styles.menuButton}
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <span className={styles.hamburger}>
              <span className={`${styles.line} ${isSidebarOpen ? styles.line1Open : ''}`}></span>
              <span className={`${styles.line} ${isSidebarOpen ? styles.line2Open : ''}`}></span>
              <span className={`${styles.line} ${isSidebarOpen ? styles.line3Open : ''}`}></span>
            </span>
          </button>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      <div 
        className={`${styles.overlay} ${isSidebarOpen ? styles.overlayOpen : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h3>Navigation</h3>
          <button 
            className={styles.closeButton}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        
        <div className={styles.sidebarLinks}>
          <Link to="/" onClick={() => handleLinkClick('/')} className={styles.sidebarLink}>Home</Link>
          <button 
            type="button"
            onClick={() => handleLinkClick('/hospitals')} 
            className={styles.sidebarLinkButton}
          >
            Hospitals
          </button>
          <button 
            type="button"
            onClick={() => handleLinkClick('/doctor-locator')} 
            className={styles.sidebarLinkButton}
          >
            Find Doctors
          </button>
          <button 
            type="button"
            onClick={() => handleLinkClick('/medicine-ai')} 
            className={styles.sidebarLinkButton}
          >
            AI Medicine Suggestion
          </button>
          <button 
            type="button"
            onClick={() => handleLinkClick('/book-appointment')} 
            className={styles.sidebarLinkButton}
          >
            Book Appointment
          </button>
          <button 
            type="button"
            onClick={() => handleLinkClick('/emergency-services')} 
            className={styles.sidebarLinkButton}
          >
            🚨 Emergency Services
          </button>
          <button 
            type="button"
            onClick={() => handleLinkClick('/medicine-delivery')} 
            className={styles.sidebarLinkButton}
          >
            💊 Medicine Delivery
          </button>
          {isAuthenticated && (
            <>
              {user?.role === 'patient' && (
                <>
                  <button 
                    type="button"
                    onClick={() => handleLinkClick('/patient-dashboard')} 
                    className={styles.sidebarLinkButton}
                  >
                    Patient Dashboard
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleLinkClick('/appointments')} 
                    className={styles.sidebarLinkButton}
                  >
                    My Appointments
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleLinkClick('/medical-records')} 
                    className={styles.sidebarLinkButton}
                  >
                    Medical Records
                  </button>
                </>
              )}
              {user?.role === 'doctor' && (
                <>
                  <button 
                    type="button"
                    onClick={() => handleLinkClick('/doctor-dashboard')} 
                    className={styles.sidebarLinkButton}
                  >
                    Doctor Dashboard
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleLinkClick('/doctor-availability')} 
                    className={styles.sidebarLinkButton}
                  >
                    📅 Availability Heatmap
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleLinkClick('/appointments')} 
                    className={styles.sidebarLinkButton}
                  >
                    My Appointments
                  </button>
                </>
              )}
              {user?.role === 'admin' && (
                <button 
                  type="button"
                  onClick={() => handleLinkClick('/admin-dashboard')} 
                  className={styles.sidebarLinkButton}
                >
                  Admin Dashboard
                </button>
              )}
            </>
          )}
        </div>
        
        <div className={styles.sidebarFooter}>
          {isAuthenticated ? (
            <button className={styles.sidebarLoginButton} onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className={styles.sidebarLoginButton} onClick={goToLogin}>
              Login / Sign Up →
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
