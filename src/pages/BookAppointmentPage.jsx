import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './BookAppointmentPage.module.css';
import { doctors, hospitals, departments, appointments as initialAppointments } from '../utils/mockData';

const BookAppointmentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const doctorId = searchParams.get('doctorId');
  const hospitalId = searchParams.get('hospitalId');

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
    '4:30 PM', '5:00 PM'
  ];

  // Smart slot suggestion algorithm
  const getSmartSlotSuggestions = (doctorId, selectedDate) => {
    if (!doctorId || !selectedDate) return [];
    
    const doctorAppointments = initialAppointments.filter(
      apt => apt.doctorId === doctorId && apt.date === selectedDate && apt.status === 'upcoming'
    );
    const bookedTimes = doctorAppointments.map(apt => apt.time);
    
    // Suggest slots with least bookings (early morning, late afternoon typically have fewer bookings)
    const slotScores = timeSlots.map(slot => {
      const isBooked = bookedTimes.includes(slot);
      let score = isBooked ? 1000 : 0; // Prefer unbooked slots
      
      // Prefer morning slots (less traffic)
      const hour = parseInt(slot.split(':')[0]);
      const period = slot.includes('AM') ? 'AM' : 'PM';
      if (period === 'AM' && hour >= 9 && hour <= 11) {
        score += 10; // Morning preference
      } else if (period === 'PM' && hour >= 2 && hour <= 4) {
        score += 5; // Afternoon preference
      } else {
        score += 2;
      }
      
      return { slot, score };
    });
    
    // Sort by score and return top 3 suggestions
    slotScores.sort((a, b) => a.score - b.score);
    return slotScores.slice(0, 3).map(item => item.slot);
  };

  useEffect(() => {
    if (doctorId) {
      const doctor = doctors.find(d => d.id === parseInt(doctorId));
      if (doctor) {
        setSelectedDoctor(doctor);
        const hospital = hospitals.find(h => h.id === doctor.hospitalId);
        setSelectedHospital(hospital);
      }
    } else if (hospitalId) {
      const hospital = hospitals.find(h => h.id === parseInt(hospitalId));
      setSelectedHospital(hospital);
      const hospitalDoctors = doctors.filter(d => d.hospitalId === hospital.id);
      setAvailableDoctors(hospitalDoctors);
    } else {
      setAvailableDoctors(doctors);
    }
  }, [doctorId, hospitalId]);

  useEffect(() => {
    if (selectedDepartment) {
      const filtered = selectedHospital
        ? doctors.filter(d => 
            d.hospitalId === selectedHospital.id && 
            d.specialty.toLowerCase() === departments.find(dept => dept.id === parseInt(selectedDepartment))?.name.toLowerCase()
          )
        : doctors.filter(d => 
            d.specialty.toLowerCase() === departments.find(dept => dept.id === parseInt(selectedDepartment))?.name.toLowerCase()
          );
      setAvailableDoctors(filtered);
    } else if (selectedHospital && !doctorId) {
      const hospitalDoctors = doctors.filter(d => d.hospitalId === selectedHospital.id);
      setAvailableDoctors(hospitalDoctors);
    }
  }, [selectedDepartment, selectedHospital]);

  useEffect(() => {
    if (selectedDoctor && date) {
      const suggestions = getSmartSlotSuggestions(selectedDoctor.id, date);
      setSuggestedSlots(suggestions);
      setShowSuggestions(suggestions.length > 0);
      
      // Auto-select first suggestion if no time is selected
      if (!time && suggestions.length > 0) {
        setTime(suggestions[0]);
      }
    } else {
      setSuggestedSlots([]);
      setShowSuggestions(false);
    }
  }, [selectedDoctor, date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the appointment request to the backend
    alert('Appointment booked successfully!');
    navigate('/patient-dashboard');
  };

  const handleHospitalChange = (e) => {
    const hospital = hospitals.find(h => h.id === parseInt(e.target.value));
    setSelectedHospital(hospital);
    setSelectedDoctor(null);
    if (hospital) {
      const hospitalDoctors = doctors.filter(d => d.hospitalId === hospital.id);
      setAvailableDoctors(hospitalDoctors);
    } else {
      setAvailableDoctors(doctors);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    const hospital = hospitals.find(h => h.id === doctor.hospitalId);
    setSelectedHospital(hospital);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Book Appointment</h1>
        <p className={styles.subtitle}>Schedule your visit with our healthcare professionals</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {!doctorId && (
          <>
            <div className={styles.formGroup}>
              <label className={styles.label}>Select Hospital (Optional)</label>
              <select
                className={styles.select}
                value={selectedHospital?.id || ''}
                onChange={handleHospitalChange}
              >
                <option value="">All Hospitals</option>
                {hospitals.map(hospital => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Select Department (Optional)</label>
              <select
                className={styles.select}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.icon} {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {!selectedDoctor && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Select Doctor</label>
                <div className={styles.doctorsGrid}>
                  {availableDoctors.map(doctor => (
                    <div
                      key={doctor.id}
                      className={`${styles.doctorCard} ${selectedDoctor?.id === doctor.id ? styles.selected : ''}`}
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      <img src={doctor.image} alt={doctor.name} className={styles.doctorImage} />
                      <div className={styles.doctorInfo}>
                        <h3>{doctor.name}</h3>
                        <p>{doctor.specialty}</p>
                        <p className={styles.rating}>⭐ {doctor.rating} ({doctor.reviews} reviews)</p>
                        <p className={styles.fee}>${doctor.consultationFee}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {availableDoctors.length === 0 && (
                  <p className={styles.noDoctors}>No doctors available for the selected filters</p>
                )}
              </div>
            )}
          </>
        )}

        {selectedDoctor && (
          <div className={styles.selectedDoctor}>
            <h3>Selected Doctor</h3>
            <div className={styles.doctorDisplay}>
              <img src={selectedDoctor.image} alt={selectedDoctor.name} className={styles.doctorImage} />
              <div>
                <h4>{selectedDoctor.name}</h4>
                <p>{selectedDoctor.specialty}</p>
                <p>{selectedHospital?.name}</p>
              </div>
              <button
                type="button"
                className={styles.changeButton}
                onClick={() => {
                  setSelectedDoctor(null);
                  if (doctorId) navigate('/book-appointment');
                }}
              >
                Change
              </button>
            </div>
          </div>
        )}

        {selectedDoctor && (
          <>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Select Date *</label>
                <input
                  type="date"
                  className={styles.input}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Select Time *</label>
                {showSuggestions && suggestedSlots.length > 0 && (
                  <div className={styles.smartSuggestions}>
                    <span className={styles.suggestionLabel}>💡 Smart Suggestions:</span>
                    <div className={styles.suggestionChips}>
                      {suggestedSlots.map((suggestedSlot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`${styles.suggestionChip} ${time === suggestedSlot ? styles.activeSuggestion : ''}`}
                          onClick={() => setTime(suggestedSlot)}
                        >
                          {suggestedSlot}
                          {idx === 0 && <span className={styles.bestLabel}>Best</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <select
                  className={styles.select}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                >
                  <option value="">Select a time</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Reason for Visit *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g., Regular checkup, symptoms..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Additional Notes (Optional)</label>
              <textarea
                className={styles.textarea}
                placeholder="Any additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Confirm Appointment →
            </button>
          </>
        )}

        {!selectedDoctor && availableDoctors.length === 0 && (
          <div className={styles.message}>
            Please select a hospital and/or department to see available doctors
          </div>
        )}
      </form>
    </div>
  );
};

export default BookAppointmentPage;
