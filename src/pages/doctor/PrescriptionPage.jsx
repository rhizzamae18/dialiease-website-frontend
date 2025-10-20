import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSearch, FaPlus, FaArrowLeft, 
  FaTimes, FaTrash, FaSave,
  FaClipboardList, FaPrescription, FaPills,
  FaCapsules, FaMicrophone, FaMicrophoneSlash,
  FaUser, FaIdCard, FaFileMedical, FaNotesMedical,
  FaExclamationTriangle
} from 'react-icons/fa';
import { BsPrescription2, BsDroplet } from 'react-icons/bs';
import { GiMedicines, GiMedicinePills } from 'react-icons/gi';
import styled, { keyframes } from 'styled-components';
import TabbedPrescriptionLayout from './TabbedPrescriptionLayout';
import AddNewMedsModal from './AddNewMedsModal';
import MedicineDetailsModal from './MedicineDetailsModal';
import PrescriptionSummaryModal from './PrescriptionSummaryModal';
import ReadyMedicinesModal from './ReadyMedicinesModal';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  width: 100%;
  overflow-x: hidden;
  margin-top: -290px;
`;

const MainWrapper = styled.div`
  max-width: 1720px;
  margin: 0 auto;
  padding: 1rem 2rem;

  @media (min-width: 1920px) {
    max-width: 2000px;
    padding: 1.5rem 3rem;
  }
`;

const Header = styled.header`
  margin-bottom: 1.5rem;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: ${slideIn} 0.6s ease-out;
  margin-bottom: 1.5rem;
`;

const BackButton = styled.button`
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #495057;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    border-color: #495057;
    background: #f8f9fa;
    transform: translateY(-1px);
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #212529;
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PageSubtitle = styled.p`
  font-size: 0.95rem;
  color: #6c757d;
  margin: 0;
  font-weight: 500;
`;

const PatientCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
  animation: ${fadeIn} 0.6s ease-out 0.1s both;
  position: relative;
  margin-bottom: 1rem;
`;

const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const PatientDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-1px);
    border-color: #adb5bd;
  }
`;

const DetailIcon = styled.div`
  color: #495057;
  font-size: 1rem;
  flex-shrink: 0;
  background: #e9ecef;
  color: #495057;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
`;

const DetailContent = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

const DetailLabel = styled.span`
  font-size: 0.7rem;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.2rem;
`;

const DetailValue = styled.span`
  font-size: 0.95rem;
  color: #212529;
  font-weight: 600;
  word-break: break-word;
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1rem;
  padding: 0.875rem 1rem;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  position: relative;
  overflow: hidden;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #495057;
  padding: 0.4rem 0.6rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #dee2e6;
`;

const StickyContainer = styled.div`
  position: sticky;
  top: 1rem;
  z-index: 1000;
  margin-bottom: 1rem;
`;

const StickyActionPanel = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #dee2e6;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
  flex-wrap: wrap;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    border-radius: 12px 12px 0 0;
    margin-bottom: 0;
    z-index: 1001;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 160px;
  flex: 1;
  max-width: 200px;

  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #495057;
          color: white;
          border-color: #495057;
          &:hover {
            background: #343a40;
            border-color: #343a40;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
        `;
      case 'secondary':
        return `
          background: white;
          color: #495057;
          border-color: #adb5bd;
          &:hover {
            border-color: #495057;
            background: #f8f9fa;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          border-color: #dc3545;
          &:hover {
            background: #c82333;
            border-color: #c82333;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
          }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          border-color: #28a745;
          &:hover {
            background: #218838;
            border-color: #218838;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
          }
        `;
      default:
        return `
          background: white;
          color: #495057;
          border-color: #dee2e6;
          &:hover {
            border-color: #adb5bd;
            background: #f8f9fa;
            transform: translateY(-2px);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  @media (max-width: 768px) {
    min-width: 100%;
    max-width: none;
  }
`;

const Badge = styled.span`
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 0.4rem;
`;

const SearchSection = styled.section`
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
  animation: ${fadeIn} 0.6s ease-out 0.3s both;
  width: 100%;
  position: relative;
`;

const SearchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: 700;
  color: #212529;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SearchStats = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.6rem 0.875rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  font-size: 0.8rem;
  color: #495057;
  font-weight: 600;
  min-width: 120px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const SearchInputContainer = styled.div`
  position: relative;
  width: 1095px;
  max-width: 90%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #082d52ff;
  border-radius: 50px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #d6f0f8ff;
  font-weight: 500;
  height: 56px;
  color: #11385fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:focus {
    outline: none;
    border-color: #495057;
    box-shadow: 0 4px 12px rgba(73, 80, 87, 0.15);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #0c0f13ff;
    font-weight: 400;
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1.1rem;
`;

const VoiceButton = styled.button`
  position: absolute;
  right: ${props => props.$hasText ? '3.5rem' : '1rem'};
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.$listening ? '#dc3545' : '#6c757d'};
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-50%) scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: #f8f9fa;
  color: #6c757d;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #e9ecef;
    color: #495057;
    transform: translateY(-50%) scale(1.05);
  }
`;

const SuggestionsPanel = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  margin-top: 0.75rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  max-height: 350px;
  overflow-y: auto;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
  width: 800px;
  max-width: 90%;
`;

const SuggestionItem = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;

  &:hover {
    background: #f8f9fa;
    transform: translateX(4px);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const MedicineInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MedicineName = styled.div`
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
`;

const MedicineGeneric = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.6rem;
  font-weight: 500;
`;

const MedicineMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const MetaTag = styled.span`
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  background: ${props => {
    switch (props.$type) {
      case 'generic': return '#d4edda';
      case 'dosage': return '#d1ecf1';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'generic': return '#155724';
      case 'dosage': return '#0c5460';
      default: return '#495057';
    }
  }};
  font-weight: 600;
  border: 1px solid;
  border-color: ${props => {
    switch (props.$type) {
      case 'generic': return '#c3e6cb';
      case 'dosage': return '#bee5eb';
      default: return '#dee2e6';
    }
  }};
`;

const AddButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.6rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 80px;
  height: 36px;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);

  &:hover {
    background: #218838;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.4);
  }
`;

const QuickActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
`;

const QuickLabel = styled.span`
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 600;
  white-space: nowrap;
`;

const QuickTag = styled.button`
  background: #ffffff;
  border: 1px solid #adb5bd;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    border-color: #495057;
    background: #495057;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const HelpText = styled.p`
  font-size: 0.8rem;
  color: #6c757d;
  text-align: center;
  margin-top: 1.25rem;
  font-weight: 500;
  line-height: 1.4;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
`;

const FloatingAction = styled(ActionButton)`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-radius: 50px;
  padding: 0.875rem 1.5rem;
  width: auto;
  min-width: 180px;
  animation: ${fadeIn} 0.5s ease-out;

  &:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3) !important;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ValidationError = styled.div`
  color: #dc3545;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8d7da;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
`;

