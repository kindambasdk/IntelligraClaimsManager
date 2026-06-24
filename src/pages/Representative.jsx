// src/pages/Representative.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useClaim } from '../hooks/useClaim.js';
import { useAutoDismiss } from '../hooks/useTimer.js';
import SearchBar from '../components/common/SearchBar.jsx';
import ClaimCard from '../components/common/ClaimCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ToggleGroup from '../components/common/ToggleGroup.jsx';
import TransactionForm from '../components/common/TransactionForm.jsx';
import RoleNav from '../components/navigation/RoleNav.jsx';
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
    submitToCare,
    completeTransaction,
    claims 
  } = useClaim();
  
  const [searchValue, setSearchValue] = useState('255685968876');
  const [step, setStep] = useState(STEP_TYPES.SEARCH);
  const [selectedOption, setSelectedOption] = useState(null);
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
    setSelectedOption(option);
    setStep(STEP_TYPES.TOGGLE);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    
    // Update claim with type and subtype
    if (currentClaim) {
      updateClaim(currentClaim.id, {
        claim_type: selectedOption,
        claim_subtype: type,
        representative: user?.name || 'Shabani'
      });
    }

    // For Repair claims, send to Customer Care for price update
    if (selectedOption === CLAIM_TYPE.REPAIR) {
      if (currentClaim) {
        submitToCare(currentClaim.id);
      }
      setStep(STEP_TYPES.PENDING);
      alert('📤 Repair claim sent to Customer Care for price update.');
    } else {
      // For Replacement claims, go directly to transaction form
      setStep(STEP_TYPES.TRANSACTION);
    }
  };

  // Check if claim has been updated by Customer Care (has amount)
  const checkCareUpdate = () => {
    if (currentClaim && currentClaim.amount && currentClaim.amount > 0) {
      return true;
    }
    return false;
  };

  const handleTxChange = (e) => {
    const { name, value } = e.target;
    setTxData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTx = () => {
    // For Replacement with Excess
    if (selectedOption === CLAIM_TYPE.REPLACEMENT && selectedType === CLAIM_SUBTYPE.EXCESS) {
      if (!txData.primaryTxId) {
        alert('Please enter the previous transaction ID');
        return;
      }
      if (!txData.primaryAmount) {
        alert('Please enter the previous transaction amount');
        return;
      }
      if (!txData.excessTxId) {
        alert('Please enter the top-up transaction ID');
        return;
      }
      if (!txData.excessAmount) {
        alert('Please enter the top-up amount');
        return;
      }

      // Complete the transaction with both IDs
      if (currentClaim) {
        completeTransaction(currentClaim.id, {
          primaryTxId: txData.primaryTxId,
          primaryAmount: parseFloat(txData.primaryAmount),
          excessTxId: txData.excessTxId,
          excessAmount: parseFloat(txData.excessAmount),
          date: txData.date,
          screenshot: null,
          isExcess: true
        });
      }
    } 
    // For Normal Replacement
    else if (selectedOption === CLAIM_TYPE.REPLACEMENT && selectedType === CLAIM_SUBTYPE.NORMAL) {
      if (!txData.primaryTxId) {
        alert('Please enter a transaction ID');
        return;
      }
      if (!txData.primaryAmount) {
        alert('Please enter the transaction amount');
        return;
      }

      if (currentClaim) {
        completeTransaction(currentClaim.id, {
          primaryTxId: txData.primaryTxId,
          primaryAmount: parseFloat(txData.primaryAmount),
          date: txData.date,
          screenshot: null,
          isExcess: false
        });
      }
    }
    // For Repair claims
    else {
      if (!txData.primaryTxId) {
        alert('Please enter a transaction ID');
        return;
      }

      if (currentClaim) {
        completeTransaction(currentClaim.id, {
          primaryTxId: txData.primaryTxId,
          date: txData.date,
          screenshot: null,
          isExcess: false
        });
      }
    }

    alert('✅ Claim submitted for Finance verification!');
    resetFlow();
  };

  const handleCancel = () => {
    resetFlow();
  };

  const resetFlow = () => {
    setStep(STEP_TYPES.SEARCH);
    setCurrentClaim(null);
    setSelectedOption(null);
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
              description="Search for a claim using phone number"
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
            />
          </>
        );
      
      case STEP_TYPES.TOGGLE:
        return (
          <>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
            <ToggleGroup 
              selected={selectedType}
              onSelect={handleTypeSelect}
              title={selectedOption}
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
              title={`${selectedOption} · ${selectedType}`}
              isReplacement={selectedOption === CLAIM_TYPE.REPLACEMENT}
              isExcess={selectedType === CLAIM_SUBTYPE.EXCESS}
              txData={txData}
              onChange={handleTxChange}
              onSubmit={handleSubmitTx}
              onCancel={handleCancel}
              representative={user?.name || 'Shabani'}
              isPending={false}
            />
          </>
        );
      
      case STEP_TYPES.PENDING:
        return (
          <>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
            <div className="pending-card">
              <div className="pending-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>Awaiting Customer Care</h3>
              <p>The repair claim has been sent to Customer Care for price update.</p>
              <p className="pending-detail">
                <strong>Claim:</strong> {currentClaim?.covernoteRefNumber}
              </p>
              <p className="pending-detail">
                <strong>Customer:</strong> {currentClaim?.customerName || 'Unknown'}
              </p>
              <p className="pending-detail">
                <strong>Type:</strong> {selectedOption} · {selectedType}
              </p>
              <p className="pending-detail">
                <strong>Status:</strong> Waiting for price from hardware personnel
              </p>
              {checkCareUpdate() ? (
                <div className="care-updated">
                  <i className="fas fa-check-circle"></i>
                  <p>Price updated by Customer Care: <strong>TZS {currentClaim?.amount?.toLocaleString()}</strong></p>
                  <button 
                    className="btn-primary" 
                    onClick={() => {
                      setTxData(prev => ({ 
                        ...prev, 
                        primaryAmount: currentClaim.amount 
                      }));
                      setStep(STEP_TYPES.TRANSACTION);
                    }}
                  >
                    <i className="fas fa-arrow-right"></i> Add Transaction Details
                  </button>
                </div>
              ) : (
                <button className="btn-outline" onClick={() => {
                  // Refresh check
                  const updatedClaim = claims.find(c => c.id === currentClaim?.id);
                  if (updatedClaim && updatedClaim.amount) {
                    setCurrentClaim(updatedClaim);
                  }
                }}>
                  <i className="fas fa-sync"></i> Check for Updates
                </button>
              )}
            </div>
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
          <i className="fas fa-headset"></i>
          <h2>Claim Management <span className="subtitle">Representative</span></h2>
        </div>
      </div>
      

      
      <div className="rep-content step-transition">
        {renderContent()}
      </div>
    </div>
  );
};

export default Representative;