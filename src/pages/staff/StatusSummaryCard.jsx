import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaUserClock, 
  FaExchangeAlt, 
  FaCalendarTimes,
  FaInfoCircle,
  FaChevronRight,
  FaCalendarCheck,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { format, isToday, isAfter, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import MissedAppointmentsNotification from './MissedAppointmentsNotification';
import ConfirmedPatientTodayModal from './ConfirmedPatientTodayModal';
import PendingPatientModal from './PendingPatientModal';
import AppointmentStatusDetailsModal from './AppointmentStatusDetailsModal';
import RescheduledAppointmentsModal from './RescheduledAppointmentsModal';

const StatusSummaryCard = ({ 
  confirmedCount = 0,
  pendingCount = 0,
  rescheduledCount = 0,
  missedCount = 0, 
  yesterdayMissedCount = 0,
  olderMissedCount = 0,
  fetchDashboardData
}) => {
  const [showMissedAppointments, setShowMissedAppointments] = useState(false);
  const [showConfirmedModal, setShowConfirmedModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showStatusDetailsModal, setShowStatusDetailsModal] = useState(false);
  const [showRescheduledModal, setShowRescheduledModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format PH time (12-hour format with AM/PM)
  const formatPHTime = (date) => {
    return date.toLocaleTimeString('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
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

  // Combined date and time for last update
  const formatLastUpdate = (date) => {
    return `${formatPHDateShort(date)} • ${formatPHTime(date)}`;
  };

  const statusItems = [
    {
      icon: <FaCheckCircle size={18} />,
      title: "Confirmed Today",
      count: confirmedCount,
      bgColor: "rgba(16, 185, 129, 0.05)",
      iconColor: "#10b981",
      description: "Patients confirmed for today",
      onClick: () => setShowConfirmedModal(true)
    },
    {
      icon: <FaUserClock size={18} />,
      title: "Pending Today",
      count: pendingCount,
      bgColor: "rgba(245, 158, 11, 0.05)",
      iconColor: "#f59e0b",
      description: "Awaiting confirmation",
      onClick: () => setShowPendingModal(true)
    },
    {
      icon: <FaExchangeAlt size={18} />,
      title: "Rescheduled",
      count: rescheduledCount,
      bgColor: "rgba(59, 130, 246, 0.05)",
      iconColor: "#3b82f6",
      description: "Pending reschedule approval",
      onClick: () => setShowRescheduledModal(true)
    },
    {
      icon: <FaCalendarTimes size={18} />,
      title: "Missed Appointments",
      count: missedCount,
      bgColor: "rgba(239, 68, 68, 0.05)",
      iconColor: "#ef4444",
      description: "Need rescheduling",
      yesterdayCount: yesterdayMissedCount,
      olderCount: olderMissedCount,
      onClick: () => setShowMissedAppointments(true)
    }
  ];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
          border: "1px solid #f1f5f9",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          width: "125%",
          height: "650px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header with real-time clock */}
        <div style={{ 
          padding: "20px 24px 16px", 
          borderBottom: "1px solid #f1f5f9",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "8px" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaCalendarCheck style={{ color: "#477977", fontSize: "20px" }} />
              <h3 style={{
                margin: 0, 
                fontSize: "20px", 
                fontWeight: 600, 
                color: "#0f172a", 
                letterSpacing: "-0.01em"
              }}>
                Today's Appointments
              </h3>
            </div>
          </div>
          <p style={{
            margin: 0,
            fontSize: "14px",
            color: "#64748b",
            fontWeight: 500
          }}>
            Real-time status updates for today's patient appointments
          </p>
        </div>

        {/* Status Grid */}
        <div style={{
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "16px", 
          padding: "20px",
          flex: 1,
          overflow: "hidden"
        }}>
          {statusItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)"
              }}
              whileTap={{ scale: 0.98 }}
              style={{
                backgroundColor: item.bgColor,
                padding: "20px",
                borderRadius: "14px",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                border: `1px solid ${item.bgColor.replace('0.05)', '0.1)')}`,
                cursor: item.onClick ? "pointer" : "default",
                minHeight: "120px"
              }}
              onClick={item.onClick}
            >
              {/* Background accent */}
              <div style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "60px",
                height: "60px",
                background: `linear-gradient(135deg, transparent 0%, transparent 50%, ${item.iconColor}15 50%, ${item.iconColor}10 100%)`,
                borderBottomLeftRadius: "14px",
              }}></div>

              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start", 
                marginBottom: "12px",
                position: "relative",
                zIndex: 2
              }}>
                <div style={{
                  width: "40px", 
                  height: "40px", 
                  borderRadius: "10px",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: item.iconColor,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                }}>
                  {item.icon}
                </div>
              </div>

              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "4px",
                position: "relative",
                zIndex: 2
              }}>
                <span style={{ 
                  fontSize: "15px", 
                  fontWeight: 600, 
                  color: "#334155" 
                }}>
                  {item.title}
                </span>
                {item.description && (
                  <span style={{ 
                    fontSize: "12px", 
                    color: "#64748b", 
                    fontWeight: 500,
                    lineHeight: 1.3
                  }}>
                    {item.description}
                  </span>
                )}
              </div>

              <div style={{
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-end", 
                marginTop: "14px",
                position: "relative",
                zIndex: 2
              }}>
                <div style={{ 
                  fontSize: "28px", 
                  fontWeight: 700, 
                  color: "#0f172a", 
                  lineHeight: 1 
                }}>
                  {item.count}
                </div>
                
                {/* Additional counts for missed appointments */}
                {(item.yesterdayCount || item.olderCount) && (
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "flex-end", 
                    gap: "2px" 
                  }}>
                    {item.yesterdayCount > 0 && (
                      <div style={{
                        fontSize: "11px", 
                        color: "#64748b", 
                        fontWeight: 500,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        padding: "2px 6px", 
                        borderRadius: "6px"
                      }}>
                        Yesterday: {item.yesterdayCount}
                      </div>
                    )}
                    {item.olderCount > 0 && (
                      <div style={{
                        fontSize: "11px", 
                        color: "#64748b", 
                        fontWeight: 500,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        padding: "2px 6px", 
                        borderRadius: "6px"
                      }}>
                        Older: {item.olderCount}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer with real-time update indicator */}
        <div style={{
          padding: "16px 24px", 
          borderTop: "1px solid #f1f5f9",
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          backgroundColor: "#f8fafc",
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            fontSize: "13px", 
            color: "#94a3b8" 
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              animation: "pulse 2s infinite"
            }}></div>
            <span>Live updating</span>
          </div>
          <button 
            onClick={() => setShowStatusDetailsModal(true)} 
            style={{
              display: "flex", 
              alignItems: "center", 
              gap: "6px", 
              background: "none", 
              border: "none",
              color: "#477977", 
              fontSize: "14px", 
              fontWeight: 600, 
              cursor: "pointer",
              padding: "6px 12px", 
              borderRadius: "8px",
              backgroundColor: "rgba(71, 121, 119, 0.1)",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "rgba(71, 121, 119, 0.2)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "rgba(71, 121, 119, 0.1)";
            }}
          >
            View details <FaChevronRight size={13} />
          </button>
        </div>

        {/* CSS for pulse animation */}
        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
      </motion.div>

      {/* Modals */}
      {showMissedAppointments && (
        <MissedAppointmentsNotification 
          onClose={() => setShowMissedAppointments(false)}
          missedCount={missedCount}
          yesterdayMissedCount={yesterdayMissedCount}
          olderMissedCount={olderMissedCount}
          fetchDashboardData={fetchDashboardData}
        />
      )}

      {showConfirmedModal && (
        <ConfirmedPatientTodayModal
          onClose={() => setShowConfirmedModal(false)}
          fetchDashboardData={fetchDashboardData}
          confirmedCount={confirmedCount}
        />
      )}

      {showPendingModal && (
        <PendingPatientModal
          onClose={() => setShowPendingModal(false)}
          fetchDashboardData={fetchDashboardData}
          pendingCount={pendingCount}
        />
      )}

      {showStatusDetailsModal && (
        <AppointmentStatusDetailsModal
          onClose={() => setShowStatusDetailsModal(false)}
          confirmedCount={confirmedCount}
          pendingCount={pendingCount}
          rescheduledCount={rescheduledCount}
          missedCount={missedCount}
        />
      )}

      {showRescheduledModal && (
        <RescheduledAppointmentsModal
          onClose={() => setShowRescheduledModal(false)}
          rescheduledCount={rescheduledCount}
        />
      )}
    </>
  );
};

export default StatusSummaryCard;