import React, { useState, useEffect } from 'react';
import {
  FaCheckCircle,
  FaTimes,
  FaCalendarAlt,
  FaUser,
  FaIdCard,
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSearch,
  FaFilter,
  FaSync
} from 'react-icons/fa';
import { format, parseISO, isToday, isFuture, startOfDay, endOfDay } from 'date-fns';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:8000/api';

const ConfirmedPatientDashboard = ({ onClose, fetchDashboardData }) => {
  const [confirmedPatients, setConfirmedPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Format PH time (12-hour format with AM/PM)
  const formatPHTime = (date) => {
    return date.toLocaleTimeString('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format PH date (short version)
  const formatPHDateShort = (date) => {
    return date.toLocaleDateString('en-PH', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Combined date and time in one line
  const formatDateTime = (date) => {
    return `${formatPHDateShort(date)} • ${formatPHTime(date)}`;
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchConfirmedPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/staff/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data');
      }

      const data = await response.json();

      if (!data.allSchedules) {
        throw new Error('Invalid data structure from server');
      }

      // Immediately filter confirmed patients with appointment dates
      const filtered = data.allSchedules.filter(patient => 
        patient.confirmation_status === 'confirmed' && patient.appointment_date
      );

      setConfirmedPatients(filtered);
      setLastFetched(new Date());
      
      // Immediately apply today's filter
      const todayPatients = filtered.filter(patient => 
        isToday(parseISO(patient.appointment_date))
      );
      setFilteredPatients(todayPatients);
      
    } catch (error) {
      setError(error.message || 'Failed to load confirmed appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfirmedPatients();
  }, []);

  useEffect(() => {
    let results = [...confirmedPatients];
    
    // Apply filter type
    if (filterType === 'today') {
      results = results.filter(patient => 
        isToday(parseISO(patient.appointment_date))
      );
    } else if (filterType === 'upcoming') {
      results = results.filter(patient => 
        isFuture(parseISO(patient.appointment_date)) && !isToday(parseISO(patient.appointment_date))
      );
    } else if (filterType === 'dateRange' && showDateFilter) {
      results = results.filter(patient => {
        const appointmentDate = parseISO(patient.appointment_date);
        const startDate = startOfDay(parseISO(dateRange.start));
        const endDate = endOfDay(parseISO(dateRange.end));
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });
    }
    
    // Apply search term
    const lowerSearch = searchTerm.toLowerCase();
    results = results.filter(patient =>
      `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase().includes(lowerSearch) ||
      (patient.hospitalNumber && patient.hospitalNumber.toLowerCase().includes(lowerSearch))
    );
    
    setFilteredPatients(results);
  }, [searchTerm, confirmedPatients, filterType, dateRange, showDateFilter]);

  const handleRefresh = async () => {
    try {
      await fetchConfirmedPatients();
      await fetchDashboardData();
    } catch (err) {
      setError('Failed to refresh data. Please try again.');
    }
  };

  // Format appointment date for display
  const formatAppointmentDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    return formatPHDateShort(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backdropFilter: 'blur(6px)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Segoe UI, sans-serif',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: '#f8fafc',
          gap: '16px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px',
            flex: 1 
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              <FaCheckCircle style={{ fontSize: '20px', color: '#059669' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                flexWrap: 'wrap',
                marginBottom: '4px'
              }}>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '20px', 
                  color: '#1f2937', 
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  Confirmed Appointments Dashboard
                </h2>
                
                {/* Current Date & Time Display - Beside the title */}
                <div style={{
                  backgroundColor: '#6ca780ff',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  marginLeft: '8px'
                }}>
                  <FaCalendarAlt size={10} />
                  {formatDateTime(currentDateTime)}
                </div>
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '13px', 
                color: '#6b7280',
                marginTop: '2px'
              }}>
                View and manage confirmed appointments
              </p>
            </div>
          </div>
          
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            color: '#6b7280',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            <FaTimes />
          </button>
        </div>

        {/* Dashboard Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          padding: '20px 24px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderLeft: '4px solid #059669'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Confirmed</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{confirmedPatients.length}</div>
          </div>
          
          <div style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderLeft: '4px solid #10b981'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Today's Appointments</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {confirmedPatients.filter(patient => isToday(parseISO(patient.appointment_date))).length}
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderLeft: '4px solid #f59e0b'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Upcoming Appointments</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {confirmedPatients.filter(patient => 
                isFuture(parseISO(patient.appointment_date)) && !isToday(parseISO(patient.appointment_date))).length}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap',
            alignItems: 'center',
            marginRight: 'auto'
          }}>
            <button
              onClick={() => {setFilterType('today'); setShowDateFilter(false);}}
              style={{
                padding: '8px 16px',
                backgroundColor: filterType === 'today' ? '#059669' : '#f3f4f6',
                color: filterType === 'today' ? '#fff' : '#4b5563',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaClock /> Today
            </button>
            <button
              onClick={() => {setFilterType('upcoming'); setShowDateFilter(false);}}
              style={{
                padding: '8px 16px',
                backgroundColor: filterType === 'upcoming' ? '#059669' : '#f3f4f6',
                color: filterType === 'upcoming' ? '#fff' : '#4b5563',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaCalendarAlt /> Upcoming
            </button>
            <button
              onClick={() => {setFilterType('dateRange'); setShowDateFilter(!showDateFilter);}}
              style={{
                padding: '8px 16px',
                backgroundColor: filterType === 'dateRange' ? '#059669' : '#f3f4f6',
                color: filterType === 'dateRange' ? '#fff' : '#4b5563',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaFilter /> Date Range
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#fff',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            flex: '1',
            minWidth: '250px',
            maxWidth: '400px',
            marginRight: '16px'
          }}>
            <FaSearch style={{ color: '#9ca3af', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by name or HN..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                marginLeft: '8px',
                width: '100%',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            onClick={handleRefresh}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
              whiteSpace: 'nowrap'
            }}
          >
            <FaSync /> Refresh
          </button>
        </div>

        {/* Date Range Filter */}
        {showDateFilter && (
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>From:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({...dateRange, start: e.target.value})}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>To:</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({...dateRange, end: e.target.value})}
                style={{
                  padding: '6px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {error ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#dc2626', 
              padding: '40px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FaExclamationTriangle size={30} />
              <h4 style={{ margin: 0 }}>Error Loading Data</h4>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          ) : loading ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              padding: '40px 20px' 
            }}>
              Loading patient data...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              padding: '40px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FaCheckCircle size={48} style={{ opacity: 0.5 }} />
              <p style={{ margin: 0 }}>
                No confirmed patients {filterType === 'today' ? 'for today' : 
                filterType === 'upcoming' ? 'in the upcoming days' : 
                'in the selected date range'}.
              </p>
            </div>
          ) : (
            <div style={{ padding: '0' }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr',
                gap: '16px',
                padding: '12px 24px',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: 600,
                fontSize: '14px',
                color: '#374151'
              }}>
                <div>Patient Information</div>
                <div>Hospital Number</div>
                <div>Appointment Date</div>
              </div>
              
              {/* Patient List */}
              {filteredPatients.map((patient, index) => (
                <div key={index} style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr',
                  gap: '16px',
                  padding: '16px 24px',
                  borderBottom: '1px solid #f3f4f6',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: '#fafafa'
                  }
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#d1fae5',
                      color: '#059669',
                      fontWeight: 600,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                    </div>
                    <div style={{ 
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {patient.first_name} {patient.last_name}
                    </div>
                  </div>
                  
                  <div style={{ color: '#6b7280' }}>
                    {patient.hospitalNumber || 'N/A'}
                  </div>
                  
                  <div style={{ 
                    color: '#6b7280', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px'
                  }}>
                    <FaCalendarAlt size={12} />
                    {formatAppointmentDate(patient.appointment_date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
            Showing {filteredPatients.length} of {confirmedPatients.length} confirmed appointments
            {lastFetched && ` • Last updated: ${formatPHTime(lastFetched)}`}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmedPatientDashboard;