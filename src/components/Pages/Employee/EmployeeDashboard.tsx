import { useState } from "react";
import { useEmployee } from "../../../contexts/EmployeeContext";
import {
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  Eye,
  Upload,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Claim } from "../../../api/types";

const statusPillClass = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const EmployeeDashboard = () => {
  const { employee, claims } = useEmployee();

  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showClaimDetails, setShowClaimDetails] = useState(false);

  const totalClaims = claims.length;
  const approved = claims.filter((c) => c.status === "approved").length;
  const pending = claims.filter((c) => c.status === "pending").length;

  const totalAmount = claims.reduce((sum, c) => sum + (c.amount || 0), 0);

  const handleViewDetails = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowClaimDetails(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Employee Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Welcome, {employee?.userId?.name || "Employee"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-600">Total Claims</p>
          <p className="text-2xl font-bold">{totalClaims}</p>
          <FileText className="w-8 h-8 text-blue-600 mt-2" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{approved}</p>
          <CheckCircle2 className="w-8 h-8 text-green-600 mt-2" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          <Clock className="w-8 h-8 text-yellow-600 mt-2" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold">₹{totalAmount}</p>
          <DollarSign className="w-8 h-8 text-green-600 mt-2" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>
        <div className="p-6 grid md:grid-cols-3 gap-4">
          <Link
            to="/employee/submit"
            className="flex items-center gap-3 p-5 bg-blue-50 hover:bg-blue-100 rounded-xl border transition"
          >
            <div className="p-3 bg-blue-600 text-white rounded-lg">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-blue-700">Submit New Claim</p>
              <p className="text-sm text-blue-500">Start a new claim</p>
            </div>
          </Link>

          <Link
            to="/employee/claims"
            className="flex items-center gap-3 p-5 bg-teal-50 hover:bg-teal-100 rounded-xl border transition"
          >
            <div className="p-3 bg-teal-600 text-white rounded-lg">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-teal-700">View All Claims</p>
              <p className="text-sm text-teal-500">Track claim status</p>
            </div>
          </Link>

          <Link
            to="/employee/upload"
            className="flex items-center gap-3 p-5 bg-green-50 hover:bg-green-100 rounded-xl border transition"
          >
            <div className="p-3 bg-green-600 text-white rounded-lg">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-green-700">Upload Documents</p>
              <p className="text-sm text-green-500">Add supporting files</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Claims</h2>
          <Link
            to="/employee/claims"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
          >
            View All
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-6 space-y-4">
          {claims.slice(0, 3).map((claim) => (
            <div
              key={claim._id}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition"
            >
              <div>
                <p className="font-semibold">{claim.claimNumber}</p>
                <p className="text-sm text-gray-600">{claim.type}</p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 text-xs rounded-full ${statusPillClass(
                    claim.status
                  )}`}
                >
                  {claim.status}
                </span>

                <button
                  className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition"
                  onClick={() => handleViewDetails(claim)}
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Details Modal */}
      {showClaimDetails && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Claim Details — {selectedClaim.claimNumber}
              </h3>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowClaimDetails(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <strong>Type:</strong> {selectedClaim.type}
              </p>
              <p>
                <strong>Amount:</strong> ₹{selectedClaim.amount}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 text-xs rounded-full ${statusPillClass(
                    selectedClaim.status
                  )}`}
                >
                  {selectedClaim.status}
                </span>
              </p>
              <p>
                <strong>Submitted:</strong> {selectedClaim.submittedDate}
              </p>
              <p>
                <strong>Priority:</strong> {selectedClaim.priority}
              </p>
              <p>
                <strong>Risk Level:</strong> {selectedClaim.riskLevel}
              </p>
              <p>
                <strong>AI Score:</strong> {selectedClaim.aiScore}
              </p>

              <div className="pt-4 flex justify-end">
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
