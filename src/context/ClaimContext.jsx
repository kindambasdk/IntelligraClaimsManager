// src/context/ClaimContext.jsx
import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';
import { CLAIM_STATUS } from '../constants/claimStatus';

export const ClaimContext = createContext();

export function ClaimProvider({ children }) {
  const [claims, setClaims] = useState([]);
  const [currentClaim, setCurrentClaim] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------- FETCH CLAIM ----------
  const fetchClaim = async (msisdn) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.searchCustomer(msisdn);
      const data = response.data;

      const claim = {
  id: Date.now(),
  covernoteRefNumber: data.covernoteRefNumber || 'N/A',
  msisdn: data.msisdn || msisdn,
  customerName: data.customerName || 'Unknown',
  imeiNumber: data.imeiNumber || 'N/A',
  model: data.model || 'N/A',
  brand: data.brand || 'N/A',
  policyCreatedDate: data.policyCreatedDate || null,   // <-- already present
  rrp: data.rrp || 0,
  insuranceCoverPaidAmount: data.insuranceCoverPaidAmount || data.insuranceCoverAmount || 0,
  insuranceClaimDate: data.insuranceClaimDate || null,
  program: data.program || 'N/A',
  status: CLAIM_STATUS.PENDING,
  isMock: false
};
      setCurrentClaim(claim);
      setClaims(prev => [...prev, claim]);
      return claim;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- SUBMIT REPLACEMENT ----------
  const submitReplacement = async (claim, paymentData) => {
    const payload = {
      msisdn: claim.msisdn,
      excessTid: paymentData.excessTid,
      faultDate: paymentData.faultDate,
      agentName: paymentData.agentName,
      ...(paymentData.topupTid && { topupTid: paymentData.topupTid }),
      ...(paymentData.topupAmount && { topupAmount: paymentData.topupAmount })
    };
    const res = await api.createReplacementPayment(payload);
    updateClaim(claim.id, { status: 'completed' });
    return res;
  };

  // ---------- SUBMIT SCREEN DAMAGE ----------
  const submitScreenDamage = async (claim, paymentData) => {
    const payload = {
      msisdn: claim.msisdn,
      insuranceClaimDate: claim.insuranceClaimDate,
      excessTid: paymentData.excessTid,
      faultDate: paymentData.faultDate,
      agentName: paymentData.agentName
    };
    const res = await api.createScreenDamagePayment(payload);
    updateClaim(claim.id, { status: 'completed' });
    return res;
  };

  // ---------- ADD EXCESS (Customer Care) ----------
  const addExcess = async (msisdn, insuranceClaimDate, excessAmount, notes = '') => {
    const payload = { msisdn, insuranceClaimDate, excessAmount, notes };
    const res = await api.addScreenDamageExcess(payload);
    return res;
  };

  // ---------- UPDATE CLAIM ----------
  const updateClaim = (id, updates) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    if (currentClaim && currentClaim.id === id) {
      setCurrentClaim(prev => ({ ...prev, ...updates }));
    }
  };

  // ---------- CLEAR CURRENT CLAIM ----------
  const clearCurrentClaim = () => {
    setCurrentClaim(null);
    setError(null);
  };

  // ---------- PROVIDER VALUE ----------
  return (
    <ClaimContext.Provider value={{
      claims,
      currentClaim,
      isLoading,
      error,
      fetchClaim,
      submitReplacement,
      submitScreenDamage,
      addExcess,
      updateClaim,
      clearCurrentClaim,
      setCurrentClaim,
      setError
    }}>
      {children}
    </ClaimContext.Provider>
  );
}

export function useClaim() {
  const context = useContext(ClaimContext);
  if (!context) {
    throw new Error('useClaim must be used within a ClaimProvider');
  }
  return context;
}

export default ClaimContext;