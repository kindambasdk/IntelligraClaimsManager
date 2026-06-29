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
    completeTransaction,
    claims 
  } = useClaim();
  
  const [searchValue, setSearchValue] = useState('255685968876');
  const [step, setStep] = useState(STEP_TYPES.SEARCH);
  const [selectedOption, setSelectedOption] = useState(null); // 'Replacement' or 'Repair'

  // Transaction data state – all fields
  const [txData, setTxData] = useState({
    faultDate: '',
    excessAmount: '',
    txId: '',
    additionalFeeAmount: '',
    additionalFeeTxId: '',
    date: '',
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

  const handleSubmitTx = () => {
    // Validation
    if (selectedOption === CLAIM_TYPE.REPLACEMENT) {
      if (!txData.faultDate) { alert('Please select a fault date'); return; }
      if (!txData.excessAmount || parseFloat(txData.excessAmount) < 0) { alert('Please enter a valid excess amount'); return; }
      if (!txData.txId) { alert('Please enter a transaction ID'); return; }
      if (txData.additionalFeeAmount && !txData.additionalFeeTxId) { alert('Please enter the additional fee transaction ID'); return; }
      if (txData.additionalFeeTxId && !txData.additionalFeeAmount) { alert('Please enter the additional fee amount'); return; }
    } else if (selectedOption === CLAIM_TYPE.REPAIR) {
      if (!txData.txId) { alert('Please enter a transaction ID'); return; }
    }
    if (!txData.agentName.trim()) { alert('Please enter your name (Agent)'); return; }

    const transactionData = {
      primaryTxId: txData.txId,
      date: txData.date,
      screenshot: null,
      isExcess: false,
      faultDate: selectedOption === CLAIM_TYPE.REPLACEMENT ? txData.faultDate : null,
      excessAmount: parseFloat(txData.excessAmount) || 0,
      additionalFeeAmount: txData.additionalFeeAmount ? parseFloat(txData.additionalFeeAmount) : null,
      additionalFeeTxId: txData.additionalFeeTxId || null,
      primaryAmount: parseFloat(txData.excessAmount) || 0,
      agentName: txData.agentName.trim()
    };

    if (selectedOption === CLAIM_TYPE.REPLACEMENT && transactionData.excessAmount > 0) {
      transactionData.isExcess = true;
    }

    if (currentClaim) {
      const subtype = (selectedOption === CLAIM_TYPE.REPLACEMENT && transactionData.excessAmount > 0) 
        ? CLAIM_SUBTYPE.EXCESS 
        : CLAIM_SUBTYPE.NORMAL;
      updateClaim(currentClaim.id, { claim_subtype: subtype });
      completeTransaction(currentClaim.id, transactionData);
    }

    alert(`✅ ${selectedOption} claim submitted for verification!`);
    resetFlow();
  };

  const handleCancel = () => resetFlow();

  const resetFlow = () => {
    setStep(STEP_TYPES.SEARCH);
    setCurrentClaim(null);
    setSelectedOption(null);
    setTxData({
      faultDate: '',
      excessAmount: '',
      txId: '',
      additionalFeeAmount: '',
      additionalFeeTxId: '',
      date: '',
      agentName: ''
    });
    dismissPopup();
  };

  const getPrefilledExcess = () => {
    if (selectedOption === CLAIM_TYPE.REPAIR && currentClaim) {
      return currentClaim.amount || currentClaim.excessAmount || '';
    }
    return '';
  };

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
              prefilledExcessAmount={isRepair ? getPrefilledExcess() : ''}
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