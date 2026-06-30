// src/pages/Representative.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useClaim } from '../hooks/useClaim.js';
import { useAutoDismiss } from '../hooks/useTimer.js';
import SearchBar from '../components/common/SearchBar.jsx';
import ClaimCard from '../components/common/ClaimCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import TransactionForm from '../components/common/TransactionForm.jsx';
import { STEP_TYPES } from '../constants/roles.js';
import { CLAIM_STATUS, CLAIM_TYPE, CLAIM_SUBTYPE } from '../constants/claimStatus.js';
import './Representative.css';

const Representative = () => {
  const { user } = useAuth();
  const {
    currentClaim,
    fetchClaim,
    setCurrentClaim,
    isLoading,
    updateClaim,
    submitReplacement,
    submitScreenDamage,
    claims
  } = useClaim();

  const [searchValue, setSearchValue] = useState('255685968876');
  const [step, setStep] = useState(STEP_TYPES.SEARCH);
  const [selectedOption, setSelectedOption] = useState(null); // 'Replacement' or 'Repair'

  // Transaction data – fields required by the API
  const [txData, setTxData] = useState({
    faultDate: '',
    txId: '',               // excessTid
    additionalFeeAmount: '', // topupAmount (optional)
    additionalFeeTxId: '',   // topupTid (optional)
    date: '',               // auto‑extracted from txId
    agentName: ''
  });

  const { isVisible: isPopupVisible, show: showPopup, dismiss: dismissPopup, progress: popupProgress } = useAutoDismiss(4000);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    try {
      let existingClaim = claims.find(c => c.msisdn === searchValue.trim());
      if (existingClaim) {
        setCurrentClaim(existingClaim);
        setStep(STEP_TYPES.DETAILS);
        return;
      }
      const data = await fetchClaim(searchValue.trim());
      if (data) {
        const newClaim = {
          ...data,
          representative: user?.name || 'Shabani',
          status: CLAIM_STATUS.PENDING
        };
        setCurrentClaim(newClaim);
        setStep(STEP_TYPES.DETAILS);
      }
    } catch (error) {
      alert('Error fetching claim: ' + error.message);
    }
  };

  const handleAddPayment = () => {
    showPopup();
  };

  const handleOptionSelect = (option) => {
    dismissPopup();
    setSelectedOption(option);
    if (currentClaim) {
      updateClaim(currentClaim.id, { claim_type: option });
    }
    setStep(STEP_TYPES.TRANSACTION);
  };

  const handleTxChange = (e) => {
    const { name, value } = e.target;
    setTxData(prev => ({ ...prev, [name]: value }));
    // Auto‑extract date from main transaction ID
    if (name === 'txId' && value.length >= 8) {
      const extracted = extractDateFromTxId(value);
      if (extracted) {
        setTxData(prev => ({ ...prev, date: extracted }));
      }
    }
  };

  const extractDateFromTxId = (txId) => {
    const match = txId.match(/^[A-Z]{2}(\d{2})(\d{2})(\d{2})/);
    if (match) {
      const year = `20${match[1]}`;
      const month = match[2];
      const day = match[3];
      const date = new Date(`${year}-${month}-${day}`);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    }
    return null;
  };

  const handleSubmitTx = async () => {
    // Common validations
    if (!txData.faultDate) {
      alert('Please select a fault date');
      return;
    }
    if (!txData.txId) {
      alert('Please enter a transaction ID');
      return;
    }
    if (!txData.agentName.trim()) {
      alert('Please enter your name (Agent)');
      return;
    }

    // For replacement, validate optional top‑up fields
    if (selectedOption === CLAIM_TYPE.REPLACEMENT) {
      if (txData.additionalFeeAmount && !txData.additionalFeeTxId) {
        alert('Please enter the top‑up transaction ID');
        return;
      }
      if (txData.additionalFeeTxId && !txData.additionalFeeAmount) {
        alert('Please enter the top‑up amount');
        return;
      }
    }

    // Build payload
    const payload = {
      msisdn: currentClaim.msisdn,
      excessTid: txData.txId,
      faultDate: txData.faultDate,
      agentName: txData.agentName.trim()
    };

    // Add optional top‑up fields only for replacement
    if (selectedOption === CLAIM_TYPE.REPLACEMENT) {
      if (txData.additionalFeeAmount && txData.additionalFeeTxId) {
        payload.topupTid = txData.additionalFeeTxId;
        payload.topupAmount = parseFloat(txData.additionalFeeAmount);
      }
    }

    // For repair, we need insuranceClaimDate (already in claim)
    if (selectedOption === CLAIM_TYPE.REPAIR) {
      payload.insuranceClaimDate = currentClaim.insuranceClaimDate;
    }

    try {
      let result;
      if (selectedOption === CLAIM_TYPE.REPLACEMENT) {
        result = await submitReplacement(currentClaim, payload);
      } else {
        result = await submitScreenDamage(currentClaim, payload);
      }
      alert(`✅ ${selectedOption} claim submitted successfully!`);
      // Optionally update claim status based on result
      if (currentClaim) {
        updateClaim(currentClaim.id, { status: 'completed' });
      }
      resetFlow();
    } catch (error) {
      alert('Error submitting claim: ' + error.message);
    }
  };

  const handleCancel = () => resetFlow();

  const resetFlow = () => {
    setStep(STEP_TYPES.SEARCH);
    setCurrentClaim(null);
    setSelectedOption(null);
    setTxData({
      faultDate: '',
      txId: '',
      additionalFeeAmount: '',
      additionalFeeTxId: '',
      date: '',
      agentName: ''
    });
    dismissPopup();
  };

  // For repair, we no longer need prefilled excess amount – the form will not show it
  const renderContent = () => {
    switch (step) {
      case STEP_TYPES.SEARCH:
        return (
          <>
            <SearchBar value={searchValue} onChange={setSearchValue} onSearch={handleSearch} isLoading={isLoading} />
            <EmptyState icon="fa-search" title="No claim loaded" description="Search for a claim using phone number" />
          </>
        );
      case STEP_TYPES.DETAILS:
        return (
          <>
            <SearchBar value={searchValue} onChange={setSearchValue} onSearch={handleSearch} isLoading={isLoading} />
            <ClaimCard
              claim={currentClaim}
              representative={user?.name || 'Shabani'}
              onAddPayment={handleAddPayment}
              onOptionSelect={handleOptionSelect}
              popupVisible={isPopupVisible}
              popupProgress={popupProgress}
            />
          </>
        );
      case STEP_TYPES.TRANSACTION:
        const isRepair = selectedOption === CLAIM_TYPE.REPAIR;
        return (
          <>
            <SearchBar value={searchValue} onChange={setSearchValue} onSearch={handleSearch} isLoading={isLoading} />
            <TransactionForm
              isRepair={isRepair}
              txData={txData}
              onChange={handleTxChange}
              onSubmit={handleSubmitTx}
              onCancel={handleCancel}
              title={isRepair ? 'Add Payment Details (Repair)' : 'Add Payment Details (Replacement)'}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="representative-page">
      <div className="rep-header">
        <div className="rep-header-content">
          <h2>Claim Management <span className="subtitle">Representative</span></h2>
        </div>
      </div>
      <div className="rep-content step-transition">{renderContent()}</div>
    </div>
  );
};

export default Representative;