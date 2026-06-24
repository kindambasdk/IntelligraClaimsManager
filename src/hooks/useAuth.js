// src/hooks/useAuth.js
import { useContext } from 'react';
import AuthContext from '../context/AuthContext.jsx';

/**
 * Custom hook to access authentication context
 * @returns {Object} Auth context value { user, login, logout }
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Also export as default for convenience
export default useAuth;