const PrescriptionPage = () => {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['Paracetamol', 'Amoxicillin', 'Omeprazole', 'Atorvastatin', 'Metformin']);
  const [showReadyMedicinesModal, setShowReadyMedicinesModal] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Voice recognition state
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  const [prescriptionDetails, setPrescriptionDetails] = useState({
    patientID: parseInt(patientId),
    additionalInstructions: '',
    patientName: location.state?.patientName || 'Patient Name',
    hospitalNumber: location.state?.hospitalNumber || 'N/A',
    birthdate: location.state?.birthdate || 'N/A',
    sex: location.state?.sex || 'N/A',
    pd_data: {
      system: 'Baxter',
      modality: 'CAPD',
      totalExchanges: 3,
      fillVolume: '1.5',
      dwellTime: '',
      exchanges: [],
      bagPercentages: [],
      bagCounts: [],
      solutionConcentrations: ['', '', ''],
      visibleColumns: 3
    }
  });

  // Function to clean voice input - remove special characters
  const cleanVoiceInput = (text) => {
    return text
      .replace(/[.,!?;:()\[\]{}'"`~@#$%^&*_+=<>/\\|]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        setListening(true);
        toast.info('🎤 Listening... Speak now');
      };
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const cleanedText = cleanVoiceInput(transcript);
        setSearchTerm(cleanedText);
        setShowSuggestions(true);
        toast.success(`🔍 Searching: "${cleanedText}"`);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('🚫 Microphone access denied. Please allow microphone access.');
        } else {
          toast.error('❌ Voice search failed. Please try again.');
        }
        setListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 2) {
        searchMedicines();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const searchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/prescriptions/medicines/search?q=${encodeURIComponent(searchTerm)}`);
      setSuggestions(response.data);
      setShowSuggestions(true);
      setLoading(false); 
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to search medicines';
      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const toggleVoiceSearch = () => {
    if (!speechSupported) {
      toast.error('❌ Voice search is not supported in your browser');
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting voice recognition:', err);
        toast.error('❌ Failed to start voice search');
      }
    }
  };

  const openMedicineModal = (medicine) => {
    setSelectedMedicine(medicine);
    setShowMedicineModal(true);
  };

  const addMedicine = (medicineDetails) => {
    const isAlreadyAdded = selectedMedicines.some(m => m.medicine_id === medicineDetails.medicine_id);
    
    if (!isAlreadyAdded) {
      setSelectedMedicines(prev => [...prev, medicineDetails]);
      setSearchTerm('');
      setSuggestions([]);
      setShowSuggestions(false);
      setShowMedicineModal(false);
      setError(null);
      
      if (!recentSearches.includes(medicineDetails.name)) {
        setRecentSearches(prev => [medicineDetails.name, ...prev.slice(0, 4)]);
      }
      
      toast.success(`✅ ${medicineDetails.name} added to prescription`);
    } else {
      toast.info('ℹ️ Medicine already added to prescription');
    }
  };

  const updateMedicineDetails = (medicine_id, field, value) => {
    if (field === 'remove') {
      setSelectedMedicines(prev => prev.filter(medicine => medicine.medicine_id !== medicine_id));
    } else {
      setSelectedMedicines(prev => 
        prev.map(medicine => 
          medicine.medicine_id === medicine_id ? { ...medicine, [field]: value } : medicine
        )
      );
    }
  };

  const removeMedicineFromSummary = (medicine_id) => {
    setSelectedMedicines(prev => prev.filter(medicine => medicine.medicine_id !== medicine_id));
    toast.success('🗑️ Medicine removed from prescription');
  };

  const handleAddReadyMedicines = (medicines) => {
    const newMedicines = medicines.map(medicine => ({
      ...medicine,
      medicine_id: `ready_${medicine.ready_medicine_id}`,
      id: `ready_${medicine.ready_medicine_id}`
    }));
    
    setSelectedMedicines(prev => {
      // Filter out duplicates
      const existingIds = new Set(prev.map(m => m.medicine_id));
      const uniqueNewMedicines = newMedicines.filter(m => !existingIds.has(m.medicine_id));
      
      return [...prev, ...uniqueNewMedicines];
    });
  };

  const validatePrescription = () => {
    const errors = {};
    
    // Check if any medicines are selected
    if (selectedMedicines.length === 0) {
      errors.medicines = 'At least one medicine is required';
      return errors;
    }
    
    // Validate each medicine has required fields
    selectedMedicines.forEach((medicine, index) => {
      if (!medicine.dosage || medicine.dosage.trim() === '') {
        errors[`medicine_${index}_dosage`] = `Dosage is required for ${medicine.name}`;
      }
      if (!medicine.frequency || medicine.frequency.trim() === '') {
        errors[`medicine_${index}_frequency`] = `Frequency is required for ${medicine.name}`;
      }
      if (!medicine.duration || medicine.duration.trim() === '') {
        errors[`medicine_${index}_duration`] = `Duration is required for ${medicine.name}`;
      }
    });
    
    return errors;
  };

 const handleSavePrescription = async () => {
  // Clear previous errors
  setError(null);
  setValidationErrors({});
  
  // Validate prescription
  const validationErrors = validatePrescription();
  if (Object.keys(validationErrors).length > 0) {
    setValidationErrors(validationErrors);
    toast.error('❌ Please fix the validation errors before saving');
    return;
  }

  try {
    setSaving(true);
    
    const pdData = prescriptionDetails.pd_data || {};
    const solutionConcentrations = pdData.solutionConcentrations || [];
    
    const nonEmptyConcentrations = solutionConcentrations.filter(conc => conc && conc.trim() !== '');
    const totalExchanges = nonEmptyConcentrations.length;
    const exchangesString = nonEmptyConcentrations.join(', ');
    
    // Prepare medicines data with proper validation
    const medicinesData = selectedMedicines.map(med => {
      let medicineId = med.medicine_id || med.id;
      
      console.log('Processing medicine:', {
        originalId: medicineId,
        type: typeof medicineId,
        medicine: med
      });

      // Convert to number regardless of source
      if (typeof medicineId === 'string') {
        // Remove any prefixes and convert to number
        medicineId = parseInt(medicineId.replace(/[^\d]/g, ''), 10);
      }
      
      // Ensure it's a valid number
      if (isNaN(medicineId)) {
        console.error('Invalid medicine ID:', med.medicine_id, 'from medicine:', med);
        throw new Error(`Invalid medicine ID for ${med.name}`);
      }

      return {
        medicine_id: medicineId,
        dosage: med.dosage.toString(),
        frequency: med.frequency.toString(),
        duration: med.duration.toString(),
        instructions: med.instructions?.toString() || ''
      };
    });

    console.log('Transformed medicines data:', medicinesData);

    const prescriptionData = {
      patientID: prescriptionDetails.patientID,
      medicines: medicinesData,
      additional_instructions: prescriptionDetails.additionalInstructions || '',
      pd_data: {
        system: pdData.system || 'Baxter',
        modality: pdData.modality || 'CAPD',
        totalExchanges: totalExchanges,
        fillVolume: pdData.fillVolume || '1.5',
        dwellTime: pdData.dwellTime || '',
        exchanges: exchangesString,
        bagPercentages: pdData.bagPercentages ? pdData.bagPercentages.join(', ') : '',
        bagCounts: pdData.bagCounts ? pdData.bagCounts.join(', ') : ''
      }
    };

    console.log('Final prescription data to send:', prescriptionData);

    const response = await api.post('/prescriptions/save', prescriptionData);
    
    if (response.data.success) {
      toast.success('✅ Prescription saved successfully!');
      setTimeout(() => navigate(-1), 1500);
    } else {
      const errorMsg = response.data.message || 'Failed to save prescription';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    }
  } catch (err) {
    console.error('Save prescription error:', err);
    console.error('Error response:', err.response?.data);
    
    // Enhanced error handling
    let errorMessage = 'Failed to save prescription';
    
    if (err.response?.status === 422) {
      const validationErrors = err.response.data.errors;
      errorMessage = 'Validation errors: ';
      
      if (validationErrors) {
        Object.keys(validationErrors).forEach(key => {
          errorMessage += `${key}: ${validationErrors[key].join(', ')}. `;
        });
      } else {
        errorMessage = 'Validation failed. Please check all fields.';
      }
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    toast.error(`❌ ${errorMessage}`);
  } finally {
    setSaving(false);
  }
};

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all medicines from this prescription?')) {
      setSelectedMedicines([]);
      setError(null);
      setValidationErrors({});
      toast.info('🗑️ All medicines cleared from prescription');
    }
  };

  const handleAddNewMedicine = async (newMedicine) => {
    try {
      setError(null);
      const response = await api.post('/prescriptions/medicines', newMedicine);
      openMedicineModal(response.data.medicine);
      setShowAddModal(false);
      toast.success('✅ Medicine added successfully!');
    } catch (err) {
      console.error('Add medicine error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add new medicine';
      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
    }
  };

  const handleRecentSearch = (term) => {
    setSearchTerm(term);
    setError(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <Container>
      <MainWrapper>
        <Header>
          <PageHeader>
            <BackButton onClick={() => navigate(-1)}>
              <FaArrowLeft size="1em" />
            </BackButton>
            <HeaderContent>
              <PageTitle>
                <BsPrescription2 size="1.2em" />
                Create New Prescription
              </PageTitle>
              <PageSubtitle>
                For {prescriptionDetails.patientName} • Hospital No: {prescriptionDetails.hospitalNumber}
              </PageSubtitle>
            </HeaderContent>
          </PageHeader>

          {/* Error Display */}
          {error && (
            <ErrorMessage>
              <FaExclamationTriangle />
              {error}
            </ErrorMessage>
          )}

          {/* Validation Errors */}
          {Object.keys(validationErrors).length > 0 && (
            <div>
              {Object.entries(validationErrors).map(([key, errorMsg]) => (
                <ValidationError key={key}>
                  <FaExclamationTriangle size="0.8em" />
                  {errorMsg}
                </ValidationError>
              ))}
            </div>
          )}

          <PatientCard>
            <StatusBar>
              <StatusItem>
                <FaFileMedical />
                {selectedMedicines.length} Medicines Selected
              </StatusItem>
              <StatusItem>
                <FaNotesMedical />
                {suggestions.length} Search Results
              </StatusItem>
              <StatusItem>
                <BsDroplet />
                PD Prescription Active
              </StatusItem>
            </StatusBar>
            
            <PatientGrid>
              <PatientDetail>
                <DetailIcon>
                  <FaUser />
                </DetailIcon>
                <DetailContent>
                  <DetailLabel>Patient Name</DetailLabel>
                  <DetailValue>{prescriptionDetails.patientName}</DetailValue>
                </DetailContent>
              </PatientDetail>
              <PatientDetail>
                <DetailIcon>
                  <FaIdCard />
                </DetailIcon>
                <DetailContent>
                  <DetailLabel>Hospital Number</DetailLabel>
                  <DetailValue>{prescriptionDetails.hospitalNumber}</DetailValue>
                </DetailContent>
              </PatientDetail>
            </PatientGrid>
          </PatientCard>

          <StickyContainer>
            <StickyActionPanel>
              <ActionButton 
                $variant="secondary" 
                onClick={() => setShowSummaryModal(true)}
              >
                <FaClipboardList size="1em" />
                Prescription Summary
                {selectedMedicines.length > 0 && (
                  <Badge>{selectedMedicines.length}</Badge>
                )}
              </ActionButton>
              
              <ActionButton 
                $variant="success" 
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus size="0.9em" />
                Add New Medicine
              </ActionButton>
              
              <ActionButton 
                $variant="secondary" 
                onClick={() => setShowReadyMedicinesModal(true)}
              >
                <GiMedicinePills size="0.9em" />
                Ready-Made Medicines
              </ActionButton>
              
              {selectedMedicines.length > 0 && (
                <ActionButton 
                  $variant="danger" 
                  onClick={handleClearAll}
                >
                  <FaTrash size="0.9em" />
                  Clear All Medicines
                </ActionButton>
              )}
              
              <ActionButton 
                $variant="primary" 
                onClick={handleSavePrescription}
                disabled={selectedMedicines.length === 0 || saving}
              >
                {saving ? <Spinner size="small" /> : <FaSave size="0.9em" />}
                {saving ? 'Sending...' : 'Send Prescription'}
              </ActionButton>
            </StickyActionPanel>
          </StickyContainer>
        </Header>
        
        <SearchSection>
          <SearchHeader>
            <SearchTitle>
              <GiMedicines size="1.1em" />
              Medicine Search & Selection
            </SearchTitle>
            <SearchStats>
              <StatCard>
                <FaPills size="1em" />
                {suggestions.length} Results
              </StatCard>
              <StatCard>
                <FaCapsules size="1em" />
                {selectedMedicines.length} Selected
              </StatCard>
            </SearchStats>
          </SearchHeader>
          
          <SearchContainer>
            <SearchInputContainer>
              <SearchIcon />
              <SearchInput
                ref={searchInputRef}
                type="text"
                placeholder="Search medicines by name, generic name, or form..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length > 2 && setShowSuggestions(true)}
              />
              
              {speechSupported && (
                <VoiceButton
                  $listening={listening}
                  $hasText={searchTerm.length > 0}
                  onClick={toggleVoiceSearch}
                  disabled={loading}
                >
                  {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </VoiceButton>
              )}
              
              {searchTerm && (
                <ClearButton onClick={clearSearch}>
                  <FaTimes />
                </ClearButton>
              )}
            </SearchInputContainer>
            
            {showSuggestions && (
              <SuggestionsPanel>
                {loading ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Spinner size="medium" />
                    <div style={{ marginTop: '0.75rem', color: '#6c757d', fontSize: '0.8rem', fontWeight: '600' }}>
                      Searching medicine database...
                    </div>
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map(medicine => (
                    <SuggestionItem key={medicine.id} onClick={() => openMedicineModal(medicine)}>
                      <MedicineInfo>
                        <MedicineName>
                          {medicine.name}
                          {medicine.is_generic && (
                            <MetaTag $type="generic">
                              Generic
                            </MetaTag>
                          )}
                        </MedicineName>
                        <MedicineGeneric>{medicine.generic_name}</MedicineGeneric>
                        <MedicineMeta>
                          {medicine.common_dosage && (
                            <MetaTag $type="dosage">
                              {medicine.common_dosage} • {medicine.common_frequency}
                            </MetaTag>
                          )}
                          {medicine.form && <MetaTag>{medicine.form}</MetaTag>}
                          {medicine.strength && <MetaTag>{medicine.strength}</MetaTag>}
                        </MedicineMeta>
                      </MedicineInfo>
                      <AddButton>
                        Select
                      </AddButton>
                    </SuggestionItem>
                  ))
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6c757d' }}>
                    <div style={{ marginBottom: '0.4rem', fontWeight: '700', fontSize: '0.9rem' }}>No medicines found</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>Try a different search term or add a new medicine</div>
                  </div>
                )}
              </SuggestionsPanel>
            )}
          </SearchContainer>

          {recentSearches.length > 0 && !searchTerm && (
            <QuickActions>
              <QuickLabel>Quick search:</QuickLabel>
              {recentSearches.map((term, index) => (
                <QuickTag key={index} onClick={() => handleRecentSearch(term)}>
                  <FaSearch size="0.7em" />
                  {term}
                </QuickTag>
              ))}
            </QuickActions>
          )}
          
          <HelpText>
            Type at least 3 characters to search or use voice search. Search by brand name, generic name, or medicine form.
          </HelpText>
        </SearchSection>

        <TabbedPrescriptionLayout
          selectedMedicines={selectedMedicines}
          onUpdateMedicine={updateMedicineDetails}
          prescriptionDetails={prescriptionDetails}
          setPrescriptionDetails={setPrescriptionDetails}
          onRemoveMedicine={removeMedicineFromSummary}
          validationErrors={validationErrors}
        />

        {selectedMedicines.length > 0 && (
          <FloatingAction 
            $variant="primary" 
            onClick={() => setShowSummaryModal(true)}
          >
            <FaPrescription size="1em" />
            Review Prescription
            <Badge>{selectedMedicines.length}</Badge>
          </FloatingAction>
        )}

        <AddNewMedsModal 
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddNewMedicine}
        />

        {showMedicineModal && (
          <MedicineDetailsModal
            isOpen={showMedicineModal}
            onClose={() => setShowMedicineModal(false)}
            medicine={selectedMedicine}
            onAdd={addMedicine}
          />
        )}

        <ReadyMedicinesModal
          isOpen={showReadyMedicinesModal}
          onClose={() => setShowReadyMedicinesModal(false)}
          onAddMedicines={handleAddReadyMedicines}
        />

        <PrescriptionSummaryModal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          selectedMedicines={selectedMedicines}
          prescriptionDetails={prescriptionDetails}
          onRemoveMedicine={removeMedicineFromSummary}
          onSavePrescription={handleSavePrescription}
          saving={saving}
          validationErrors={validationErrors}
        />
      </MainWrapper>
    </Container>
  );
};

export default PrescriptionPage;