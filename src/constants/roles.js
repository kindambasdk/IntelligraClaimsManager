// src/constants/roles.js

export const ROLES = {
  ADMIN: 'admin',
  REPRESENTATIVE: 'agent',          // backend uses 'agent'
  CUSTOMER_CARE: 'customer_care',   // backend uses 'customer_care'
  FINANCE: 'finance'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.REPRESENTATIVE]: 'Representative',
  [ROLES.CUSTOMER_CARE]: 'Customer Care',
  [ROLES.FINANCE]: 'Finance'
};

export const ROLE_ICONS = {
  [ROLES.ADMIN]: 'fa-user-shield',
  [ROLES.REPRESENTATIVE]: 'fa-headset',
  [ROLES.CUSTOMER_CARE]: 'fa-hand-holding-heart',
  [ROLES.FINANCE]: 'fa-coins'
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