// src/components/common/TransactionForm.jsx
import React from 'react';
import { extractDateFromTransactionId } from '../../utils/helpers.js';
import './TransactionForm.css';

const TransactionForm = ({ 
  title, 
  isReplacement, 
  isExcess,
  txData, 
  onChange, 
  onSubmit, 
  onCancel,
  isPending = false,
  representative,
  isCare = false
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ target: { name, value } });
  };

  // Auto-extract date when transaction ID changes
  const handleTxIdChange = (e, field) => {
    const value = e.target.value;
    onChange({ target: { name: field, value } });
    
    // Extract date from primary transaction ID
    if (field === 'primaryTxId' && value && value.length >= 8) {
      const extractedDate = extractDateFromTransactionId(value);
      if (extractedDate) {
        onChange({ target: { name: 'date', value: extractedDate } });
      }
    }
  };

  // Determine if we need to show optional fields
  const showOptionalFields = isCare || isExcess;

  return (
    <div className="claim-card transaction-container">
      <div className="transaction-title">{title}</div>
      <div className="tx-form">
        {isPending ? (
          <div className="field">
            <label>Transaction Amount</label>
            <div className="status-pending">⏳ Pending (Customer Care)</div>
            <div className="helper-text">Customer care will fill the amount</div>
          </div>
        ) : (
          <>
            {/* Required Transaction */}
            <div className="field required-section">
              <div className="section-label">
                <span className="required-badge">Required</span>
                <span>Base Repair Transaction</span>
              </div>
              <div className="field">
                <label>Transaction Amount *</label>
                <input
                  type="text"
                  name="primaryAmount"
                  value={txData.primaryAmount || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 150000"
                  required
                />
              </div>

              <div className="field">
                <label>Transaction ID *</label>
                <input
                  type="text"
                  name="primaryTxId"
                  value={txData.primaryTxId || ''}
                  onChange={(e) => handleTxIdChange(e, 'primaryTxId')}
                  placeholder="e.g., MP260610.2000.X08195"
                  required
                />
              </div>
            </div>

            {/* Optional Additional Fee Section */}
            {showOptionalFields && (
              <div className="optional-section">
                <div className="section-label">
                  <span className="optional-badge">Optional</span>
                  <span>Additional Fee</span>
                  <span className="optional-hint">(if applicable)</span>
                </div>
                
                <div className="field">
                  <label>Additional Fee Amount</label>
                  <input
                    type="text"
                    name="excessAmount"
                    value={txData.excessAmount || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., 25000 (optional)"
                    className="optional-input"
                  />
                  <div className="helper-text">
                    <i className="fas fa-info-circle"></i> 
                    Leave blank if no additional fee
                  </div>
                </div>

                <div className="field">
                  <label>Additional Fee TID</label>
                  <input
                    type="text"
                    name="excessTxId"
                    value={txData.excessTxId || ''}
                    onChange={(e) => handleTxIdChange(e, 'excessTxId')}
                    placeholder="e.g., MP260611.3000.X08196 (optional)"
                    className="optional-input"
                  />
                  <div className="helper-text">
                    <i className="fas fa-info-circle"></i> 
                    Required only if Additional Fee Amount is entered
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="field">
          <label>Transaction Date</label>
          <input
            type="text"
            name="date"
            value={txData.date}
            readOnly
            className="readonly"
          />
          {txData.date && txData.date !== 'Invalid Date' && (
            <div className="helper-text success">
              <i className="fas fa-check-circle"></i> 
              Date auto-extracted from Base Transaction ID
            </div>
          )}
        </div>
        
        <div className="field">
          <label>{isCare ? 'Customer Care' : 'Representative'}</label>
          <input
            type="text"
            value={representative || 'Shabani'}
            disabled
            className="readonly"
          />
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
          <button 
            type="button" 
            className="submit-btn" 
            onClick={onSubmit}
            disabled={!txData.primaryTxId || !txData.primaryAmount}
          >
            <i className="fas fa-check"></i> 
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;