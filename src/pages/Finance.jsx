// src/pages/Finance.jsx
import React, { useState } from 'react';
import { useClaim } from '../hooks/useClaim.js';
import { CLAIM_TYPE } from '../constants/claimStatus.js';
import './Finance.css';

const Finance = () => {
  const { claims } = useClaim();
  
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  
  // Filter states
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Export state
  const [isExporting, setIsExporting] = useState(false);
  
  // Screenshot modal
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  
  // ============================================================
  // DATA FETCHING (Simulated)
  // ============================================================
  
  /*
    BACKEND INTEGRATION NOTES:
    
    1. Get latest claims (7 claims):
       const response = await fetch('/api/claims/latest?limit=7');
       const data = await response.json();
       // data.claims
    
    2. Get filtered claims:
       const response = await fetch(
         `/api/claims/export?type=${filterType}&startDate=${startDate}&endDate=${endDate}&search=${searchTerm}`
       );
       const data = await response.json();
       // data.claims
    
    3. Export:
       const response = await fetch('/api/claims/export/download', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ type, startDate, endDate, search })
       });
       const blob = await response.blob();
       // download blob as CSV
  */
  
  const allClaims = claims || [];
  
  const getLatestClaims = (limit = 7) => {
    const sorted = [...allClaims].sort((a, b) => {
      const dateA = new Date(a.created_at || a.insuranceClaimDate);
      const dateB = new Date(b.created_at || b.insuranceClaimDate);
      return dateB - dateA;
    });
    return sorted.slice(0, limit);
  };
  
  const hasFiltersApplied = () => {
    return filterType !== 'all' || startDate || endDate || searchTerm;
  };
  
  const getFilteredClaims = () => {
    let filtered = [...allClaims];
    
    if (filterType === 'replacement') {
      filtered = filtered.filter(c => c.claim_type === CLAIM_TYPE.REPLACEMENT);
    } else if (filterType === 'repair') {
      filtered = filtered.filter(c => c.claim_type === CLAIM_TYPE.REPAIR);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(c => {
        const claimDate = new Date(c.created_at || c.insuranceClaimDate);
        return claimDate >= start;
      });
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(c => {
        const claimDate = new Date(c.created_at || c.insuranceClaimDate);
        return claimDate <= end;
      });
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.covernoteRefNumber?.toLowerCase().includes(term) ||
        c.customerName?.toLowerCase().includes(term) ||
        c.msisdn?.includes(term)
      );
    }
    
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.insuranceClaimDate);
      const dateB = new Date(b.created_at || b.insuranceClaimDate);
      return dateB - dateA;
    });
    
    return filtered;
  };
  
  const latestClaims = getLatestClaims(7);
  const filteredClaims = getFilteredClaims();
  const filtersApplied = hasFiltersApplied();
  
  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleViewScreenshot = (claim) => {
    setSelectedClaim(claim);
    setShowScreenshotModal(true);
  };
  
  const handleClearFilters = () => {
    setFilterType('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };
  
  const handleExportCSV = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      try {
        const dataToExport = filtersApplied ? filteredClaims : allClaims;
        
        const headers = [
          'Cover Note', 'Customer', 'Phone', 'IMEI', 'Model',
          'Type', 'Subtype', 'Amount',
          'Transaction ID', 'Transaction Date', 'Claim Date',
          'Program', 'Agent'
        ];
        
        const rows = dataToExport.map(claim => [
          claim.covernoteRefNumber || 'N/A',
          claim.customerName || 'N/A',
          claim.msisdn || 'N/A',
          claim.imeiNumber || 'N/A',
          claim.model || 'N/A',
          claim.claim_type || 'N/A',
          claim.claim_subtype || 'N/A',
          claim.total_amount ? `"${claim.total_amount.toLocaleString()}"` : 'N/A',
          claim.transaction_id || 'N/A',
          claim.transaction_date || 'N/A',
          claim.insuranceClaimDate || claim.created_at || 'N/A',
          claim.program || 'N/A',
          claim.representative || 'N/A'
        ]);
        
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        
        let filename = 'claims_export';
        if (filtersApplied) {
          if (filterType !== 'all') filename += `_${filterType}`;
          if (startDate || endDate) filename += `_${startDate || 'start'}_to_${endDate || 'end'}`;
        }
        filename += `_${new Date().toISOString().slice(0,10)}.csv`;
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`✅ CSV exported successfully! (${dataToExport.length} claims)`);
      } catch (error) {
        console.error('Export error:', error);
        alert('❌ Error exporting CSV. Please try again.');
      } finally {
        setIsExporting(false);
      }
    }, 1000);
  };
  
  const handleExportAll = () => {
    if (window.confirm('Export all claims?')) {
      const currentType = filterType;
      const currentStart = startDate;
      const currentEnd = endDate;
      
      setFilterType('all');
      setStartDate('');
      setEndDate('');
      
      setTimeout(() => {
        handleExportCSV();
        setFilterType(currentType);
        setStartDate(currentStart);
        setEndDate(currentEnd);
      }, 100);
    }
  };
  
  const handleExportByType = (type) => {
    if (window.confirm(`Export all ${type} claims?`)) {
      const currentType = filterType;
      setFilterType(type);
      
      setTimeout(() => {
        handleExportCSV();
        setFilterType(currentType);
      }, 100);
    }
  };
  
  // ============================================================
  // RENDER HELPERS
  // ============================================================
  
  const getTypeBadge = (claim) => {
    const type = claim.claim_type || 'N/A';
    const subtype = claim.claim_subtype || '';
    const isExcess = subtype === 'Excess';
    const className = `type-badge ${type?.toLowerCase()} ${isExcess ? 'excess' : ''}`;
    return (
      <span className={className}>
        {type} {subtype && `· ${subtype}`}
      </span>
    );
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };
  
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `TZS ${amount.toLocaleString()}`;
  };
  
  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <div className="finance-page">
      {/* ============================================================
          HEADER
          ============================================================ */}
      <div className="finance-header">
        <div className="finance-header-content">
          <i className="fas fa-coins"></i>
          <h2>Finance</h2>
          <span className="finance-subtitle">View and export claims</span>
        </div>
        <div className="finance-actions">
          <button 
            className="btn-primary export-btn"
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            {isExporting ? (
              <><i className="fas fa-spinner fa-spin"></i> Exporting...</>
            ) : (
              <><i className="fas fa-file-export"></i> {filtersApplied ? 'Export Filtered' : 'Export All'}</>
            )}
          </button>
          <button 
            className="btn-outline export-all-btn"
            onClick={handleExportAll}
            disabled={isExporting}
          >
            <i className="fas fa-download"></i> Export All
          </button>
        </div>
      </div>
      
      {/* ============================================================
          FILTERS
          ============================================================ */}
      <div className="finance-container">
        <div className="finance-filters">
          <div className="filter-group">
            <label>Claim Type</label>
            <select 
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="replacement">Replacement</option>
              <option value="repair">Repair</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              className="filter-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              className="filter-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <div className="filter-group search-group">
            <label>Search</label>
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search cover note, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
          
          <div className="filter-actions">
            <button className="btn-outline small" onClick={handleClearFilters}>
              <i className="fas fa-undo"></i> Clear
            </button>
            <button 
              className="btn-primary small" 
              onClick={handleExportCSV}
              disabled={isExporting}
            >
              <i className="fas fa-file-export"></i> Export
            </button>
          </div>
        </div>
        
        {/* ============================================================
            FILTERED CLAIMS TABLE (Only visible when filters applied)
            ============================================================ */}
        {filtersApplied && (
          <>
            <div className="results-summary">
              <span>
                Found <strong>{filteredClaims.length}</strong> claims
                {filterType !== 'all' && ` · Type: ${filterType}`}
                {(startDate || endDate) && ' · Date filtered'}
                {searchTerm && ` · Search: "${searchTerm}"`}
              </span>
              <div className="quick-export">
                <button 
                  className="btn-outline small"
                  onClick={() => handleExportByType('replacement')}
                  disabled={isExporting}
                >
                  <i className="fas fa-exchange-alt"></i> Export Replacement
                </button>
                <button 
                  className="btn-outline small"
                  onClick={() => handleExportByType('repair')}
                  disabled={isExporting}
                >
                  <i className="fas fa-tools"></i> Export Repair
                </button>
              </div>
            </div>
            
            <div className="finance-list">
              <div className="table-header">
                <h4><i className="fas fa-filter"></i> Filtered Results</h4>
                <span className="result-count">{filteredClaims.length} claims</span>
              </div>
              {filteredClaims.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>No claims found matching your filters</p>
                  <button className="btn-outline small" onClick={handleClearFilters}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <table className="finance-table">
                  <thead>
                    <tr>
                      <th>Cover Note</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>IMEI</th>
                      <th>Model</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Transaction</th>
                      <th>Date</th>
                      <th>Screenshot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.map(claim => (
                      <tr key={claim.id}>
                        <td className="claim-ref">{claim.covernoteRefNumber}</td>
                        <td>{claim.customerName}</td>
                        <td>{claim.msisdn}</td>
                        <td>{claim.imeiNumber || 'N/A'}</td>
                        <td>{claim.model || 'N/A'}</td>
                        <td>{getTypeBadge(claim)}</td>
                        <td className="amount-cell">{formatCurrency(claim.total_amount)}</td>
                        <td>{claim.transaction_id || 'N/A'}</td>
                        <td>{formatDate(claim.created_at || claim.insuranceClaimDate)}</td>
                        <td>
                          {claim.screenshot ? (
                            <button 
                              className="action-btn view"
                              onClick={() => handleViewScreenshot(claim)}
                              title="View Screenshot"
                            >
                              <i className="fas fa-image"></i>
                            </button>
                          ) : (
                            <span className="no-screenshot-text">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
        
        {/* ============================================================
            LATEST CLAIMS SECTION (Always visible)
            ============================================================ */}
        <div className="latest-claims-section">
          <div className="latest-header">
            <div className="latest-title">
              <i className="fas fa-clock"></i>
              <h4>Latest Added Claims</h4>
              <span className="latest-badge">Last 7 claims</span>
            </div>
            {filtersApplied && (
              <button 
                className="btn-outline small"
                onClick={handleClearFilters}
              >
                <i className="fas fa-times"></i> Clear Filters
              </button>
            )}
          </div>
          <div className="latest-claims-list">
            {latestClaims.length === 0 ? (
              <div className="empty-state small">
                <p>No claims found</p>
              </div>
            ) : (
              latestClaims.map(claim => (
                <div key={claim.id} className="latest-claim-item">
                  <div className="claim-info">
                    <span className="claim-ref">{claim.covernoteRefNumber}</span>
                    <span className="claim-customer">{claim.customerName}</span>
                    <span className="claim-phone">{claim.msisdn}</span>
                    <span className="claim-model">{claim.model || 'N/A'}</span>
                    <span className="claim-type">{getTypeBadge(claim)}</span>
                  </div>
                  <div className="claim-meta">
                    <span className="claim-amount">{formatCurrency(claim.total_amount)}</span>
                    <span className="claim-date">{formatDate(claim.created_at || claim.insuranceClaimDate)}</span>
                    {claim.screenshot && (
                      <button 
                        className="action-btn view"
                        onClick={() => handleViewScreenshot(claim)}
                        title="View Screenshot"
                      >
                        <i className="fas fa-image"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* ============================================================
          SCREENSHOT MODAL
          ============================================================ */}
      {showScreenshotModal && selectedClaim && selectedClaim.screenshot && (
        <div className="modal-overlay" onClick={() => setShowScreenshotModal(false)}>
          <div className="modal-content screenshot-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Transaction Screenshot</h3>
              <button className="modal-close" onClick={() => setShowScreenshotModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="screenshot-info">
                <p><strong>Claim:</strong> {selectedClaim.covernoteRefNumber}</p>
                <p><strong>Transaction ID:</strong> {selectedClaim.transaction_id}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedClaim.total_amount)}</p>
                <p><strong>Customer:</strong> {selectedClaim.customerName}</p>
                <p><strong>Date:</strong> {formatDate(selectedClaim.transaction_date)}</p>
              </div>
              <div className="screenshot-container">
                <img 
                  src={selectedClaim.screenshot} 
                  alt="Transaction Screenshot" 
                  className="screenshot-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="no-screenshot"><i class="fas fa-image"></i><p>Screenshot not available</p></div>';
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowScreenshotModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ============================================================
          BACKEND INTEGRATION GUIDE
          ============================================================ */}
      <div className="backend-guide" style={{ display: 'none' }}>
        {`
          ============================================================
          BACKEND INTEGRATION GUIDE - FINANCE
          ============================================================
          
          API Endpoints Needed:
          
          1. GET /api/claims/latest?limit=7
             Response: { claims: [{ ... }] }
          
          2. GET /api/claims/export
             Query params:
             - type: 'all' | 'replacement' | 'repair'
             - startDate: YYYY-MM-DD
             - endDate: YYYY-MM-DD
             - search: string
             Response: { claims: [], total: number }
          
          3. POST /api/claims/export/download
             Body: { type, startDate, endDate, search }
             Response: CSV file download
          
          ============================================================
          DATABASE QUERIES (MySQL)
          ============================================================
          
          -- Latest claims
          SELECT * FROM claims ORDER BY created_at DESC LIMIT 7;
          
          -- Filtered claims
          SELECT * FROM claims 
          WHERE (claim_type = ? OR ? = 'all')
          AND (created_at >= ? OR ? IS NULL)
          AND (created_at <= ? OR ? IS NULL)
          AND (customer_name LIKE ? OR covernote_number LIKE ?)
          ORDER BY created_at DESC;
        `}
      </div>
    </div>
  );
};

export default Finance;