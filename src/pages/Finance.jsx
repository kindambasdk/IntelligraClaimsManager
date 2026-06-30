// src/pages/Finance.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Finance.css';

const Finance = () => {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  
  // Filter states
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Screenshot modal (will be removed – no screenshots in API response)
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  
  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  // Fetch stats and report on mount (or when filters change)
  useEffect(() => {
    fetchStats();
    fetchReport();
  }, [startDate, endDate, filterType, searchTerm]);

  const fetchStats = async () => {
    try {
      const res = await api.getDashboardStats();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      // The API doesn't support type or search filters – they are done on frontend side.
      // We'll fetch all and filter locally.
      const res = await api.getReport(startDate, endDate);
      let data = res.data || [];
      
      // Apply local filters
      if (filterType !== 'all') {
        data = data.filter(item => item.paymentType?.toLowerCase() === filterType);
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter(item =>
          (item.msisdn?.includes(term)) ||
          (item.customerName?.toLowerCase().includes(term))
        );
      }
      setReportData(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleClearFilters = () => {
    setFilterType('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };
  
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // The CSV endpoint uses the same date filters.
      const blob = await api.getReportCsv(startDate, endDate);
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      let filename = `claims_report_${new Date().toISOString().slice(0,10)}.csv`;
      if (startDate || endDate) {
        filename = `claims_report_${startDate || 'start'}_to_${endDate || 'end'}.csv`;
      }
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      alert('✅ CSV exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Error exporting CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportAll = async () => {
    if (window.confirm('Export all claims (without date filters)?')) {
      // Temporarily clear date filters
      const currentStart = startDate;
      const currentEnd = endDate;
      setStartDate('');
      setEndDate('');
      // Wait for state update? We'll just call export directly with empty dates.
      try {
        const blob = await api.getReportCsv('', '');
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `claims_report_all_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        alert('✅ CSV exported successfully!');
      } catch (error) {
        alert('❌ Error exporting CSV.');
      }
      // Restore filters
      setStartDate(currentStart);
      setEndDate(currentEnd);
    }
  };
  
  const handleExportByType = async (type) => {
    // We'll filter on frontend and then call the CSV endpoint with date filters.
    // The CSV endpoint doesn't support type, so we'll export all and inform user.
    if (window.confirm(`Export all ${type} claims?`)) {
      try {
        // We'll use the same CSV endpoint but we'll filter the data ourselves? 
        // The CSV endpoint returns all data, but we can't filter server-side.
        // So we'll just export all and tell the user to filter on their side.
        // Alternatively, we could export the currently filtered data (which already has type filter).
        // Since we already have the filtered reportData, we could generate a CSV from that.
        // But the API provides a ready-made CSV, so we'll use it and note that type filter not applied.
        // Actually, the API returns all data; we can generate a CSV from the filtered reportData.
        // Let's implement a client-side CSV generation.
        const dataToExport = reportData; // already filtered by type if filterType is set.
        if (dataToExport.length === 0) {
          alert('No data to export');
          return;
        }
        const headers = ['MSISDN', 'Customer', 'Payment Type', 'Excess Amount', 'Status', 'Agent'];
        const rows = dataToExport.map(item => [
          item.msisdn || 'N/A',
          item.customerName || 'N/A',
          item.paymentType || 'N/A',
          item.excessAmount ? `"${item.excessAmount.toFixed(2)}"` : 'N/A',
          item.paymentStatus || 'N/A',
          item.agentName || 'N/A'
        ]);
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `claims_${type}_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('✅ CSV exported successfully!');
      } catch (error) {
        alert('❌ Error exporting CSV.');
      }
    }
  };

  // ============================================================
  // RENDER HELPERS
  // ============================================================
  
  const getTypeBadge = (item) => {
    const type = item.paymentType || 'N/A';
    const className = `type-badge ${type?.toLowerCase()}`;
    return <span className={className}>{type}</span>;
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
    if (amount === undefined || amount === null) return 'N/A';
    return `TZS ${amount.toFixed(2)}`;
  };

  const getStatusBadge = (status) => {
    const color = status?.toLowerCase() === 'completed' ? '#27ae60' : '#f39c12';
    return <span className="status-badge" style={{ backgroundColor: color }}>{status || 'N/A'}</span>;
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
            disabled={isExporting || loading}
          >
            {isExporting ? (
              <><i className="fas fa-spinner fa-spin"></i> Exporting...</>
            ) : (
              <><i className="fas fa-file-export"></i> Export CSV</>
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
          STATS BANNER
          ============================================================ */}
      {stats && (
        <div className="stats-banner">
          <div className="stat-item">
            <span className="stat-label">Monthly Total</span>
            <span className="stat-value">{stats.monthlyTotal || 0}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{stats.completedTotal || 0}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">Total Excess</span>
            <span className="stat-value">{formatCurrency(stats.totalExcessCollected)}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">Pending Replacement</span>
            <span className="stat-value">{stats.pendingReplacements || 0}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">Pending Screen Damage</span>
            <span className="stat-value">{stats.pendingScreenDamage || 0}</span>
          </div>
        </div>
      )}

      {/* ============================================================
          FILTERS
          ============================================================ */}
      <div className="finance-container">
        <div className="finance-filters">
          <div className="filter-group">
            <label>Payment Type</label>
            <select 
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="replacement">Replacement</option>
              <option value="screen damage">Screen Damage</option>
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
                placeholder="Search by MSISDN or customer name..."
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
          </div>
        </div>

        {/* ============================================================
            RESULTS TABLE
            ============================================================ */}
        <div className="results-summary">
          <span>
            Found <strong>{reportData.length}</strong> records
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
              onClick={() => handleExportByType('screen damage')}
              disabled={isExporting}
            >
              <i className="fas fa-tools"></i> Export Screen Damage
            </button>
          </div>
        </div>

        <div className="finance-list">
          <div className="table-header">
            <h4><i className="fas fa-list"></i> Report</h4>
            <span className="result-count">{reportData.length} records</span>
          </div>
          {loading ? (
            <div className="empty-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <p>No records found</p>
            </div>
          ) : (
            <table className="finance-table">
              <thead>
                <tr>
                  <th>MSISDN</th>
                  <th>Customer</th>
                  <th>Payment Type</th>
                  <th>Excess Amount</th>
                  <th>Status</th>
                  <th>Agent</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.msisdn || 'N/A'}</td>
                    <td>{item.customerName || 'N/A'}</td>
                    <td>{getTypeBadge(item)}</td>
                    <td className="amount-cell">{formatCurrency(item.excessAmount)}</td>
                    <td>{getStatusBadge(item.paymentStatus)}</td>
                    <td>{item.agentName || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ============================================================
          BACKEND INTEGRATION GUIDE (updated)
          ============================================================ */}
      <div className="backend-guide" style={{ display: 'none' }}>
        {`
          ============================================================
          BACKEND INTEGRATION NOTES - FINANCE
          ============================================================
          
          API Endpoints used:
          
          1. GET /finance/report?startDate=...&endDate=...
             → Returns list of payment records.
             Fields: msisdn, customerName, paymentType, excessAmount, paymentStatus, agentName
          
          2. GET /finance/report/csv?startDate=...&endDate=...
             → Returns CSV file download.
          
          3. GET /finance/dashboard/stats
             → Returns statistics: monthlyTotal, completedTotal, totalExcessCollected,
               pendingReplacements, pendingScreenDamage
          
          All endpoints require Bearer token authentication.
        `}
      </div>
    </div>
  );
};

export default Finance;