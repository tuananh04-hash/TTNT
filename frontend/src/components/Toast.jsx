import { useEffect, useState } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setShow(false);
    if (onClose) onClose();
  };

  if (!show) return null;

  return (
    <div className={`custom-toast toast-${type}`}>
      <div className="toast-content">
        <div className="toast-icon-wrapper">
          {type === 'success' && <span className="toast-icon">✅</span>}
          {type === 'error' && <span className="toast-icon">❌</span>}
          {type === 'warning' && <span className="toast-icon">⚠️</span>}
          {type === 'info' && <span className="toast-icon">ℹ️</span>}
        </div>
        
        <div className="toast-text">
          <span className="toast-message">{message}</span>
        </div>

        <button className="toast-close-btn" onClick={handleClose}>
          &times;
        </button>
      </div>

      <div className="toast-progress">
        <div 
          className="toast-progress-bar" 
          style={{ 
            animation: `progress-animation ${duration}ms linear forwards`
          }}
        ></div>
      </div>
    </div>
  );
};

export default Toast;