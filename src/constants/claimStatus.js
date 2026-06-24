// src/constants/claimStatus.js
export const CLAIM_STATUS = {
  PENDING: 'PENDING',                    // Initial state
  AWAITING_CARE: 'AWAITING_CARE',        // Waiting for Customer Care to update price
  AWAITING_REP: 'AWAITING_REP',          // Waiting for Representative to complete
  READY_VERIFY: 'READY_VERIFY',          // Ready for Finance verification
  VERIFIED: 'VERIFIED',                  // Verified by Finance
  REJECTED: 'REJECTED',                  // Rejected by Finance
  COMPLETED: 'COMPLETED'                 // Completed
};

export const CLAIM_STATUS_LABELS = {
  [CLAIM_STATUS.PENDING]: 'Pending',
  [CLAIM_STATUS.AWAITING_CARE]: 'Awaiting Customer Care',
  [CLAIM_STATUS.AWAITING_REP]: 'Awaiting Representative',
  [CLAIM_STATUS.READY_VERIFY]: 'Ready for Verification',
  [CLAIM_STATUS.VERIFIED]: 'Verified',
  [CLAIM_STATUS.REJECTED]: 'Rejected',
  [CLAIM_STATUS.COMPLETED]: 'Completed'
};

export const CLAIM_STATUS_COLORS = {
  [CLAIM_STATUS.PENDING]: '#3498db',
  [CLAIM_STATUS.AWAITING_CARE]: '#e67e22',
  [CLAIM_STATUS.AWAITING_REP]: '#9b59b6',
  [CLAIM_STATUS.READY_VERIFY]: '#2ecc71',
  [CLAIM_STATUS.VERIFIED]: '#27ae60',
  [CLAIM_STATUS.REJECTED]: '#e74c3c',
  [CLAIM_STATUS.COMPLETED]: '#2ecc71'
};

export const CLAIM_TYPE = {
  REPLACEMENT: 'Replacement',
  REPAIR: 'Repair'
};

export const CLAIM_SUBTYPE = {
  NORMAL: 'Normal',
  EXCESS: 'Excess'
};