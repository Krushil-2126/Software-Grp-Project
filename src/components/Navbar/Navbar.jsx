import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          <Link to="/" onClick={() => handleLinkClick('/')}>Home</Link>
          <div onClick={() => handleLinkClick('/hospitals')} style={{ cursor: 'pointer' }}>Hospitals</div>
          <div onClick={() => handleLinkClick('/doctor-locator')} style={{ cursor: 'pointer' }}>Find Doctors</div>
          <div onClick={() => handleLinkClick('/medicine-ai')} style={{ cursor: 'pointer' }}>AI Medicine Suggestion</div>
          <div onClick={() => handleLinkClick('/book-appointment')} style={{ cursor: 'pointer' }}>Book Appointment</div>
          <div onClick={() => handleLinkClick('/emergency-services')} style={{ cursor: 'pointer' }}>🚨 Emergency Services</div>
          <div onClick={() => handleLinkClick('/medicine-delivery')} style={{ cursor: 'pointer' }}>💊 Medicine Delivery</div>
          {isAuthenticated && (
            <>
              {user?.role === 'patient' && (
                <>
                  <div onClick={() => handleLinkClick('/patient-dashboard')} style={{ cursor: 'pointer' }}>Patient Dashboard</div>
                  <div onClick={() => handleLinkClick('/appointments')} style={{ cursor: 'pointer' }}>My Appointments</div>
                  <div onClick={() => handleLinkClick('/medical-records')} style={{ cursor: 'pointer' }}>Medical Records</div>
                </>
              )}
              {user?.role === 'doctor' && (
                <>
                  <div onClick={() => handleLinkClick('/doctor-dashboard')} style={{ cursor: 'pointer' }}>Doctor Dashboard</div>
                  <div onClick={() => handleLinkClick('/doctor-availability')} style={{ cursor: 'pointer' }}>📅 Availability Heatmap</div>
                  <div onClick={() => handleLinkClick('/appointments')} style={{ cursor: 'pointer' }}>My Appointments</div>
                </>
              )}
              {user?.role === 'admin' && (
                <div onClick={() => handleLinkClick('/admin-dashboard')} style={{ cursor: 'pointer' }}>Admin Dashboard</div>
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
