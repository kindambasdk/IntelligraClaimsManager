// src/context/ClaimContext.jsx
import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';
import { CLAIM_STATUS } from '../constants/claimStatus';

const ClaimContext = createContext();

export function ClaimProvider({ children }) {
  const [claims, setClaims] = useState([]);
  const [currentClaim, setCurrentClaim] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search customer from API
  const fetchClaim = async (msisdn) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.searchCustomer(msisdn);
      const data = res.data;
      // Transform to match frontend model
      const claim = {
        id: Date.now(),
        covernoteRefNumber: data.covernoteRefNumber,
        msisdn: data.msisdn,
        customerName: data.customerName,
        imeiNumber: data.imeiNumber,
        model: data.model,
        brand: data.brand,
        policyCreatedDate: data.policyCreatedDate,
        rrp: data.rrp,
        insuranceCoverPaidAmount: data.insuranceCoverAmount,
        insuranceClaimDate: data.insuranceClaimDate,
        program: data.program,
        status: CLAIM_STATUS.PENDING,
        representative: null,
        // Additional fields will be filled later
      };
      setCurrentClaim(claim);
      // Optionally add to claims list (or keep separate)
      setClaims(prev => [...prev, claim]);
      return claim;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Create replacement payment
  const submitReplacement = async (claim, paymentData) => {
    // paymentData: { excessTid, faultDate, agentName, topupTid?, topupAmount? }
    const payload = {
      msisdn: claim.msisdn,
      excessTid: paymentData.excessTid,
      faultDate: paymentData.faultDate,
      agentName: paymentData.agentName,
      ...(paymentData.topupTid && { topupTid: paymentData.topupTid }),
      ...(paymentData.topupAmount && { topupAmount: paymentData.topupAmount })
    };
    const res = await api.createReplacementPayment(payload);
    // Update claim status
    updateClaim(claim.id, { status: 'completed' });
    return res;
  };

  // Create screen damage payment
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

  // Customer Care: add excess
  const addExcess = async (msisdn, insuranceClaimDate, excessAmount, notes = '') => {
    const payload = { msisdn, insuranceClaimDate, excessAmount, notes };
    const res = await api.addScreenDamageExcess(payload);
    return res;
  };

  const updateClaim = (id, updates) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    if (currentClaim && currentClaim.id === id) {
      setCurrentClaim(prev => ({ ...prev, ...updates }));
    }
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
    fetchClaim,
    submitReplacement,
    submitScreenDamage,
    addExcess,
    updateClaim,
    clearCurrentClaim,
    setCurrentClaim
  };

  return (
    <ClaimContext.Provider value={value}>
      {children}
    </ClaimContext.Provider>
  );
}

export function useClaim() {
  return useContext(ClaimContext);
}

export default ClaimContext;
