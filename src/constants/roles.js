// src/constants/roles.js
export const ROLES = {
  REPRESENTATIVE: 'rep',
  CUSTOMER_CARE: 'care',
  FINANCE: 'finance',
  ADMIN: 'admin'
};

export const ROLE_LABELS = {
  [ROLES.REPRESENTATIVE]: 'Representative',
  [ROLES.CUSTOMER_CARE]: 'Customer Care',
  [ROLES.FINANCE]: 'Finance',
  [ROLES.ADMIN]: 'Administrator'
};

export const ROLE_ICONS = {
  [ROLES.REPRESENTATIVE]: 'fa-headset',
  [ROLES.CUSTOMER_CARE]: 'fa-hand-holding-heart',
  [ROLES.FINANCE]: 'fa-coins',
  [ROLES.ADMIN]: 'fa-user-shield'
};

export const ROLE_ROUTES = {
  [ROLES.REPRESENTATIVE]: '/',
  [ROLES.CUSTOMER_CARE]: '/care',
  [ROLES.FINANCE]: '/finance',
  [ROLES.ADMIN]: '/admin'
};

export const STEP_TYPES = {
  SEARCH: 'search',
  DETAILS: 'details',
  POPUP: 'popup',
  TOGGLE: 'toggle',
  TRANSACTION: 'transaction',
  PENDING: 'pending'
};

export const PAYMENT_TYPES = {
  REPLACEMENT: 'Replacement',
  REPAIR: 'Repair'
};

export const PAYMENT_SUBTYPES = {
  NORMAL: 'Normal',
  EXCESS: 'Excess'
};