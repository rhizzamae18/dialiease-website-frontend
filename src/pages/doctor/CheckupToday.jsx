import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserInjured, 
  FaCalendarAlt,
  FaSearch,
  FaSync,
  FaStethoscope,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaClock
} from 'react-icons/fa';
import { BsClock } from 'react-icons/bs';
import styled from 'styled-components';

const API_BASE_URL = 'http://localhost:8000/api';

const colors = {
  primary: '#395886', 
  secondary: '#638ECB',
  white: '#FFFFFF',
  green: '#477977',
  lightGreen: '#e6f0ef',
  lightBlue: '#e9f0f8',
  gray: '#718096',
  lightGray: '#f7fafc',
  border: '#e2e8f0',
  red: '#e53e3e',
  lightRed: '#fed7d7',
  yellow: '#d69e2e',
  lightYellow: '#feebc8'
};

// Notification Component
const Notification = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: ${props => {
    switch(props.$type) {
      case 'success': return colors.lightGreen;
      case 'error': return colors.lightRed;
      case 'warning': return colors.lightYellow;
      default: return colors.lightBlue;
    }
  }};
  color: ${props => {
    switch(props.$type) {
      case 'success': return colors.green;
      case 'error': return colors.red;
      case 'warning': return colors.yellow;
      default: return colors.primary;
    }
  }};
  border: 1px solid ${props => {
    switch(props.$type) {
      case 'success': return colors.green;
      case 'error': return colors.red;
      case 'warning': return colors.yellow;
      default: return colors.primary;
    }
  }};
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const Container = styled.div`
  background-color: ${colors.white};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid ${colors.border};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${colors.border};
`;

const Title = styled.h2`
  color: ${colors.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: ${colors.white};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  border: 1px solid ${colors.border};
  width: 300px;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(57, 88, 134, 0.1);
  }
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  outline: none;
  font-size: 0.9rem;
  color: #374151;
  padding-left: 0.5rem;

  &::placeholder {
    color: #9ca3af;
  }
`;

const RefreshButton = styled.button`
  background-color: ${colors.white};
  color: ${colors.primary};
  border: 1px solid ${colors.primary};
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${colors.primary};
    color: ${colors.white};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PatientList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PatientItem = styled.div`
  background-color: ${colors.white};
  border-radius: 8px;
  padding: 1.25rem;
  border: 1px solid ${colors.border};
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: ${colors.primary};
  }
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const QueueNumber = styled.div`
  background-color: ${colors.primary};
  color: ${colors.white};
  border-radius: 8px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const PatientDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const PatientName = styled.h3`
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 1.1rem;
`;

const PatientMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: ${colors.gray};
  align-items: center;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => {
    switch(props.$status) {
      case 'not yet check': return colors.lightBlue;
      case 'completed': return colors.lightGreen;
      case 'cancelled': return '#FEF2F2';
      case 'in-progress': return colors.lightYellow;
      default: return '#F3F4F6';
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'not yet check': return colors.primary;
      case 'completed': return colors.green;
      case 'cancelled': return '#ef4444';
      case 'in-progress': return colors.yellow;
      default: return colors.gray;
    }
  }};
`;

const CheckButton = styled.button`
  background-color: ${colors.primary};
  color: ${colors.white};
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-weight: 600;

  &:hover {
    background-color: ${colors.secondary};
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: ${colors.gray};
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: ${colors.gray};
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${colors.lightBlue};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: ${colors.primary};
  font-size: 2rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  flex-direction: column;
  gap: 1rem;
`;

