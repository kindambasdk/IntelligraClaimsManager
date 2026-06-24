import React, { useEffect } from 'react';
import './PopupOptions.css';

const PopupOptions = ({ onSelect, onTimeout, timeoutDuration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onTimeout();
    }, timeoutDuration);

    return () => clearTimeout(timer);
  }, [onTimeout, timeoutDuration]);

  return (
    <div className="claim-card popup-container">
      <div className="popup-title">Choose claim type</div>
      <div className="popup-options">
        <button className="popup-btn" onClick={() => onSelect('Replacement')}>
          <i className="fas fa-exchange-alt"></i> Replacement
        </button>
        <button className="popup-btn" onClick={() => onSelect('Repair')}>
          <i className="fas fa-tools"></i> Repair
        </button>
      </div>
      <div className="helper-text">Options disappear after 4s</div>
    </div>
  );
};

export default PopupOptions;