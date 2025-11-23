import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Search,
  Download,
  X,
  MessageSquare,
  BarChart3,
  XCircle,
  Eye,
  DollarSign
} from 'lucide-react';
import PortalLayout from '../shared/PortalLayout';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRiskColor = (risk) => {
  switch (risk) {
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

// --------------------------- Dashboard ---------------------------
const InsuranceDashboard = () => {
  const [pendingClaims, setPendingClaims] = useState([
    {
      id: 'CL001',
      employee: 'John Doe',
      type: 'Outpatient',
      amount: '$1,250',
      priority: 'high',
      submittedDate: '2025-01-15',
      aiScore: 92,
      riskLevel: 'low'
    },
    {
      id: 'CL002',
      employee: 'Jane Smith',
      type: 'Prescription',
      amount: '$85',
      priority: 'low',
      submittedDate: '2025-01-10',
      aiScore: 88,
      riskLevel: 'low'
    },
    {
      id: 'CL003',
      employee: 'Mike Johnson',
      type: 'Emergency',
      amount: '$3,500',
      priority: 'urgent',
      submittedDate: '2025-01-08',
      aiScore: 76,
      riskLevel: 'medium'
    }
  ]);

  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showClaimDetails, setShowClaimDetails] = useState(false);

  const handleApproveClaim = (claimId) => {
    if (window.confirm(`Are you sure you want to approve claim ${claimId}?`)) {
      setPendingClaims((prev) => prev.filter((claim) => claim.id !== claimId));
      window.alert(
        `Claim ${claimId} approved successfully! Payment will be processed within 24 hours.`
      );
    }
  };

  const handleRejectClaim = (claimId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason) {
      setPendingClaims((prev) => prev.filter((claim) => claim.id !== claimId));
      window.alert(
        `Claim ${claimId} rejected. Notification sent to employee with reason: "${reason}"`
      );
    }
  };

  const handleRequestMoreInfo = (claimId) => {
    const message = window.prompt('What additional information do you need?');
    if (message) {
      window.alert(`Information request sent for claim ${claimId}: "${message}"`);
    }
  };

  const handleViewDetails = (claim) => {
    setSelectedClaim(claim);
    setShowClaimDetails(true);
  };

  const handleBulkApprove = () => {
    const lowRiskClaims = pendingClaims.filter(
      (claim) => claim.riskLevel === 'low' && claim.aiScore >= 85
    );
    if (
      lowRiskClaims.length > 0 &&
      window.confirm(
        `Approve ${lowRiskClaims.length} low-risk claims with high AI scores?`
      )
    ) {
      setPendingClaims((prev) =>
        prev.filter((claim) => !(claim.riskLevel === 'low' && claim.aiScore >= 85))
      );
      window.alert(`${lowRiskClaims.length} claims approved in bulk!`);
    } else {
      window.alert('No eligible claims for bulk approval.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Claims</p>
              <p className="text-2xl font-bold text-orange-600">23</p>
              <p className="text-xs text-orange-600 font-medium">3 urgent</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved Today</p>
              <p className="text-2xl font-bold text-green-600">15</p>
              <p className="text-xs text-green-600 font-medium">$45K processed</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">AI Accuracy</p>
              <p className="text-2xl font-bold text-blue-600">94.2%</p>
              <p className="text-xs text-blue-600 font-medium">+2.1% this month</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Amount Processed</p>
              <p className="text-2xl font-bold text-gray-900">$124K</p>
              <p className="text-xs text-green-600 font-medium">This month</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={handleBulkApprove}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 group border border-green-200"
            >
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <span className="font-semibold text-green-700 block text-sm">Bulk Approve</span>
                <span className="text-xs text-green-600">Low-risk claims</span>
              </div>
            </button>
            <button
              onClick={() => window.alert('Opening analytics dashboard...')}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group border border-blue-200"
            >
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <span className="font-semibold text-blue-700 block text-sm">View Analytics</span>
                <span className="text-xs text-blue-600">Performance metrics</span>
              </div>
            </button>
            <button
              onClick={() => window.alert('Generating monthly report...')}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group border border-purple-200"
            >
              <FileText className="w-6 h-6 text-purple-600" />
              <div className="text-left">
                <span className="font-semibold text-purple-700 block text-sm">Generate Report</span>
                <span className="text-xs text-purple-600">Monthly summary</span>
              </div>
            </button>
            <button
              onClick={() => window.alert('Opening fraud detection dashboard...')}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl hover:from-red-100 hover:to-red-200 transition-all duration-300 group border border-red-200"
            >
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div className="text-left">
                <span className="font-semibold text-red-700 block text-sm">Fraud Detection</span>
                <span className="text-xs text-red-600">AI monitoring</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Claims Requiring Review */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Claims Requiring Review</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => window.alert('Exporting claims data...')}
                className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {pendingClaims.map((claim) => (
              <div key={claim.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{claim.id}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(claim.priority)}`}>
                        {claim.priority}
                      </span>
                    </div>
                    <p className="text-gray-600">{claim.employee} • {claim.type}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">AI Score:</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${claim.aiScore >= 90 ? 'bg-green-500' : claim.aiScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${claim.aiScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{claim.aiScore}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Risk:</span>
                        <span className={`text-sm font-medium ${getRiskColor(claim.riskLevel)}`}>
                          {claim.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{claim.amount}</span>
                    <p className="text-sm text-gray-600">Submitted: {claim.submittedDate}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleViewDetails(claim)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Review Details</span>
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleRequestMoreInfo(claim.id)}
                      className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Request Info</span>
                    </button>
                    <button
                      onClick={() => handleRejectClaim(claim.id)}
                      className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApproveClaim(claim.id)}
                      className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Claim Details Modal */}
      {showClaimDetails && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Claim Review - {selectedClaim.id}</h3>
                <button
                  onClick={() => setShowClaimDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h4>
                    <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                      <p><span className="font-medium text-gray-700">Name:</span> {selectedClaim.employee}</p>
                      <p><span className="font-medium text-gray-700">Employee ID:</span> EMP001</p>
                      <p><span className="font-medium text-gray-700">Insurance ID:</span> INS123456</p>
                      <p><span className="font-medium text-gray-700">Policy Type:</span> Premium Health</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Claim Details</h4>
                    <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                      <p><span className="font-medium text-gray-700">Type:</span> {selectedClaim.type}</p>
                      <p><span className="font-medium text-gray-700">Amount:</span> {selectedClaim.amount}</p>
                      <p><span className="font-medium text-gray-700">Submitted:</span> {selectedClaim.submittedDate}</p>
                      <p>
                        <span className="font-medium text-gray-700">Priority:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedClaim.priority)}`}>
                          {selectedClaim.priority}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">AI Analysis</h4>
                    <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                        <span className="text-lg font-bold text-blue-600">{selectedClaim.aiScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${selectedClaim.aiScore >= 90 ? 'bg-green-500' : selectedClaim.aiScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${selectedClaim.aiScore}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center space-x-3 text-sm mt-4">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Document authenticity verified</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Policy coverage confirmed</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Treatment codes validated</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <AlertCircle className={`w-5 h-5 ${getRiskColor(selectedClaim.riskLevel)}`} />
                        <span className="text-gray-700">
                          Risk Level: <span className={getRiskColor(selectedClaim.riskLevel)}>{selectedClaim.riskLevel}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Documents</h4>
                    <div className="space-y-2">
                      {['Medical Report.pdf', 'Invoice.pdf', 'Prescription.jpg'].map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-700">{doc}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.alert(`Viewing ${doc}...`)}
                              className="text-blue-600 hover:text-blue-700 text-sm p-1 rounded"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => window.alert(`Downloading ${doc}...`)}
                              className="text-green-600 hover:text-green-700 text-sm p-1 rounded"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleRequestMoreInfo(selectedClaim.id);
                    setShowClaimDetails(false);
                  }}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Request More Info</span>
                </button>
                <button
                  onClick={() => {
                    handleRejectClaim(selectedClaim.id);
                    setShowClaimDetails(false);
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Claim</span>
                </button>
                <button
                  onClick={() => {
                    handleApproveClaim(selectedClaim.id);
                    setShowClaimDetails(false);
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve Claim</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --------------------------- Review ---------------------------
const ClaimReview = () => {
  const [claims, setClaims] = useState([
    {
      id: 'CL001',
      employee: 'John Doe',
      type: 'Outpatient',
      amount: '$1,250',
      status: 'pending',
      submittedDate: '2025-01-15',
      aiScore: 92,
      riskLevel: 'low'
    },
    {
      id: 'CL002',
      employee: 'Jane Smith',
      type: 'Prescription',
      amount: '$85',
      status: 'pending',
      submittedDate: '2025-01-10',
      aiScore: 88,
      riskLevel: 'low'
    },
    {
      id: 'CL003',
      employee: 'Mike Johnson',
      type: 'Emergency',
      amount: '$3,500',
      status: 'pending',
      submittedDate: '2025-01-08',
      aiScore: 76,
      riskLevel: 'medium'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const filteredClaims = claims.filter((claim) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      claim.id.toLowerCase().includes(s) ||
      claim.employee.toLowerCase().includes(s) ||
      claim.type.toLowerCase().includes(s);
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || claim.riskLevel === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const handleBulkAction = (action) => {
    const selectedClaims = filteredClaims.filter(
      (claim) => claim.riskLevel === 'low' && claim.aiScore >= 85
    );
    if (action === 'approve' && selectedClaims.length > 0) {
      if (window.confirm(`Bulk approve ${selectedClaims.length} low-risk claims?`)) {
        setClaims((prev) =>
          prev.filter((claim) => !(claim.riskLevel === 'low' && claim.aiScore >= 85))
        );
        window.alert(`${selectedClaims.length} claims approved!`);
      }
    }
  };

  const handleIndividualAction = (claimId, action) => {
    if (action === 'approve') {
      if (window.confirm(`Approve claim ${claimId}?`)) {
        setClaims((prev) => prev.filter((claim) => claim.id !== claimId));
        window.alert(`Claim ${claimId} approved!`);
      }
    } else if (action === 'reject') {
      const reason = window.prompt('Reason for rejection:');
      if (reason) {
        setClaims((prev) => prev.filter((claim) => claim.id !== claimId));
        window.alert(`Claim ${claimId} rejected: ${reason}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search claims by ID, employee, or type..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
            <button
              onClick={() => handleBulkAction('approve')}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Bulk Approve</span>
            </button>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Claims for Review ({filteredClaims.length})</h2>
        </div>
        <div className="p-6">
          {filteredClaims.length > 0 ? (
            <div className="space-y-4">
              {filteredClaims.map((claim) => (
                <div key={claim.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{claim.id}</h3>
                      <p className="text-gray-600">{claim.employee} • {claim.type}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">AI Score:</span>
                          <span className={`text-sm font-bold ${claim.aiScore >= 90 ? 'text-green-600' : claim.aiScore >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {claim.aiScore}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Risk:</span>
                          <span className={`text-sm font-medium ${getRiskColor(claim.riskLevel)}`}>
                            {claim.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">{claim.amount}</span>
                      <p className="text-sm text-gray-600">{claim.submittedDate}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => window.alert(`Viewing details for ${claim.id}...`)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleIndividualAction(claim.id, 'reject')}
                      className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleIndividualAction(claim.id, 'approve')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No claims found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --------------------------- Approved ---------------------------
const ApprovedClaims = () => {
  const [approvedClaims] = useState([
    {
      id: 'CL004',
      employee: 'Sarah Wilson',
      type: 'Dental',
      amount: '$450',
      approvedDate: '2025-01-14',
      paymentDate: '2025-01-15',
      approvedBy: 'System AI'
    },
    {
      id: 'CL005',
      employee: 'David Brown',
      type: 'Vision',
      amount: '$320',
      approvedDate: '2025-01-13',
      paymentDate: '2025-01-14',
      approvedBy: 'John Smith'
    }
  ]);

  const handleDownloadReport = (claimId) => {
    window.alert(`Downloading approval report for ${claimId}...`);
  };

  const handleViewPaymentDetails = (claimId) => {
    window.alert(`Viewing payment details for ${claimId}...`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recently Approved Claims</h2>
            <button
              onClick={() => window.alert('Exporting approved claims report...')}
              className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {approvedClaims.map((claim) => (
              <div key={claim.id} className="border border-gray-200 rounded-lg p-6 bg-green-50 border-green-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{claim.id}</h3>
                    <p className="text-gray-600">{claim.employee} • {claim.type}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-600">{claim.amount}</span>
                    <p className="text-sm text-gray-600">Approved: {claim.approvedDate}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <p><span className="font-medium">Payment Date:</span> {claim.paymentDate}</p>
                    <p><span className="font-medium">Approved By:</span> {claim.approvedBy}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleDownloadReport(claim.id)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Download Report
                  </button>
                  <button
                    onClick={() => handleViewPaymentDetails(claim.id)}
                    className="text-green-600 hover:text-green-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Payment Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------------- Analytics ---------------------------
const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30days');

  const stats = {
    totalClaims: 1247,
    approvalRate: 94.2,
    avgProcessingTime: 2.3,
    fraudDetected: 12,
    totalAmount: 124000,
    aiAccuracy: 96.8
  };

  const handleExportAnalytics = () => {
    window.alert('Exporting analytics report...');
  };

  const handleGenerateReport = () => {
    window.alert('Generating comprehensive analytics report...');
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Performance metrics and insights</p>
          </div>
          <div className="flex space-x-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>
            <button
              onClick={handleExportAnalytics}
              className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleGenerateReport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalClaims.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Claims</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
          <div className="text-2xl font-bold text-green-600">{stats.approvalRate}%</div>
          <div className="text-sm text-gray-600">Approval Rate</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
          <div className="text-2xl font-bold text-teal-600">{stats.avgProcessingTime}</div>
          <div className="text-sm text-gray-600">Avg Days</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
          <div className="text-2xl font-bold text-red-600">{stats.fraudDetected}</div>
          <div className="text-sm text-gray-600">Fraud Detected</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
          <div className="text-2xl font-bold text-purple-600">${(stats.totalAmount / 1000).toFixed(0)}K</div>
          <div className="text-sm text-gray-600">Total Amount</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
          <div className="text-2xl font-bold text-indigo-600">{stats.aiAccuracy}%</div>
          <div className="text-sm text-gray-600">AI Accuracy</div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Claims by Type</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization would appear here</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Time Trends</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Trend analysis would appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------------- Shell ---------------------------
const InsurancePortal = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/insurance' },
    { icon: <FileText className="w-5 h-5" />, label: 'Review Claims', path: '/insurance/review' },
    { icon: <CheckCircle className="w-5 h-5" />, label: 'Approved Claims', path: '/insurance/approved' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics', path: '/insurance/analytics' }
  ];

  return (
    <PortalLayout title="Insurance Portal" menuItems={menuItems} currentPath={location.pathname} headerColor="bg-green-600">
      <Routes>
        <Route path="/" element={<InsuranceDashboard />} />
        <Route path="/review" element={<ClaimReview />} />
        <Route path="/approved" element={<ApprovedClaims />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </PortalLayout>
  );
};

export default InsurancePortal;
