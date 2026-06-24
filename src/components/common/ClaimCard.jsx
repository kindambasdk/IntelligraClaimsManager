// src/components/common/ClaimCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import './ClaimCard.css';

const ClaimCard = ({ claim, representative, onAddPayment, onOptionSelect, popupVisible, popupProgress, isCare = false }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close popup when popupVisible becomes false (auto-dismiss)
  useEffect(() => {
    if (!popupVisible && isPopupOpen) {
      setIsPopupOpen(false);
    }
  }, [popupVisible, isPopupOpen]);

  // If no claim, return null (AFTER all hooks are called)
  if (!claim) return null;

  // Extract data from claim (dynamically from API response)
  const ref = claim.covernoteRefNumber || 'N/A';
  const customerName = claim.customerName || 'Unknown';
  const phone = claim.msisdn || 'N/A';
  const imei = claim.imeiNumber || 'N/A';
  const model = claim.model || 'N/A';
  const claimDate = claim.insuranceClaimDate || 'N/A';
  const program = claim.program || 'N/A';
  const rep = representative || claim.representative || 'Unassigned';

  // Format date for display - only date, no time
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Check if valid date
      if (isNaN(date.getTime())) return dateString;
      // Return only date (MM/DD/YYYY) without time
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleButtonClick = () => {
    setIsPopupOpen(true);
    if (onAddPayment) onAddPayment();
  };

  const handleOptionClick = (option) => {
    setIsPopupOpen(false);
    if (onOptionSelect) onOptionSelect(option);
  };

  // For Customer Care, only show Repair option
  const popupOptions = isCare ? ['Repair'] : ['Replacement', 'Repair'];

  return (
    <div className="claim-card">
      <div className="claim-ref">{ref}</div>
      
      <div className="claim-detail">
        <span className="label">Customer</span>
        <span className="value">{customerName}</span>
      </div>
      <div className="claim-detail">
        <span className="label">Phone</span>
        <span className="value">{phone}</span>
      </div>
      <div className="claim-detail">
        <span className="label">IMEI</span>
        <span className="value">{imei}</span>
      </div>
      <div className="claim-detail">
        <span className="label">Model</span>
        <span className="value">{model}</span>
      </div>
      <div className="claim-detail">
        <span className="label">Claim Date</span>
        <span className="value">{formatDate(claimDate)}</span>
      </div>
      <div className="claim-detail">
        <span className="label">Program</span>
        <span className="value">{program}</span>
      </div>
      <div className="claim-detail">
        <span className="label">Agent</span>
        <span className="value">{rep}</span>
      </div>
      
      {isCare && (
        <div className="claim-detail care-badge-row">
          <span className="label">Role</span>
          <span className="value" style={{ color: '#e67e22' }}>
            <i className="fas fa-tools"></i> Repair Only
          </span>
        </div>
      )}
      
      <div className="card-actions" style={{ position: 'relative' }}>
        <button 
          ref={buttonRef}
          className="btn-primary" 
          onClick={handleButtonClick}
        >
          <i className="fas fa-plus-circle"></i> Add Payment
        </button>
        
        {/* Popup dropdown below the button */}
        {isPopupOpen && (
          <div ref={popupRef} className="popup-dropdown">
            <div className="popup-dropdown-content">
              <div className="popup-title">
                {isCare ? 'Process Repair Payment' : 'Choose claim type'}
              </div>
              {popupOptions.map(option => (
                <button 
                  key={option}
                  className="popup-option-btn" 
                  onClick={() => handleOptionClick(option)}
                >
                  <i className={`fas ${option === 'Replacement' ? 'fa-exchange-alt' : 'fa-tools'}`}></i>
                  {option}
                </button>
              ))}
              <div className="popup-timer">
                <div className="popup-progress-bar">
                  <div 
                    className="popup-progress-fill" 
                    style={{ width: `${popupProgress || 0}%` }}
                  />
                </div>
                <span className="popup-timer-text">Auto-dismissing in {Math.ceil((100 - (popupProgress || 0)) / 25)}s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimCard;