import React, { useMemo, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Upload,
  Clock,
  Menu,
  X,
  Plus,
  Eye,
  CheckCircle2,
  AlertCircle,
  Download,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import PortalLayout from '../shared/PortalLayout';
import AIProcessingModal from '../ai/AIProcessingModal';
import { AIAnalysisResult } from '../../services/aiService';

/* ----------------------------- Types ----------------------------- */
type ClaimStatus = 'approved' | 'pending' | 'under_review';

interface Claim {
  id: string;
  type: string;
  amount: string; // display-formatted (e.g., "$1,250")
  status: ClaimStatus;
  date: string; // YYYY-MM-DD
  description: string;
  doctor?: string;
  hospital?: string;
  submittedDate?: string; // YYYY-MM-DD
}

interface UploadedDoc {
  id: number;
  name: string;
  size: string;
  date: string; // YYYY-MM-DD
  type: string;
  claimId: string | number;
  file?: File;
}

/* ---------------------- Helper UI Utilities ---------------------- */
const statusIcon = (status: ClaimStatus) => {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'pending':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'under_review':
      return <AlertCircle className="w-5 h-5 text-blue-500" />;
    default:
      return <Clock className="w-5 h-5 text-gray-500" />;
  }
};

const statusPillClass = (status: ClaimStatus) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'under_review':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/* -------------------------- Dashboard --------------------------- */
const EmployeeDashboard: React.FC = () => {
  const [claims] = useState<Claim[]>([
    { id: 'CL001', type: 'Outpatient', amount: '$1,250', status: 'approved', date: '2025-01-15', description: 'Routine checkup and blood tests' },
    { id: 'CL002', type: 'Prescription', amount: '$85', status: 'pending', date: '2025-01-10', description: 'Monthly medication refill' },
    { id: 'CL003', type: 'Emergency', amount: '$3,500', status: 'under_review', date: '2025-01-08', description: 'Emergency room visit for chest pain' }
  ]);

  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showClaimDetails, setShowClaimDetails] = useState(false);

  const handleViewDetails = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowClaimDetails(true);
  };

  const handleDownloadReport = (claimId: string) => {
    alert(`Downloading claim report for ${claimId}...`);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-xs text-green-600 font-medium">+2 this month</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-xs text-green-600 font-medium">66.7% approval rate</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">3</p>
              <p className="text-xs text-yellow-600 font-medium">Avg 2 days</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">$15,420</p>
              <p className="text-xs text-blue-600 font-medium">$2,340 pending</p>
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
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              to="/employee/submit"
              className="flex items-center space-x-3 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group border border-blue-200"
            >
              <div className="p-3 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-semibold text-blue-700 block">Submit New Claim</span>
                <span className="text-sm text-blue-600">Start a new claim process</span>
              </div>
            </Link>
            <Link
              to="/employee/claims"
              className="flex items-center space-x-3 p-6 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl hover:from-teal-100 hover:to-teal-200 transition-all duration-300 group border border-teal-200"
            >
              <div className="p-3 bg-teal-600 rounded-lg group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-semibold text-teal-700 block">View All Claims</span>
                <span className="text-sm text-teal-600">Track claim status</span>
              </div>
            </Link>
            <Link
              to="/employee/documents"
              className="flex items-center space-x-3 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 group border border-green-200"
            >
              <div className="p-3 bg-green-600 rounded-lg group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-semibold text-green-700 block">Upload Documents</span>
                <span className="text-sm text-green-600">Add supporting files</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Claims</h2>
            <Link
              to="/employee/claims"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
            >
              <span>View All</span>
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {claims.slice(0, 3).map((claim) => (
              <div key={claim.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  {statusIcon(claim.status)}
                  <div>
                    <p className="font-semibold text-gray-900">{claim.id}</p>
                    <p className="text-sm text-gray-600">{claim.type} • {claim.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{claim.amount}</p>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusPillClass(claim.status)}`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewDetails(claim)}
                    className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Claim Details Modal */}
      {showClaimDetails && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Claim Details - {selectedClaim.id}</h3>
                <button
                  onClick={() => setShowClaimDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Claim Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Type:</span> {selectedClaim.type}</p>
                    <p><span className="font-medium">Amount:</span> {selectedClaim.amount}</p>
                    <p><span className="font-medium">Date:</span> {selectedClaim.date}</p>
                    <p><span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${statusPillClass(selectedClaim.status)}`}>
                        {selectedClaim.status.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedClaim.description}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleDownloadReport(selectedClaim.id)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <Link
                  to={`/employee/edit/${selectedClaim.id}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowClaimDetails(false)}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Claim</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --------------------------- Submit Claim --------------------------- */
const SubmitClaim: React.FC = () => {
  const [formData, setFormData] = useState({
    claimType: '',
    treatmentDate: '',
    amount: '',
    description: '',
    doctorName: '',
    hospitalName: '',
    policyNumber: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedDoc[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAIProcessing, setShowAIProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [generatedClaimId, setGeneratedClaimId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedDoc[] = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type || 'Supporting Document',
      file,
      date: new Date().toISOString().split('T')[0],
      claimId: 'General'
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: number) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newId = 'CL' + Date.now().toString().slice(-6);
    setGeneratedClaimId(newId);

    // (Optional) construct data for the AI modal
    const claimData = {
      id: newId,
      type: formData.claimType,
      amount: parseFloat(formData.amount) || 0,
      documents: uploadedFiles,
      patientInfo: { policyNumber: formData.policyNumber },
      treatmentDetails: {
        date: formData.treatmentDate,
        description: formData.description,
        doctor: formData.doctorName,
        hospital: formData.hospitalName
      }
    };

    setShowAIProcessing(true);
  };

  const handleAIComplete = (result: AIAnalysisResult) => {
    setAiResult(result);
    setShowAIProcessing(false);
    setShowSuccess(true);
    setIsSubmitting(false);

    // Reset form after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        claimType: '',
        treatmentDate: '',
        amount: '',
        description: '',
        doctorName: '',
        hospitalName: '',
        policyNumber: ''
      });
      setUploadedFiles([]);
      setAiResult(null);
      setGeneratedClaimId(null);
    }, 5000);
  };

  const saveDraft = () => {
    localStorage.setItem('claimDraft', JSON.stringify(formData));
    alert('Draft saved successfully!');
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('claimDraft');
    if (draft) {
      setFormData(JSON.parse(draft));
      alert('Draft loaded successfully!');
    } else {
      alert('No draft found!');
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Claim Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your claim has been processed by our AI system with {aiResult?.confidence}% confidence. You will receive updates via email.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              Claim ID:{' '}
              <span className="font-mono font-bold text-blue-600">
                {generatedClaimId}
              </span>
            </p>
            {aiResult && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600">
                  AI Confidence: <span className="font-bold text-green-600">{aiResult.confidence}%</span>
                </p>
                <p className="text-sm text-gray-600">
                  Risk Level:{' '}
                  <span
                    className={`font-bold ${
                      aiResult.riskLevel === 'low'
                        ? 'text-green-600'
                        : aiResult.riskLevel === 'medium'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {aiResult.riskLevel}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Processing Time:{' '}
                  <span className="font-bold text-blue-600">
                    {Math.floor(aiResult.processingTime / 60)}m {aiResult.processingTime % 60}s
                  </span>
                </p>
              </div>
            )}
          </div>
          <Link
            to="/employee/claims"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Track Your Claims</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* AI Processing Modal */}
        <AIProcessingModal
          isOpen={showAIProcessing}
          onClose={() => setShowAIProcessing(false)}
          claimData={{
            id: generatedClaimId || 'temp',
            type: formData.claimType,
            amount: parseFloat(formData.amount) || 0,
            documents: uploadedFiles,
            patientInfo: {},
            treatmentDetails: {}
          }}
          onComplete={handleAIComplete}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Submit New Claim</h2>
            <div className="flex space-x-3">
              <button
                onClick={loadDraft}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
              >
                <Upload className="w-4 h-4" />
                <span>Load Draft</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Number *
              </label>
              <input
                type="text"
                placeholder="Enter your policy number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.policyNumber}
                onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Type *
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.claimType}
                onChange={(e) => setFormData({ ...formData, claimType: e.target.value })}
                required
              >
                <option value="">Select claim type</option>
                <option value="outpatient">Outpatient Treatment</option>
                <option value="inpatient">Inpatient Treatment</option>
                <option value="prescription">Prescription Drugs</option>
                <option value="emergency">Emergency Care</option>
                <option value="dental">Dental Care</option>
                <option value="vision">Vision Care</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treatment Date *
              </label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.treatmentDate}
                onChange={(e) => setFormData({ ...formData, treatmentDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Amount ($) *
              </label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Name
              </label>
              <input
                type="text"
                placeholder="Enter doctor's name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital/Clinic Name
              </label>
              <input
                type="text"
                placeholder="Enter hospital or clinic name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Treatment Description *
            </label>
            <textarea
              rows={4}
              placeholder="Describe your treatment, symptoms, and reason for claim"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Supporting Documents
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Drop files here or click to browse</p>
              <p className="text-sm text-gray-500 mb-4">Supported: PDF, JPG, PNG (Max 10MB each)</p>
              <input
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Files</span>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={saveDraft}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing...' : 'Process with AI'}</span>
            </button>
          </div>
        </form>

        {/* AI Processing Modal */}
        <AIProcessingModal
          isOpen={showAIProcessing}
          onClose={() => {
            setShowAIProcessing(false);
            setIsSubmitting(false);
          }}
          claimData={{
            id: generatedClaimId || 'temp',
            type: formData.claimType,
            amount: parseFloat(formData.amount) || 0,
            documents: uploadedFiles,
            patientInfo: { policyNumber: formData.policyNumber },
            treatmentDetails: {
              date: formData.treatmentDate,
              description: formData.description,
              doctor: formData.doctorName,
              hospital: formData.hospitalName
            }
          }}
          onComplete={handleAIComplete}
        />
      </div>
    </div>
  );
};

/* --------------------------- View Claims --------------------------- */
const ViewClaims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([
    {
      id: 'CL001',
      type: 'Outpatient Treatment',
      amount: '$1,250',
      status: 'approved',
      date: '2025-01-15',
      doctor: 'Dr. Smith',
      hospital: 'City General Hospital',
      description: 'Routine checkup and blood tests',
      submittedDate: '2025-01-14'
    },
    {
      id: 'CL002',
      type: 'Prescription Drugs',
      amount: '$85',
      status: 'pending',
      date: '2025-01-10',
      doctor: 'Dr. Johnson',
      hospital: 'Metro Pharmacy',
      description: 'Monthly medication refill',
      submittedDate: '2025-01-09'
    },
    {
      id: 'CL003',
      type: 'Emergency Care',
      amount: '$3,500',
      status: 'under_review',
      date: '2025-01-08',
      doctor: 'Dr. Wilson',
      hospital: 'Emergency Medical Center',
      description: 'Emergency room visit for chest pain',
      submittedDate: '2025-01-07'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClaimStatus>('all');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        claim.id.toLowerCase().includes(q) ||
        claim.type.toLowerCase().includes(q) ||
        claim.description.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [claims, searchTerm, statusFilter]);

  const handleViewDetails = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowDetails(true);
  };

  const handleDownload = (claimId: string) => {
    alert(`Downloading documents for claim ${claimId}...`);
  };

  const handleEdit = (claimId: string) => {
    alert(`Redirecting to edit claim ${claimId}...`);
  };

  const handleCancel = (claimId: string) => {
    if (confirm(`Are you sure you want to cancel claim ${claimId}?`)) {
      setClaims((prev) => prev.filter((c) => c.id !== claimId));
      alert(`Claim ${claimId} has been cancelled.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search claims by ID, type, or description..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ClaimStatus)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              All Claims ({filteredClaims.length})
            </h2>
            <Link
              to="/employee/submit"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Claim</span>
            </Link>
          </div>
        </div>
        <div className="p-6">
          {filteredClaims.length > 0 ? (
            <div className="space-y-4">
              {filteredClaims.map((claim) => (
                <div key={claim.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{claim.id}</h3>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusPillClass(claim.status)}`}>
                          {claim.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{claim.type}</p>
                      <p className="text-sm text-gray-500">{claim.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{claim.amount}</p>
                      <p className="text-sm text-gray-500">Submitted: {claim.submittedDate}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <p><span className="font-medium">Treatment Date:</span> {claim.date}</p>
                      <p><span className="font-medium">Doctor:</span> {claim.doctor}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Hospital:</span> {claim.hospital}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleViewDetails(claim)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => handleDownload(claim.id)}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    {claim.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleEdit(claim.id)}
                          className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleCancel(claim.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
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

      {/* Claim Details Modal */}
      {showDetails && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Claim Details - {selectedClaim.id}</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Claim Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Type:</span> {selectedClaim.type}</p>
                      <p><span className="font-medium">Amount:</span> {selectedClaim.amount}</p>
                      <p><span className="font-medium">Treatment Date:</span> {selectedClaim.date}</p>
                      <p><span className="font-medium">Submitted:</span> {selectedClaim.submittedDate}</p>
                      <p><span className="font-medium">Status:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${statusPillClass(selectedClaim.status)}`}>
                          {selectedClaim.status.replace('_', ' ')}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Healthcare Provider</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Doctor:</span> {selectedClaim.doctor}</p>
                      <p><span className="font-medium">Hospital:</span> {selectedClaim.hospital}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedClaim.description}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleDownload(selectedClaim.id)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </button>
                {selectedClaim.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleEdit(selectedClaim.id);
                      setShowDetails(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Claim</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------- Upload Documents -------------------------- */
const UploadDocuments: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDoc[]>([
    { id: 1, name: 'medical_report.pdf', size: '2.4 MB', date: '2025-01-15', type: 'Medical Report', claimId: 'CL001' },
    { id: 2, name: 'prescription.jpg', size: '1.1 MB', date: '2025-01-10', type: 'Prescription', claimId: 'CL002' },
    { id: 3, name: 'invoice.pdf', size: '856 KB', date: '2025-01-08', type: 'Invoice', claimId: 'CL003' }
  ]);

  const [dragActive, setDragActive] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedDoc[] = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      date: new Date().toISOString().split('T')[0],
      type: 'Supporting Document',
      claimId: selectedClaimId || 'General',
      file
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    alert(`${files.length} file(s) uploaded successfully!`);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const newFiles: UploadedDoc[] = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      date: new Date().toISOString().split('T')[0],
      type: 'Supporting Document',
      claimId: selectedClaimId || 'General',
      file
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    alert(`${files.length} file(s) uploaded successfully!`);
  };

  const deleteFile = (fileId: number) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
      alert('File deleted successfully!');
    }
  };

  const viewFile = (fileName: string) => {
    alert(`Opening ${fileName} in viewer...`);
  };

  const downloadFile = (fileName: string) => {
    alert(`Downloading ${fileName}...`);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Documents</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Associate with Claim (Optional)
          </label>
          <select
            className="w-full md:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedClaimId}
            onChange={(e) => setSelectedClaimId(e.target.value)}
          >
            <option value="">General Documents</option>
            <option value="CL001">CL001 - Outpatient Treatment</option>
            <option value="CL002">CL002 - Prescription Drugs</option>
            <option value="CL003">CL003 - Emergency Care</option>
          </select>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Drop files here</h3>
          <p className="text-gray-600 mb-4">or click to browse from your device</p>
          <p className="text-sm text-gray-500 mb-6">Supported formats: PDF, JPG, PNG (Max 10MB each)</p>
          <input
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Upload className="w-5 h-5" />
            <span>Choose Files</span>
          </label>
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Uploaded Documents ({uploadedFiles.length})
            </h3>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete all files?')) {
                  setUploadedFiles([]);
                  alert('All files deleted successfully!');
                }
              }}
              className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          {uploadedFiles.length > 0 ? (
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {file.size} • {file.type} • {file.claimId} • Uploaded on {file.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => viewFile(file.name)}
                      className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="View file"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadFile(file.name)}
                      className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
              <p className="text-sm text-gray-400 mt-2">Upload your first document to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------- Portal Wrapper -------------------------- */
const EmployeePortal: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/employee' },
    { icon: <Plus className="w-5 h-5" />, label: 'Submit Claim', path: '/employee/submit' },
    { icon: <FileText className="w-5 h-5" />, label: 'My Claims', path: '/employee/claims' },
    { icon: <Upload className="w-5 h-5" />, label: 'Documents', path: '/employee/documents' }
  ];

  return (
    <PortalLayout
      title="Employee Portal"
      menuItems={menuItems}
      currentPath={location.pathname}
      headerColor="bg-blue-600"
    >
      <Routes>
        <Route path="/" element={<EmployeeDashboard />} />
        <Route path="/submit" element={<SubmitClaim />} />
        <Route path="/claims" element={<ViewClaims />} />
        <Route path="/documents" element={<UploadDocuments />} />
      </Routes>
    </PortalLayout>
  );
};

export default EmployeePortal;
