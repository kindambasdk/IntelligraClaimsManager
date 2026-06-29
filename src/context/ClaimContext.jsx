// src/context/ClaimContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api.js';
import { CLAIM_STATUS, CLAIM_TYPE, CLAIM_SUBTYPE } from '../constants/claimStatus.js';

const ClaimContext = createContext();

// Initial mock claims
const MOCK_CLAIMS = [
  {
    id: 1,
    covernoteRefNumber: '162101-250904-920619',
    msisdn: '255685968876',
    customerName: 'ARAFA CHOPEKE',
    imeiNumber: '359484731242890',
    model: 'ITEL A90',
    brand: 'ITEL',
    policyCreatedDate: '2025-09-04 16:20',
    rrp: 205000,
    insuranceCoverPaidAmount: 7561,
    insuranceClaimDate: '2026-04-23T11:28:54.918653',
    program: 'crdb',
    claim_type: CLAIM_TYPE.REPLACEMENT,
    claim_subtype: CLAIM_SUBTYPE.NORMAL,
    status: CLAIM_STATUS.VERIFIED,
    representative: 'Shabani',
    amount: 250000,
    primary_amount: 250000,
    excess_amount: null,
    excess_tx_id: null,
    total_amount: 250000,
    transaction_id: 'MP260610.2000.X08195',
    transaction_date: '06/10/2026',
    screenshot: null
  },
  {
    id: 2,
    covernoteRefNumber: '162101-250904-920620',
    msisdn: '255786120573',
    customerName: 'AISHA JUMA',
    imeiNumber: '359484731242891',
    model: 'SAMSUNG A12',
    brand: 'SAMSUNG',
    policyCreatedDate: '2025-09-05 10:30',
    rrp: 180000,
    insuranceCoverPaidAmount: 6500,
    insuranceClaimDate: '2026-04-24T14:30:00',
    program: 'ttcl',
    claim_type: CLAIM_TYPE.REPAIR,
    claim_subtype: CLAIM_SUBTYPE.EXCESS,
    status: CLAIM_STATUS.AWAITING_CARE,
    representative: 'Shabani',
    amount: null,
    primary_amount: null,
    excess_amount: null,
    excess_tx_id: null,
    total_amount: null,
    transaction_id: null,
    transaction_date: null,
    screenshot: null
  },
  {
    id: 3,
    covernoteRefNumber: '162101-250904-920621',
    msisdn: '255784567890',
    customerName: 'JOHN DOE',
    imeiNumber: '359484731242892',
    model: 'IPHONE 12',
    brand: 'APPLE',
    policyCreatedDate: '2025-09-06 14:45',
    rrp: 350000,
    insuranceCoverPaidAmount: 12000,
    insuranceClaimDate: '2026-04-25T09:15:00',
    program: 'crdb',
    claim_type: CLAIM_TYPE.REPLACEMENT,
    claim_subtype: CLAIM_SUBTYPE.EXCESS,
    status: CLAIM_STATUS.READY_VERIFY,
    representative: 'Peter',
    amount: 300000,
    primary_amount: 250000,
    excess_amount: 50000,
    excess_tx_id: 'MP260611.3000.X08196',
    total_amount: 300000,
    transaction_id: 'MP260610.2000.X08195',
    transaction_date: '06/10/2026',
    screenshot: null
  },
  {
    id: 4,
    covernoteRefNumber: '162101-250904-920622',
    msisdn: '255782345678',
    customerName: 'SARAH MWANGI',
    imeiNumber: '359484731242893',
    model: 'TECNO SPARK 8',
    brand: 'TECNO',
    policyCreatedDate: '2025-09-07 08:15',
    rrp: 150000,
    insuranceCoverPaidAmount: 5000,
    insuranceClaimDate: '2026-04-26T10:00:00',
    program: 'ttcl',
    claim_type: CLAIM_TYPE.REPAIR,
    claim_subtype: CLAIM_SUBTYPE.NORMAL,
    status: CLAIM_STATUS.READY_VERIFY,
    representative: 'Grace',
    amount: 150000,
    primary_amount: 150000,
    excess_amount: null,
    excess_tx_id: null,
    total_amount: 150000,
    transaction_id: 'MP260612.4000.X08197',
    transaction_date: '06/12/2026',
    screenshot: null
  }
];

