// src/components/common/TransactionForm.jsx
import React from 'react';
import './TransactionForm.css';

const TransactionForm = ({
  isCare,                   // true for Customer Care
  isRepair,                 // true for Representative Repair
  title,
  txData,
  onChange,
  onSubmit,
  onCancel,
  prefilledExcessAmount,    // used only for Representative Repair
  agentName                 // <-- NEW: logged-in user's name
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ target: { name, value } });
  };

  // ---- CUSTOMER CARE: only transaction ID ----
  if (isCare) {
    return (
      <div className="claim-card transaction-container">
        <div className="transaction-title">{title}</div>
        <div className="tx-form">
          <div className="field">
            <label>Transaction ID *</label>
            <input
              type="text"
              name="txId"
              value={txData.txId || ''}
              onChange={handleInputChange}
              placeholder="Enter transaction ID"
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
            <button
              type="button"
              className="submit-btn"
              onClick={onSubmit}
              disabled={!txData.txId || txData.txId.trim() === ''}
            >
              <i className="fas fa-check"></i> Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- REPRESENTATIVE: full form (Repair or Replacement) ----
  return (
    <div className="claim-card transaction-container">
      <div className="transaction-title">{title}</div>
      <div className="tx-form">
        {/* Fault Date – only for Replacement */}
        {!isRepair && (
          <div className="field">
            <label>Fault Date *</label>
            <input
              type="date"
              name="faultDate"
              value={txData.faultDate || ''}
              onChange={handleInputChange}
              required
            />
          </div>
        )}

        {/* Excess Amount */}
        <div className="field">
          <label>{isRepair ? 'Excess Amount (auto-filled)' : 'Excess Amount *'}</label>
          <input
            type="text"
            name="excessAmount"
            value={isRepair ? prefilledExcessAmount : txData.excessAmount}
            onChange={isRepair ? undefined : handleInputChange}
            readOnly={isRepair}
            placeholder={isRepair ? 'Auto-filled from system' : 'Enter excess amount'}
            className={isRepair ? 'readonly' : ''}
            required={!isRepair}
          />
        </div>

        {/* Transaction ID */}
        <div className="field">
          <label>Transaction ID *</label>
          <input
            type="text"
            name="txId"
            value={txData.txId || ''}
            onChange={handleInputChange}
            placeholder="e.g., MP260610.2000.X08195"
            required
          />
        </div>

        {/* Transaction Date – auto‑extracted */}
        <div className="field">
          <label>Transaction Date</label>
          <input
            type="text"
            name="date"
            value={txData.date || ''}
            readOnly
            className="readonly"
            placeholder="Auto‑extracted from Transaction ID"
          />
        </div>

        {/* Additional Fee fields – only for Replacement, optional */}
        {!isRepair && (
          <>
            <div className="field">
              <label>Additional Fee Amount (Optional)</label>
              <input
                type="text"
                name="additionalFeeAmount"
                value={txData.additionalFeeAmount || ''}
                onChange={handleInputChange}
                placeholder="e.g., 25000"
              />
            </div>
            <div className="field">
              <label>Additional Fee Transaction ID (Optional)</label>
              <input
                type="text"
                name="additionalFeeTxId"
                value={txData.additionalFeeTxId || ''}
                onChange={handleInputChange}
                placeholder="e.g., MP260611.3000.X08196"
              />
            </div>
          </>
        )}

        {/* Agent Name – AUTO-FILLED & READ-ONLY */}
        <div className="field">
          <label>Agent Name</label>
          <input
            type="text"
            name="agentName"
            value={agentName || txData.agentName || ''}
            readOnly
            className="readonly"
            placeholder="Auto-filled from login"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
          <button type="button" className="submit-btn" onClick={onSubmit}>
            <i className="fas fa-check"></i> Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;