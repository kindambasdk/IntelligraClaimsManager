// src/hooks/useClaim.js
import { useContext } from 'react';
import { ClaimContext } from '../context/ClaimContext.jsx';   // named import

export function useClaim() {
  const context = useContext(ClaimContext);
  if (!context) {
    throw new Error('useClaim must be used within a ClaimProvider');
  }
  return context;
}