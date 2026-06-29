// src/hooks/useClaim.js
import { useContext } from 'react';
import ClaimContext from '../context/ClaimContext.jsx';

/**
 * Custom hook to access claim context
 * @returns {Object} Claim context value
 * @throws {Error} If used outside of ClaimProvider
 */
export const useClaim = () => {
  const context = useContext(ClaimContext);
  if (!context) {
    throw new Error('useClaim must be used within a ClaimProvider');
  }
  return context;
};

// Default export
export default useClaim;