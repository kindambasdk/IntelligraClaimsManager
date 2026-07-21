// src/components/common/TransactionForm.jsx
import React from 'react';
import './TransactionForm.css';

const TransactionForm = ({
  isCare,
  isRepair,
  title,
  txData,
  onChange,
  onSubmit,
  onCancel,
  calculatedExcessAmount,
  agentName,
  isCalculating
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ target: { name, value } });
  };

  // ---- CUSTOMER CARE ----
  if (isCare) {
    return (
      <div className="claim-card transaction-container">
        <div className="transaction-title">{title}</div>
        <div className="tx-form">
          <div className="field">
            <label>Repair Amount *</label>
            <input
              type="text"
              name="amount"
              value={txData.amount || ''}
              onChange={handleInputChange}
              placeholder="Enter repair cost"
              required
            />
          </div>
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
          <div className="field">
            <label>Agent Name</label>
            <input
              type="text"
              value={agentName || txData.agentName || ''}
              readOnly
              className="readonly"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
            <button
              type="button"
              className="submit-btn"
              onClick={onSubmit}
              disabled={
                !txData.amount ||
                parseFloat(txData.amount) <= 0 ||
                !txData.faultDate
              }
            >
              <i className="fas fa-check"></i> Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- REPRESENTATIVE ----
  return (
    <div className="claim-card transaction-container">
      <div className="transaction-title">{title}</div>
      <div className="tx-form">
        {/* ---- Fault Date – only for Replacement ---- */}
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

        {isRepair ? (
          // ---- REPAIR: single amount + TID ----
          <>
            <div className="field">
              <label>Excess Amount (auto-filled)</label>
              <input
                type="text"
                name="excessAmount"
                value={txData.excessAmount || ''}
                readOnly
                className="readonly"
              />
            </div>
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
          </>
        ) : (
          // ---- REPLACEMENT: excess (required) + top‑up (optional) ----
          <>
            {/* Excess Amount (auto-calculated, read-only) */}
            <div className="field">
              <label>Excess Amount </label>
              <input
                type="text"
                value={
                  txData.faultDate && calculatedExcessAmount
                    ? calculatedExcessAmount
                    : ''
                }
                readOnly
                className="readonly"
                placeholder={
                  isCalculating
                    ? 'Calculating...'
                    : txData.faultDate
                      ? 'Auto-calculated'
                      : 'Select fault date first'
                }
              />
              {isCalculating && (
                <div className="helper-text">
                  <i className="fas fa-spinner fa-spin"></i> Calculating...
                </div>
              )}
            </div>

            {/* Excess Fee Transaction ID (required) */}
            <div className="field">
              <label>Excess Fee Transaction ID *</label>
              <input
                type="text"
                name="excessFeeTxId"
                value={txData.excessFeeTxId || ''}
                onChange={handleInputChange}
              //  placeholder="Enter transaction ID for excess fee"
                required={!!(txData.faultDate && calculatedExcessAmount)}
              />
              {txData.faultDate && calculatedExcessAmount && !txData.excessFeeTxId && (
                <div className="helper-text error"></div>
              )}
            </div>

            {/* Top‑up Amount (optional) */}
            <div className="field">
              <label>Top‑up Amount</label>
              <input
                type="text"
                name="topupAmount"
                value={txData.topupAmount || ''}
                onChange={handleInputChange}
             //   placeholder="e.g., 3000"
              />
            </div>

            {/* Top‑up Transaction ID */}
            <div className="field">
              <label>Top‑up Transaction ID</label>
              <input
                type="text"
                name="topupTxId"
                value={txData.topupTxId || ''}
                onChange={handleInputChange}
              //  placeholder="e.g., MP260611.3000.X08196"
              />
              {txData.topupAmount && !txData.topupTxId && (
                <div className="helper-text error">Required if top‑up amount is entered</div>
              )}
            </div>
          </>
        )}

        {/* ---- Transaction Date – auto‑extracted (for both repair and replacement) ---- */}
        <div className="field">
          <label>Transaction Date</label>
          <input
            type="text"
            name="date"
            value={txData.date || ''}
            readOnly
            className="readonly"
           // placeholder="Auto-extracted from Transaction ID"
          />
          {txData.date && (
            <div className="helper-text success">
              {/*<i className="fas fa-check-circle"></i> Auto-extracted*/}
            </div>
          )}
        </div>

        {/* ---- Agent Name – AUTO-FILLED & READ-ONLY ---- */}
        <div className="field">
          <label>Agent Name</label>
          <input
            type="text"
            value={agentName || txData.agentName || ''}
            readOnly
            className="readonly"
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