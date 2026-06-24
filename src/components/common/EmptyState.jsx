import React from 'react';
import './EmptyState.css';

const EmptyState = ({ icon, title, description }) => {
  return (
    <div className="empty-state">
      <i className={`fas ${icon || 'fa-search'}`}></i>
      <h4>{title || 'No results found'}</h4>
      <p>{description || 'Search for a claim using phone number'}</p>
    </div>
  );
};

export default EmptyState;