// src/pages/Representative.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useClaim } from '../hooks/useClaim.js';
import { useAutoDismiss } from '../hooks/useTimer.js';
import SearchBar from '../components/common/SearchBar.jsx';
import ClaimCard from '../components/common/ClaimCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import TransactionForm from '../components/common/TransactionForm.jsx';
import { STEP_TYPES } from '../constants/roles.js';
import { CLAIM_STATUS, CLAIM_TYPE, CLAIM_SUBTYPE } from '../constants/claimStatus.js';
import api from '../services/api';
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
    claims,
    setError,
    error,
    checkExcess
  } = useClaim();

  const [searchValue, setSearchValue] = useState('');
  const [step, setStep] = useState(STEP_TYPES.SEARCH);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedExcess, setCalculatedExcess] = useState(null);
  const [excessData, setExcessData] = useState(null); // for repair check

  const [txData, setTxData] = useState({
    faultDate: '',
    txId: '',               // main transaction ID (for repair)
    excessFeeTxId: '',       // excess fee TID (for replacement, required)
    topupAmount: '',         // top‑up amount (optional)
    topupTxId: '',           // top‑up TID (optional)
    date: '',                // auto‑extracted date
    agentName: '',
    excessAmount: ''         // auto‑filled for repair, or manually for replacement? Actually for repair it's auto‑filled.
  });

  const { isVisible: isPopupVisible, show: showPopup, dismiss: dismissPopup, progress: popupProgress } = useAutoDismiss(4000);

  // ---- EFFECT: calculate excess when faultDate changes (only for Replacement) ----
  useEffect(() => {
    const fetchExcess = async () => {
      if (!currentClaim || !txData.faultDate || selectedOption !== CLAIM_TYPE.REPLACEMENT) {
        setCalculatedExcess(null);
        return;
      }
      setIsCalculating(true);
      try {
        const response = await api.calculateExcess(currentClaim.msisdn, txData.faultDate);
        let amount = null;
        if (response.data !== undefined && response.data !== null) {
          amount = response.data;
        }
        if (amount !== null && amount !== undefined) {
          setCalculatedExcess(amount.toString());
        } else {
          setCalculatedExcess(null);
        }
      } catch (error) {
        console.error('Error calculating excess:', error);
        setCalculatedExcess(null);
      } finally {
        setIsCalculating(false);
      }
    };

    const timer = setTimeout(fetchExcess, 300);
    return () => clearTimeout(timer);
  }, [currentClaim, txData.faultDate, selectedOption]);

  // ---- SEARCH HANDLER ----
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
          representative: user?.fullName || user?.username || 'Shabani',
          status: CLAIM_STATUS.PENDING
        };
        setCurrentClaim(newClaim);
        setStep(STEP_TYPES.DETAILS);
        setError(null);
      }
    } catch (error) {
      let userMessage = 'Error fetching claim: ' + error.message;
      if (error.message.includes('UNAUTHORIZED')) userMessage = '❌ Your session has expired. Please log in again.';
      else if (error.message.includes('CLAIM_NOT_FOUND')) userMessage = '❌ No claim found.';
      else if (error.message.includes('NETWORK_ERROR')) userMessage = '🌐 Network error.';
      else if (error.message.includes('SERVER_ERROR')) userMessage = '⚠️ Server error.';
      else if (error.message.includes('ACCESS_DENIED')) userMessage = '🔒 Access denied.';
      setError(userMessage);
      alert(userMessage);
    }
  };

  // ---- ADD PAYMENT ----
  const handleAddPayment = () => {
    showPopup();
  };

  // ---- OPTION SELECT ----
  const handleOptionSelect = async (option) => {
    dismissPopup();
    setSelectedOption(option);
    if (currentClaim) {
      updateClaim(currentClaim.id, { claim_type: option });
    }

    if (option === CLAIM_TYPE.REPAIR) {
      try {
        const response = await checkExcess(currentClaim.msisdn, currentClaim.insuranceClaimDate);
        if (response.success && response.data) {
          // Excess exists – pre‑fill the amount
          setExcessData(response.data);
          setTxData(prev => ({
            ...prev,
            faultDate: response.data.faultDate || '',
            excessAmount: response.data.excessAmount || response.data.repairAmount || ''
          }));
          setStep(STEP_TYPES.TRANSACTION);
        } else {
          // No excess – show message and stay on details
          alert(`❌ ${response.message || 'No repair transaction details for this claim. Please ask Customer Care to add the repair amount first.'}`);
          setStep(STEP_TYPES.DETAILS);
        }
      } catch (error) {
        console.error('Error checking excess:', error);
        alert('❌ Could not check repair details. Please try again.');
        setStep(STEP_TYPES.DETAILS);
      }
    } else {
      // Replacement – go directly to transaction
      setStep(STEP_TYPES.TRANSACTION);
    }
  };

  // ---- TX DATA CHANGE ----
  const handleTxChange = (e) => {
    const { name, value } = e.target;
    setTxData(prev => ({ ...prev, [name]: value }));

    // Auto‑extract date from the appropriate transaction ID
    let extractedDate = '';
    if (name === 'txId' && value.length >= 8) {
      // For Repair: main transaction ID
      extractedDate = extractDateFromTxId(value);
    } else if (name === 'excessFeeTxId' && value.length >= 8) {
      // For Replacement: excess fee transaction ID
      extractedDate = extractDateFromTxId(value);
    }

    if (extractedDate) {
      setTxData(prev => ({ ...prev, date: extractedDate }));
    }
  };

  // ---- EXTRACT DATE FROM TRANSACTION ID ----
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

  // ---- SUBMIT TRANSACTION ----
  const handleSubmitTx = async () => {
    // Common validations
    if (!txData.faultDate) {
      alert('Please select a fault date');
      return;
    }

    const agentName = user?.fullName || user?.username || 'Agent';
    if (!agentName.trim()) {
      alert('Agent name is required. Please log in again.');
      return;
    }

    // For replacement
    if (selectedOption === CLAIM_TYPE.REPLACEMENT) {
      // Excess fee TID is required (if excess amount exists)
      if (calculatedExcess && !txData.excessFeeTxId) {
        alert('Please enter the Excess Fee Transaction ID');
        return;
      }
      // If top‑up amount is entered, top‑up TID is required
      if (txData.topupAmount && !txData.topupTxId) {
        alert('Please enter the Top‑up Transaction ID');
        return;
      }
      if (txData.topupTxId && !txData.topupAmount) {
        alert('Please enter the Top‑up Amount');
        return;
      }
    }

    // For repair
    if (selectedOption === CLAIM_TYPE.REPAIR) {
      if (!txData.txId) {
        alert('Please enter a transaction ID');
        return;
      }
      // We already have excessAmount from the check, so we don't need to validate it.
    }

    // Build payload
    const payload = {
      msisdn: currentClaim.msisdn,
      faultDate: txData.faultDate,
      agentName: agentName
    };

    if (selectedOption === CLAIM_TYPE.REPLACEMENT) {
      // Excess TID is required if excess exists (calculatedExcess is not null)
      if (calculatedExcess) {
        payload.excessTid = txData.excessFeeTxId.trim();
        // The excess amount is calculated automatically by the backend? Actually we send topupAmount as optional.
        // The backend expects topupTid and topupAmount for the optional top-up.
        // The main excess is handled by the backend via the excessTid? According to documentation, 
        // POST /agent/replacement-payment expects excessTid (required) and optional topupTid/topupAmount.
        // So we send excessTid from the excessFeeTxId field, and topup if provided.
        if (txData.topupAmount && txData.topupTxId) {
          payload.topupAmount = parseFloat(txData.topupAmount);
          payload.topupTid = txData.topupTxId.trim();
        }
      } else {
        alert('No excess amount calculated. Please select a fault date.');
        return;
      }
    } else {
      // Repair
      payload.insuranceClaimDate = currentClaim.insuranceClaimDate;
      payload.excessTid = txData.txId.trim();
    }

    try {
      let result;
      if (selectedOption === CLAIM_TYPE.REPLACEMENT) {
        result = await submitReplacement(currentClaim, payload);
      } else {
        result = await submitScreenDamage(currentClaim, payload);
      }
      alert(`✅ ${selectedOption} claim submitted successfully!`);
      if (currentClaim) {
        updateClaim(currentClaim.id, { status: 'completed' });
      }
      resetFlow();
    } catch (error) {
      alert('Error submitting claim: ' + error.message);
    }
  };

  // ---- CANCEL ----
  const handleCancel = () => resetFlow();

  // ---- RESET FLOW ----
  const resetFlow = () => {
    setStep(STEP_TYPES.SEARCH);
    setCurrentClaim(null);
    setSelectedOption(null);
    setCalculatedExcess(null);
    setExcessData(null);
    setTxData({
      faultDate: '',
      txId: '',
      excessFeeTxId: '',
      topupAmount: '',
      topupTxId: '',
      date: '',
      agentName: '',
      excessAmount: ''
    });
    dismissPopup();
  };

  // ---- RENDER CONTENT ----
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
              representative={user?.fullName || user?.username || 'Shabani'}
              onAddPayment={handleAddPayment}
              onOptionSelect={handleOptionSelect}
              popupVisible={isPopupVisible}
              popupProgress={popupProgress}
            />
          </>
        );
      case STEP_TYPES.TRANSACTION:
        const isRepair = selectedOption === CLAIM_TYPE.REPAIR;
        // For repair, pre‑fill the amount from the check-excess response
        const prefilledAmount = isRepair && excessData ? excessData.excessAmount || excessData.repairAmount : '';
        // For replacement, use calculatedExcess for the auto‑calculated field (shown as read-only)
        const calcAmount = isRepair ? '' : (calculatedExcess || '');
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
              agentName={user?.fullName || user?.username || 'Agent'}
              calculatedExcessAmount={calcAmount}
              isCalculating={isCalculating}
              prefilledExcessAmount={prefilledAmount}
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
          <h2>Claim Management</h2>
        </div>
      </div>
      <div className="rep-content step-transition">{renderContent()}</div>
    </div>
  );
};

export default Representative;