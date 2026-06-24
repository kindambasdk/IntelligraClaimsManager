import React from 'react';
import RoleNav from '../components/navigation/RoleNav.jsx';
import './Finance.css';

const Finance = () => {
  const verifications = [
    { id: 1, ref: '135402-251203-592423', amount: '250,000 TZS', txId: 'TX-98765', date: '06/22/2026' },
    { id: 2, ref: '135402-251203-592425', amount: '180,000 TZS', txId: 'TX-54321', date: '06/21/2026' },
  ];

  const handleVerify = (id) => {
    alert(`Payment verified for claim ${id}`);
  };

  const handleReject = (id) => {
    alert(`Payment rejected for claim ${id}`);
  };

  return (
    <div>
     
      <div className="finance-container">
        <div className="finance-header">
          <i className="fas fa-coins"></i>
          <h3>Payment Verification</h3>
        </div>
        
        <div className="finance-list">
          {verifications.map(item => (
            <div key={item.id} className="finance-item">
              <div className="finance-detail">
                <span className="label">Claim #</span>
                <span className="value">{item.ref}</span>
              </div>
              <div className="finance-detail">
                <span className="label">Amount</span>
                <span className="value">{item.amount}</span>
              </div>
              <div className="finance-detail">
                <span className="label">Transaction ID</span>
                <span className="value">{item.txId}</span>
              </div>
              <div className="finance-detail">
                <span className="label">Date</span>
                <span className="value">{item.date}</span>
              </div>
              <div className="finance-actions">
                <button 
                  className="btn-primary verify-btn"
                  onClick={() => handleVerify(item.id)}
                >
                  <i className="fas fa-check-circle"></i> Verify
                </button>
                <button 
                  className="btn-outline reject-btn"
                  onClick={() => handleReject(item.id)}
                >
                  <i className="fas fa-times-circle"></i> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Finance;