import { useEffect, useState } from 'react';
import { FaCheck, FaExclamationTriangle, FaTimes, FaInfoCircle, FaBell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Notification = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isExiting) {
      const timer = setTimeout(() => {
        handleClose();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isExiting]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(), 200);
  };

  const getTypeConfig = () => {
    const config = {
      success: {
        accent: '#4ADE80',
        icon: <FaCheck />,
        titleColor: '#4ADE80',
      },
      error: {
        accent: '#F87171', 
        icon: <FaExclamationTriangle />,
        titleColor: '#F87171',
      },
      info: {
        accent: '#60A5FA',
        icon: <FaInfoCircle />,
        titleColor: '#60A5FA',
      },
      warning: {
        accent: '#FBBF24',
        icon: <FaExclamationTriangle />,
        titleColor: '#FBBF24',
      },
      custom: {
        accent: '#A78BFA',
        icon: <FaBell />,
        titleColor: '#A78BFA',
      },
    };
    return config[type] || config.info;
  };

  const cfg = getTypeConfig();

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ x: 400, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ 
            x: 400, 
            opacity: 0, 
            scale: 0.8,
            transition: { duration: 0.2, ease: "easeIn" }
          }}
          transition={{ 
            type: "spring",
            damping: 20,
            stiffness: 400,
            mass: 0.5
          }}
          className="modern-notif"
          role="alert"
          aria-live="assertive"
          style={{
            '--notif-accent': cfg.accent,
            '--notif-title-color': cfg.titleColor,
          }}
        >
          <div className="notif-content">
            <motion.div 
              className="notif-icon-container"
              initial={{ scale: 0, rotate: -45, y: 20 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              transition={{ 
                type: "spring",
                delay: 0.1,
                damping: 12,
                stiffness: 300
              }}
              whileHover={{
                scale: 1.15,
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.4 }
              }}
            >
              <div className="notif-icon">
                {cfg.icon}
              </div>
            </motion.div>
            
            <div className="notif-text">
              <motion.div 
                className="notif-title"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </motion.div>
              <motion.div 
                className="notif-message"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 200 }}
              >
                {message}
              </motion.div>
            </div>
            
            <motion.button
              className="notif-close"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              aria-label="Close"
              whileHover={{ 
                scale: 1.2,
                rotate: 180,
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                transition: { type: "spring", stiffness: 500 }
              }}
              whileTap={{ scale: 0.85 }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
            >
              <FaTimes />
            </motion.button>
          </div>

          {/* Solid Progress Bar */}
          <motion.div 
            className="progress-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              className="progress-track"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 2.5, ease: "circOut", delay: 0.4 }}
            />
          </motion.div>

          <style jsx>{`
            .modern-notif {
              position: fixed;
              top: 24px;
              right: 24px;
              min-width: 380px;
              max-width: 460px;
              background: #318835ff;
              color: #ffffffff;
              border-radius: 16px;
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.2);
              border: 1px solid rgba(21, 174, 185, 0.15);
              overflow: hidden;
              z-index: 9999;
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              will-change: transform, opacity;
            }

            .notif-content {
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 20px;
              position: relative;
            }

            .notif-icon-container {
              position: relative;
              flex-shrink: 0;
            }

            .notif-icon {
              font-size: 22px;
              color: var(--notif-accent);
              flex-shrink: 0;
              filter: drop-shadow(0 0 8px var(--notif-accent));
              position: relative;
              z-index: 2;
              width: 44px;
              height: 44px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              border: 1px solid rgba(255, 255, 255, 0.15);
            }

            .notif-text {
              flex: 1;
              min-width: 0;
            }

            .notif-title {
              font-weight: 700;
              font-size: 14px;
              color: var(--notif-title-color);
              margin-bottom: 6px;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            .notif-message {
              font-size: 15px;
              line-height: 1.5;
              color: #FFFFFF;
              font-weight: 500;
              text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
              opacity: 0.95;
            }

            .notif-close {
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.25);
              color: #FFFFFF;
              font-size: 13px;
              cursor: pointer;
              width: 32px;
              height: 32px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              opacity: 0.8;
            }

            .progress-container {
              position: relative;
              width: 100%;
              height: 4px;
              background: rgba(255, 255, 255, 0.1);
              overflow: hidden;
            }

            .progress-track {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 100%;
              background: var(--notif-accent);
              transform-origin: left;
              border-radius: 0 2px 2px 0;
              box-shadow: 0 0 12px var(--notif-accent);
            }

            /* Hover effects */
            .modern-notif:hover {
              transform: translateY(-3px) scale(1.01);
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 12px 32px rgba(0, 0, 0, 0.3);
            }

            .modern-notif:hover .notif-icon {
              animation: float 3s ease-in-out infinite;
              background: rgba(255, 255, 255, 0.15);
            }

            @keyframes float {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-4px);
              }
            }

            /* Performance optimizations */
            .modern-notif * {
              box-sizing: border-box;
            }

            /* Responsive design */
            @media (max-width: 480px) {
              .modern-notif {
                min-width: calc(100vw - 48px);
                max-width: calc(100vw - 48px);
                right: 24px;
                left: 24px;
                top: 16px;
                border-radius: 14px;
              }
              
              .notif-content {
                padding: 18px;
                gap: 14px;
              }
              
              .notif-icon {
                font-size: 20px;
                width: 40px;
                height: 40px;
              }
              
              .notif-message {
                font-size: 14px;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;