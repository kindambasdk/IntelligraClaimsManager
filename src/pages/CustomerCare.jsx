// src/pages/CustomerCare.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useClaim } from '../hooks/useClaim.js';
import { useAutoDismiss } from '../hooks/useTimer.js';
import SearchBar from '../components/common/SearchBar.jsx';
import ClaimCard from '../components/common/ClaimCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import TransactionForm from '../components/common/TransactionForm.jsx';
import RoleNav from '../components/navigation/RoleNav.jsx';
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
    updateClaim,
    completeTransaction,
    claims 
  } = useClaim();
  
  const [searchValue, setSearchValue] = useState('255685968876');
  const [step, setStep] = useState(STEP_TYPES.SEARCH);
  const [selectedType, setSelectedType] = useState(null);

  const [txData, setTxData] = useState({
    primaryAmount: '',
    primaryTxId: '',
    excessAmount: '',
    excessTxId: '',
    date: new Date().toLocaleDateString(),
    rep: user?.name || 'Shabani'
  });

  // Use auto-dismiss hook for popup
  const { 
    isVisible: isPopupVisible, 
    show: showPopup, 
    dismiss: dismissPopup,
    progress: popupProgress 
  } = useAutoDismiss(4000, () => {
    // When popup auto-dismisses, close it
  });

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    try {
      // Check if claim already exists in our claims
      let existingClaim = claims.find(c => c.msisdn === searchValue.trim());
      
      if (existingClaim) {
        setCurrentClaim(existingClaim);
        setStep(STEP_TYPES.DETAILS);
        return;
      }

      // If not found, fetch from API
      const data = await fetchClaim(searchValue.trim());
      if (data) {
        // Initialize claim with representative
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
    // For Customer Care, only Repair is available
    setSelectedType(CLAIM_SUBTYPE.NORMAL); // Default to Normal
    setStep(STEP_TYPES.TRANSACTION);
    
    // Update claim with type
    if (currentClaim) {
      updateClaim(currentClaim.id, {
        claim_type: CLAIM_TYPE.REPAIR,
        claim_subtype: CLAIM_SUBTYPE.NORMAL,
        representative: user?.name || 'Shabani'
      });
    }
  };

  const handleTxChange = (e) => {
    const { name, value } = e.target;
    setTxData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTx = () => {
    // Validate required fields
    if (!txData.primaryTxId) {
      alert('Please enter a transaction ID');
      return;
    }
    if (!txData.primaryAmount) {
      alert('Please enter the transaction amount');
      return;
    }

    // Check if optional fields are filled
    const hasOptional = txData.excessAmount && txData.excessAmount.trim() !== '' && 
                        txData.excessTxId && txData.excessTxId.trim() !== '';

    // Complete the transaction
    if (currentClaim) {
      completeTransaction(currentClaim.id, {
        primaryTxId: txData.primaryTxId,
        primaryAmount: parseFloat(txData.primaryAmount),
        date: txData.date,
        screenshot: null,
        isExcess: hasOptional,
        // Store optional fields if they exist, otherwise null
        excessAmount: hasOptional ? parseFloat(txData.excessAmount) : null,
        excessTxId: hasOptional ? txData.excessTxId : null
      });
    }

    if (hasOptional) {
      alert('✅ Repair claim with additional fee submitted for verification!');
    } else {
      alert('✅ Repair claim submitted for verification!');
    }
    resetFlow();
  };

  const handleCancel = () => {
    resetFlow();
  };

  const resetFlow = () => {
    setStep(STEP_TYPES.SEARCH);
    setCurrentClaim(null);
    setSelectedType(null);
    setTxData({
      primaryAmount: '',
      primaryTxId: '',
      excessAmount: '',
      excessTxId: '',
      date: new Date().toLocaleDateString(),
      rep: user?.name || 'Shabani'
    });
    dismissPopup();
  };

  const renderContent = () => {
    switch (step) {
      case STEP_TYPES.SEARCH:
        return (
          <>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
            <EmptyState 
              icon="fa-search"
              title="No claim loaded"
              description="Search for a claim using phone number to process repair"
            />
          </>
        );
      
      case STEP_TYPES.DETAILS:
        return (
          <>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
            <ClaimCard 
              claim={currentClaim}
              representative={user?.name || 'Shabani'}
              onAddPayment={handleAddPayment}
              onOptionSelect={handleOptionSelect}
              popupVisible={isPopupVisible}
              popupProgress={popupProgress}
              isCare={true}
            />
          </>
        );
      
      case STEP_TYPES.TRANSACTION:
        return (
          <>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
            <TransactionForm 
              title="Repair Payment"
              isReplacement={false}
              isExcess={true}
              txData={txData}
              onChange={handleTxChange}
              onSubmit={handleSubmitTx}
              onCancel={handleCancel}
              representative={user?.name || 'Shabani'}
              isPending={false}
              isCare={true}
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
         
          <h2>Repair Management <span className="subtitle">Customer Care</span></h2>
        </div>
        <div className="care-badge">
          <i className="fas fa-tools"></i> Repair Only
        </div>
      </div>
  
      
      <div className="care-content step-transition">
        {renderContent()}
      </div>
    </div>
  );
};

export default CustomerCare;