export function ClaimProvider({ children }) {
  const [claims, setClaims] = useState([]);
  const [currentClaim, setCurrentClaim] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    status: null,
    type: null,
    search: ''
  });

  // Initialize with mock data
  useEffect(() => {
    setClaims(MOCK_CLAIMS);
  }, []);

  const fetchClaim = async (msisdn) => {
    setIsLoading(true);
    setError(null);
    try {
      // Check if claim already exists in our claims
      let existingClaim = claims.find(c => c.msisdn === msisdn);
      
      if (existingClaim) {
        setCurrentClaim(existingClaim);
        return existingClaim;
      }

      // Fetch from API
      const response = await api.getClaimWithFallback(msisdn);
      
      // Extract data from the response
      const data = response.data || {};
      const rawResponse = response._raw || response;

      // Create new claim with the extracted data
      const newClaim = {
        id: Date.now(),
        covernoteRefNumber: data.covernoteRefNumber || 'N/A',
        msisdn: data.msisdn || msisdn,
        customerName: data.customerName || 'Unknown',
        imeiNumber: data.imeiNumber || 'N/A',
        model: data.model || 'N/A',
        brand: data.brand || 'N/A',
        policyCreatedDate: data.policyCreatedDate || null,
        rrp: data.rrp || 0,
        insuranceCoverPaidAmount: data.insuranceCoverPaidAmount || 0,
        insuranceClaimDate: data.insuranceClaimDate || null,
        program: data.program || 'N/A',
        claim_type: null,
        claim_subtype: null,
        status: CLAIM_STATUS.PENDING,
        representative: null,
        amount: null,
        primary_amount: null,
        excess_amount: null,
        excess_tx_id: null,
        total_amount: null,
        transaction_id: null,
        transaction_date: null,
        screenshot: null,
        _raw: rawResponse
      };
      
      setCurrentClaim(newClaim);
      return newClaim;
    } catch (error) {
      console.error('Error fetching claim:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addClaim = (claim) => {
    const newClaim = {
      ...claim,
      id: Date.now(),
      status: CLAIM_STATUS.PENDING
    };
    setClaims(prev => [...prev, newClaim]);
    return newClaim;
  };

  const updateClaim = (id, updates) => {
    setClaims(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, ...updates };
      }
      return c;
    }));
    
    // Also update currentClaim if it matches
    if (currentClaim && currentClaim.id === id) {
      setCurrentClaim(prev => ({ ...prev, ...updates }));
    }
  };

  const updateClaimStatus = (id, status) => {
    updateClaim(id, { status });
  };

  // Representative submits claim to Customer Care for repair price
  const submitToCare = (id) => {
    updateClaim(id, { 
      status: CLAIM_STATUS.AWAITING_CARE
    });
  };

  // Customer Care updates the price for repair
  const updateRepairPrice = (id, amount) => {
    updateClaim(id, { 
      amount: amount,
      primary_amount: amount,
      status: CLAIM_STATUS.AWAITING_REP 
    });
  };

 // Inside ClaimContext.jsx, update completeTransaction:
const completeTransaction = (id, transactionData) => {
  const updates = {
    transaction_id: transactionData.primaryTxId,
    transaction_date: transactionData.date,
    screenshot: null,
    status: CLAIM_STATUS.READY_VERIFY,
    primary_amount: transactionData.primaryAmount || transactionData.excessAmount || 0,
    amount: transactionData.primaryAmount || transactionData.excessAmount || 0,
    total_amount: transactionData.primaryAmount || transactionData.excessAmount || 0
  };

  // Handle replacement-specific fields
  if (transactionData.faultDate) {
    updates.fault_date = transactionData.faultDate;
  }
  if (transactionData.additionalFeeAmount) {
    updates.additional_fee_amount = transactionData.additionalFeeAmount;
    updates.additional_fee_tx_id = transactionData.additionalFeeTxId;
    updates.total_amount = (parseFloat(updates.amount) || 0) + parseFloat(transactionData.additionalFeeAmount);
  }

  // If excess (excessAmount > 0), mark as excess
  if (transactionData.excessAmount > 0) {
    updates.is_excess = true;
    updates.excess_amount = transactionData.excessAmount;
  }

  updateClaim(id, updates);
};
  // Finance verifies the claim
  const verifyClaim = (id) => {
    updateClaim(id, { status: CLAIM_STATUS.VERIFIED });
  };

  // Finance rejects the claim
  const rejectClaim = (id) => {
    updateClaim(id, { status: CLAIM_STATUS.REJECTED });
  };

  // Get claims by status
  const getClaimsByStatus = (status) => {
    return claims.filter(c => c.status === status);
  };

  // Get claims awaiting customer care (repair price update needed)
  const getAwaitingCareClaims = () => {
    return claims.filter(c => c.status === CLAIM_STATUS.AWAITING_CARE && c.claim_type === CLAIM_TYPE.REPAIR);
  };

  // Get claims awaiting representative (price updated, needs transaction details)
  const getAwaitingRepClaims = () => {
    return claims.filter(c => c.status === CLAIM_STATUS.AWAITING_REP);
  };

  // Get claims ready for finance verification
  const getReadyVerifyClaims = () => {
    return claims.filter(c => c.status === CLAIM_STATUS.READY_VERIFY);
  };

  // Get verified claims
  const getVerifiedClaims = () => {
    return claims.filter(c => c.status === CLAIM_STATUS.VERIFIED);
  };

  // Get rejected claims
  const getRejectedClaims = () => {
    return claims.filter(c => c.status === CLAIM_STATUS.REJECTED);
  };

  // Get excess replacement claims
  const getExcessClaims = () => {
    return claims.filter(c => c.claim_type === CLAIM_TYPE.REPLACEMENT && c.claim_subtype === CLAIM_SUBTYPE.EXCESS);
  };

  // Get claims by type
  const getClaimsByType = (type) => {
    return claims.filter(c => c.claim_type === type);
  };

  // Get claims by subtype
  const getClaimsBySubtype = (subtype) => {
    return claims.filter(c => c.claim_subtype === subtype);
  };

  const clearCurrentClaim = () => {
    setCurrentClaim(null);
    setError(null);
  };

  const value = {
    claims,
    currentClaim,
    isLoading,
    error,
    filter,
    setFilter,
    fetchClaim,
    addClaim,
    updateClaim,
    updateClaimStatus,
    submitToCare,
    updateRepairPrice,
    completeTransaction,
    verifyClaim,
    rejectClaim,
    getClaimsByStatus,
    getAwaitingCareClaims,
    getAwaitingRepClaims,
    getReadyVerifyClaims,
    getVerifiedClaims,
    getRejectedClaims,
    getExcessClaims,
    getClaimsByType,
    getClaimsBySubtype,
    setCurrentClaim,
    clearCurrentClaim
  };

  return (
    <ClaimContext.Provider value={value}>
      {children}
    </ClaimContext.Provider>
  );
}

export function useClaimContext() {
  const context = useContext(ClaimContext);
  if (!context) {
    throw new Error('useClaimContext must be used within a ClaimProvider');
  }
  return context;
}

export default ClaimContext;