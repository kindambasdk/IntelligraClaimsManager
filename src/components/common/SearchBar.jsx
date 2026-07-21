import React from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, onSearch, placeholder, isLoading }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="search-section">
      <div className="search-row">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={'Enter phone number (e.g., 255781518973)'}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button onClick={onSearch} disabled={isLoading}>
          <i className="fas fa-search"></i>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;