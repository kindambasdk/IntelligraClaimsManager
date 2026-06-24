import React from 'react';
import './ToggleGroup.css';

const ToggleGroup = ({ selected, onSelect, title }) => {
  return (
    <div className="claim-card toggle-container">
      <div className="toggle-title">{title}</div>
      <div className="toggle-group">
        <button 
          className={`toggle-btn ${selected === 'Normal' ? 'active' : ''}`}
          onClick={() => onSelect('Normal')}
        >
          Normal
        </button>
        <button 
          className={`toggle-btn ${selected === 'Excess' ? 'active' : ''}`}
          onClick={() => onSelect('Excess')}
        >
          Excess
        </button>
      </div>
      <div className="helper-text">Select Normal or Excess</div>
    </div>
  );
};

export default ToggleGroup;