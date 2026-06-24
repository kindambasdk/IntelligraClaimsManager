// src/hooks/index.js

// Import all hooks
import useAuth from './useAuth.js';
import useClaim from './useClaim.js';
import useTimer, { useCountdown, useAutoDismiss } from './useTimer.js';
import { 
  useClaimSearch, 
  useClaimHistory, 
  useClaimStats, 
  useClaimForm 
} from './useClaim.js';

// Named exports
export {
  useAuth,
  useClaim,
  useTimer,
  useCountdown,
  useAutoDismiss,
  useClaimSearch,
  useClaimHistory,
  useClaimStats,
  useClaimForm
};

// Also export as AuthContext/ClaimContext for clarity
export { useAuth as useAuthContext } from './useAuth.js';
export { useClaim as useClaimContext } from './useClaim.js';

// Default export - exports all hooks as an object
const hooks = {
  useAuth,
  useClaim,
  useTimer,
  useCountdown,
  useAutoDismiss,
  useClaimSearch,
  useClaimHistory,
  useClaimStats,
  useClaimForm,
  useAuthContext: useAuth,
  useClaimContext: useClaim
};

export default hooks;