// src/pages/CustomerCare.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useClaim } from '../hooks/useClaim.js';
import SearchBar from '../components/common/SearchBar.jsx';
import ClaimCard from '../components/common/ClaimCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import TransactionForm from '../components/common/TransactionForm.jsx';
import { STEP_TYPES } from '../constants/roles.js';
import { CLAIM_STATUS, CLAIM_TYPE, CLAIM_SUBTYPE } from '../constants/claimStatus.js';
import './CustomerCare.css';

const CustomerCare = () => {
  const { user } = useAuth();
  const {
    currentClaim,
    fetchClaim,
    setCurrentClaim,
    isLoading,
    addExcess,
    claims
  } = useClaim();

  const [searchValue, setSearchValue] = useState('');
  const [step, setStep] = useState(STEP_TYPES.SEARCH);
  // Add amount field to state
  const [txData, setTxData] = useState({
    amount: '',
    txId: ''
  });

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
          status: CLAIM_STATUS.PENDING,
          claim_type: CLAIM_TYPE.REPAIR,
          claim_subtype: CLAIM_SUBTYPE.NORMAL
        };
        setCurrentClaim(newClaim);
        setStep(STEP_TYPES.DETAILS);
      }
    } catch (error) {
      alert('Error fetching claim: ' + error.message);
    }
  };

  const handleAddPayment = () => {
    setStep(STEP_TYPES.TRANSACTION);
  };

  const handleTxChange = (e) => {
    const { name, value } = e.target;
    setTxData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTx = async () => {
    // Validate amount
    if (!txData.amount || parseFloat(txData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    // Validate transaction ID
    if (!txData.txId || txData.txId.trim() === '') {
      alert('Please enter a transaction ID');
      return;
    }

    if (!currentClaim) {
      alert('No claim selected');
      return;
    }

    try {
      // Pass amount as excessAmount and store TID in notes
      await addExcess(
        currentClaim.msisdn,
        currentClaim.insuranceClaimDate,
        parseFloat(txData.amount),
        `Transaction ID: ${txData.txId.trim()}`
      );
      alert('✅ Repair payment recorded successfully!');
      resetFlow();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleCancel = () => resetFlow();

  const resetFlow = () => {
    setStep(STEP_TYPES.SEARCH);
    setCurrentClaim(null);
    setTxData({
      amount: '',
      txId: ''
    });
  };

  const renderContent = () => {
    switch (step) {
      case STEP_TYPES.SEARCH:
        return (
          <>
            <SearchBar value={searchValue} onChange={setSearchValue} onSearch={handleSearch} isLoading={isLoading} />
            <EmptyState icon="fa-search" title="No claim loaded" description="Search for a claim using phone number to process repair" />
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
              isCare={true}
            />
          </>
        );
      case STEP_TYPES.TRANSACTION:
        return (
          <>
            <SearchBar value={searchValue} onChange={setSearchValue} onSearch={handleSearch} isLoading={isLoading} />
            <TransactionForm
              isCare={true}
              title="Repair Payment"
              txData={txData}
              onChange={handleTxChange}
              onSubmit={handleSubmitTx}
              onCancel={handleCancel}
              agentName={user?.fullName || user?.username || 'Agent'}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="care-page">
      <div className="care-header">
        <div className="care-header-content">
          <h2>Repair Management</h2>
        </div>
      </div>
      <div className="care-content step-transition">{renderContent()}</div>
    </div>
  );
};

export default CustomerCare;