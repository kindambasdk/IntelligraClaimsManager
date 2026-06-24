import React from 'react';
import { ROLES, ROLE_LABELS, ROLE_ICONS } from '../../constants/roles.js';
import './RoleNav.css';

const RoleNav = ({ activeRole, onRoleChange }) => {
  const roles = [ROLES.REPRESENTATIVE, ROLES.CUSTOMER_CARE, ROLES.FINANCE, ROLES.ADMIN];

  return (
    <nav className="role-nav">
      {roles.map(role => (
        <button
          key={role}
          className={`nav-link ${activeRole === role ? 'active' : ''}`}
          onClick={() => onRoleChange(role)}
        >
          <i className={`fas ${ROLE_ICONS[role]}`}></i>
          {ROLE_LABELS[role]}
        </button>
      ))}
    </nav> 
  );
};

export default RoleNav;