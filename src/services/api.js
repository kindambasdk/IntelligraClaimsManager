// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://tz-prod.intelligra.io';
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || '/sharedService/api/Insurance/get-claim-details';
const ENABLE_LOGGING = process.env.REACT_APP_ENABLE_LOGGING === 'true';

// Multiple sample responses for testing (same structure, different values)
const SAMPLE_RESPONSES = {
  '255685968876': {
    statusCode: 200,
    statusMessage: "Success",
    data: {
      msisdn: "255685968876",
      customerName: "ARAFA CHOPEKE",
      imeiNumber: "359484731242890",
      model: "ITEL A90",
      brand: "ITEL",
      policyCreatedDate: "2025-09-04 16:20",
      rrp: 205000,
      insuranceCoverPaidAmount: 7561,
      insuranceClaimDate: "2026-04-23T11:28:54.918653",
      covernoteRefNumber: "162101-250904-920619",
      program: "crdb"
    }
  },
  '255786120573': {
    statusCode: 200,
    statusMessage: "Success",
    data: {
      msisdn: "255786120573",
      customerName: "AISHA JUMA",
      imeiNumber: "359484731242891",
      model: "SAMSUNG A12",
      brand: "SAMSUNG",
      policyCreatedDate: "2025-09-05 10:30",
      rrp: 180000,
      insuranceCoverPaidAmount: 6500,
      insuranceClaimDate: "2026-04-24T14:30:00",
      covernoteRefNumber: "162101-250904-920620",
      program: "ttcl"
    }
  },
  '255784567890': {
    statusCode: 200,
    statusMessage: "Success",
    data: {
      msisdn: "255784567890",
      customerName: "JOHN DOE",
      imeiNumber: "359484731242892",
      model: "IPHONE 12",
      brand: "APPLE",
      policyCreatedDate: "2025-09-06 14:45",
      rrp: 350000,
      insuranceCoverPaidAmount: 12000,
      insuranceClaimDate: "2026-04-25T09:15:00",
      covernoteRefNumber: "162101-250904-920621",
      program: "crdb"
    }
  },
  '255782345678': {
    statusCode: 200,
    statusMessage: "Success",
    data: {
      msisdn: "255782345678",
      customerName: "SARAH MWANGI",
      imeiNumber: "359484731242893",
      model: "TECNO SPARK 8",
      brand: "TECNO",
      policyCreatedDate: "2025-09-07 08:15",
      rrp: 150000,
      insuranceCoverPaidAmount: 5000,
      insuranceClaimDate: "2026-04-26T10:00:00",
      covernoteRefNumber: "162101-250904-920622",
      program: "ttcl"
    }
  }
};

export const api = {
  // Real API call
  getClaim: async (msisdn) => {
    try {
      if (ENABLE_LOGGING) {
        console.log(`📡 Fetching claim for: ${msisdn}`);
        console.log(`🔗 API URL: ${API_BASE_URL}${API_ENDPOINT}?msisdn=${msisdn}`);
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINT}?msisdn=${msisdn}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (ENABLE_LOGGING) {
        console.log('✅ API Response received:', data);
      }
      
      return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  },

  // Get sample response for testing (same structure, different values)
  getSampleResponse: async (msisdn) => {
    if (ENABLE_LOGGING) {
      console.log(`📋 Getting sample response for: ${msisdn}`);
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if we have a specific sample
        let response = SAMPLE_RESPONSES[msisdn];
        
        // If not, create a dynamic response with the same structure
        if (!response) {
          const randomSuffix = Math.floor(Math.random() * 1000000);
          response = {
            statusCode: 200,
            statusMessage: "Success",
            data: {
              msisdn: msisdn,
              customerName: `CUSTOMER ${msisdn.slice(-4)}`,
              imeiNumber: `359484731${String(randomSuffix).padStart(6, '0')}`,
              model: `MODEL ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 100)}`,
              brand: ['SAMSUNG', 'ITEL', 'TECNO', 'APPLE', 'NOKIA'][Math.floor(Math.random() * 5)],
              policyCreatedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' '),
              rrp: Math.floor(Math.random() * 300000) + 100000,
              insuranceCoverPaidAmount: Math.floor(Math.random() * 15000) + 3000,
              insuranceClaimDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              covernoteRefNumber: `${Math.floor(Math.random() * 999999)}-${Date.now().toString().slice(-6)}-${String(randomSuffix).padStart(6, '0')}`,
              program: ['crdb', 'ttcl', 'vodacom', 'airtel'][Math.floor(Math.random() * 4)]
            }
          };
        }

        if (ENABLE_LOGGING) {
          console.log('✅ Sample response generated:', response);
        }

        resolve(response);
      }, 500);
    });
  },

  // Get claim with consistent extraction
  getClaimWithFallback: async (msisdn) => {
    try {
      let response;
      
      // Try to get sample response first (for testing)
      response = await api.getSampleResponse(msisdn);
      
      // Extract data using consistent keys
      const claimData = response.data || {};
      
      if (ENABLE_LOGGING) {
        console.log('📊 Extracted data:', claimData);
      }

      return {
        statusCode: response.statusCode || 200,
        statusMessage: response.statusMessage || 'Success',
        data: {
          msisdn: claimData.msisdn || 'N/A',
          customerName: claimData.customerName || 'Unknown',
          imeiNumber: claimData.imeiNumber || 'N/A',
          model: claimData.model || 'N/A',
          brand: claimData.brand || 'N/A',
          policyCreatedDate: claimData.policyCreatedDate || null,
          rrp: claimData.rrp || 0,
          insuranceCoverPaidAmount: claimData.insuranceCoverPaidAmount || 0,
          insuranceClaimDate: claimData.insuranceClaimDate || null,
          covernoteRefNumber: claimData.covernoteRefNumber || 'N/A',
          program: claimData.program || 'N/A'
        },
        _raw: response
      };
    } catch (error) {
      console.error('❌ Error fetching claim:', error);
      throw error;
    }
  }
};

export default api;