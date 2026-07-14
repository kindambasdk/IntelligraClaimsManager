// src/pages/SentToRepairShop.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import './SentToRepairShop.css';

const SentToRepairShop = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    imei: '',
    dateSent: '',
    additionalDetails: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can save data to backend or local state
    alert('Device sent to repair shop recorded successfully!');
    // Optionally reset form
    setFormData({ customerName: '', phone: '', imei: '', dateSent: '', additionalDetails: '' });
  };

  return (
    <div className="sent-shop-page">
      <div className="sent-shop-header">
       {/* <i className="fas fa-tools"></i> */}
        <h2>Send Device to Repair Shop</h2>
      </div>
      <div className="sent-shop-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer Name *</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              //placeholder="Enter customer name"
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
             // placeholder="Enter phone number"
              required
            />
          </div>
          <div className="form-group">
            <label>Device IMEI *</label>
            <input
              type="text"
              name="imei"
              value={formData.imei}
              onChange={handleChange}
             // placeholder="Enter IMEI number"
              required
            />
          </div>
          <div className="form-group">
            <label>Date Sent to Shop *</label>
            <input
              type="date"
              name="dateSent"
              value={formData.dateSent}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Customer Care Name</label>
            <input
              type="text"
              value={user?.fullName || user?.username || 'Customer Care'}
              readOnly
              className="readonly-field"
            />
          </div>
          <div className="form-group">
            <label>Additional Details</label>
            <textarea
              name="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleChange}
              placeholder="Enter any additional details..."
              rows="4"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {/*<i className="fas fa-paper-plane"></i>*/} Record Device
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SentToRepairShop;