const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${colors.gray};
  background-color: ${colors.lightGray};
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  margin-top: 0.5rem;
`;

const CheckupToday = ({ onClose }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [processingPatient, setProcessingPatient] = useState(null);
  const navigate = useNavigate();

  // Show notification function
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    // Auto hide after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Close notification function
  const closeNotification = () => {
    setNotification(null);
  };

  // Convert UTC to Philippine Time (UTC+8)
  const convertToPHTime = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      // Add 8 hours to convert UTC to Philippine Time
      const phTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
      return phTime;
    } catch (error) {
      console.error('Error converting to PH time:', error);
      return null;
    }
  };

  // Format time to Philippine time (12-hour format with AM/PM)
  const formatPHTime = (dateString) => {
    const phTime = convertToPHTime(dateString);
    if (!phTime) return 'Not started';
    
    return phTime.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date to Philippine format
  const formatPHDate = (dateString) => {
    const phTime = convertToPHTime(dateString);
    if (!phTime) return 'N/A';
    
    return phTime.toLocaleDateString('en-PH', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchAssignedPatients = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_BASE_URL}/doctor/assigned-patients`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      console.log('Fetched assigned patients:', response.data);
      
      const filteredPatients = (response.data.patients || []).filter(
        patient => patient.checkup_status !== 'Completed'
      );
      
      setPatients(filteredPatients);
      
      if (filteredPatients.length === 0) {
        showNotification('No patients assigned for checkup today', 'info');
      } else {
        showNotification(`Loaded ${filteredPatients.length} patients for today's checkups`, 'success');
      }
      
    } catch (error) {
      console.error('Error fetching assigned patients:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load patient data. Please check your connection.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignedPatients();
    
    const interval = setInterval(fetchAssignedPatients, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckPatient = async (patient) => {
    try {
      setProcessingPatient(patient.queue_id);
      console.log('Checking patient:', patient);
      
      // Use the CORRECT patient_id from the patients table
      const patientId = patient.patient_id;
      
      if (!patientId) {
        console.error('Patient ID is missing!', patient);
        showNotification('Error: Patient ID is missing. Please refresh and try again.', 'error');
        setProcessingPatient(null);
        return;
      }

      // Update queue status to in-progress if not already
      if (patient.status !== 'in-progress') {
        await axios.post(`${API_BASE_URL}/staff/update-queue-status`, 
          { 
            queue_id: patient.queue_id, 
            status: 'in-progress',
            doctor_id: JSON.parse(localStorage.getItem("user")).userID
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
      }

      showNotification(`Opening patient record for ${patient.patient_name}`, 'success');
      
      navigate(`/prescription/${patientId}`, { 
        state: { 
          patientName: patient.patient_name,
          hospitalNumber: patient.hospital_number,
          queueId: patient.queue_id,
          patientData: patient
        } 
      });
      
    } catch (error) {
      console.error('Error starting patient checkup:', error);
      const errorMessage = error.response?.data?.message || 'Failed to start patient checkup. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setProcessingPatient(null);
    }
  };

  const filteredPatients = patients
    .filter(patient => patient.checkup_status !== 'Completed')
    .filter(patient => 
      patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.hospital_number && patient.hospital_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const renderEmptyState = () => {
    return (
      <EmptyState>
        <EmptyStateIcon>
          <FaUserInjured />
        </EmptyStateIcon>
        <h3 style={{ margin: '0.5rem 0', color: colors.primary }}>
          {searchTerm ? 'No matching patients found' : 'No patients assigned today'}
        </h3>
        <p style={{ margin: 0 }}>
          {searchTerm ? 'Try adjusting your search criteria' : 'All clear for today. No assigned patients or all checkups completed.'}
        </p>
        {!searchTerm && (
          <RefreshButton
            onClick={fetchAssignedPatients}
            disabled={refreshing}
            style={{ marginTop: '1rem' }}
          >
            <FaSync style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Check for New Patients
          </RefreshButton>
        )}
      </EmptyState>
    );
  };

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'in-progress':
        return { text: 'In Progress', type: 'in-progress' };
      case 'completed':
        return { text: 'Completed', type: 'completed' };
      case 'cancelled':
        return { text: 'Cancelled', type: 'cancelled' };
      default:
        return { text: 'Not Yet Checked', type: 'not yet check' };
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '40px',
            width: '40px',
            border: `3px solid ${colors.primary}`,
            borderTopColor: 'transparent'
          }}></div>
          <p style={{ color: colors.gray, margin: 0 }}>Loading today's patients...</p>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <>
      {/* Notification */}
      {notification && (
        <Notification $type={notification.type}>
          {notification.type === 'success' && <FaCheckCircle />}
          {notification.type === 'error' && <FaExclamationTriangle />}
          {notification.type === 'warning' && <FaExclamationTriangle />}
          <span>{notification.message}</span>
          <CloseButton onClick={closeNotification}>
            <FaTimes />
          </CloseButton>
        </Notification>
      )}

      <Container>
        <Header>
          <div>
            <Title>
              <FaCalendarAlt />
              Today's Checkups
              <span style={{ 
                backgroundColor: colors.primary, 
                color: colors.white,
                borderRadius: '10px',
                padding: '0.2rem 0.6rem',
                fontSize: '0.9rem',
                marginLeft: '0.5rem'
              }}>
                {filteredPatients.length}
              </span>
            </Title>
            <TimeInfo>
              <FaClock size={12} />
              Philippine Time: {new Date().toLocaleTimeString('en-PH', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })} • {new Date().toLocaleDateString('en-PH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </TimeInfo>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <SearchContainer>
              <FaSearch style={{ color: '#9ca3af' }} />
              <SearchInput
                type="text"
                placeholder="Search by name or hospital ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
            
            <RefreshButton
              onClick={fetchAssignedPatients}
              disabled={refreshing}
            >
              <FaSync style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </RefreshButton>
          </div>
        </Header>

        {filteredPatients.length === 0 ? (
          renderEmptyState()
        ) : (
          <PatientList>
            {filteredPatients.map((patient) => {
              const statusInfo = getStatusDisplay(patient.status);
              
              return (
                <PatientItem key={patient.queue_id}>
                  <PatientInfo>
                    <QueueNumber>
                      {patient.queue_number}
                    </QueueNumber>
                    <PatientDetails>
                      <PatientName>
                        {patient.patient_name}
                      </PatientName>
                      <PatientMeta>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <BsClock style={{ color: colors.gray }} /> 
                          Hospital ID: {patient.hospital_number || 'N/A'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: colors.gray }}>
                          Patient ID: {patient.patient_id}
                        </span>
                        <StatusBadge $status={statusInfo.type}>
                          {statusInfo.text}
                        </StatusBadge>
                        {patient.start_time && (
                          <span style={{ fontSize: '0.7rem', color: colors.gray }}>
                            Started: {formatPHTime(patient.start_time)}
                          </span>
                        )}
                      </PatientMeta>
                    </PatientDetails>
                  </PatientInfo>
                  
                  <CheckButton 
                    onClick={() => handleCheckPatient(patient)}
                    disabled={processingPatient === patient.queue_id}
                  >
                    <FaStethoscope />
                    {processingPatient === patient.queue_id ? 'Opening...' : 'Check Patient'}
                    <FaArrowRight />
                  </CheckButton>
                </PatientItem>
              );
            })}
          </PatientList>
        )}

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Container>
    </>
  );
};

export default CheckupToday;