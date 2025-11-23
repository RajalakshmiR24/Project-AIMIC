import { useState, useMemo } from "react";
import { useEmployee } from "../../../contexts/EmployeeContext";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Claim } from "../../../api/types";

const statusPillClass = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "under_review":
      return "bg-blue-100 text-blue-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const ViewClaims = () => {
  const { claims, loading } = useEmployee();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  /* -------------------------------------------------------------
     FILTER CLAIMS
  ------------------------------------------------------------- */
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        claim.claimNumber?.toLowerCase().includes(q) ||
        claim.type?.toLowerCase().includes(q) ||
        claim.riskLevel?.toLowerCase().includes(q) ||
        claim.priority?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || claim.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [claims, searchTerm, statusFilter]);

  /* -------------------------------------------------------------
     OPEN MODAL
  ------------------------------------------------------------- */
  const handleViewDetails = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* ------------------ Search + Filter ------------------ */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by claim number, type, priority, risk..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              className="pl-10 pr-8 py-3 border rounded-lg"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | string)
              }
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* ------------------ Claims List ------------------ */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            My Claims ({filteredClaims.length})
          </h2>

          <Link
            to="/employee/submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" /> <span>New Claim</span>
          </Link>
        </div>

        <div className="p-6">
          {/* Loading */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 animate-spin mx-auto" />
            </div>
          ) : filteredClaims.length > 0 ? (
            <div className="space-y-4">
              {filteredClaims.map((claim) => (
                <div
                  key={claim._id}
                  className="border rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {claim.claimNumber}
                        </h3>

                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${statusPillClass(
                            claim.status
                          )}`}
                        >
                          {claim.status.replace("_", " ")}
                        </span>
                      </div>

                      <p className="text-gray-700">Type: {claim.type}</p>
                      <p className="text-gray-500 text-sm">
                        Priority: {claim.priority} • Risk: {claim.riskLevel}
                      </p>
                      <p className="text-gray-500 text-sm">
                        AI Score: {claim.aiScore}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{claim.amount}
                      </p>
                      <p className="text-sm text-gray-500">
                        Submitted:{" "}
                        {claim.submittedDate ||
                          (claim.createdAt &&
                            new Date(claim.createdAt).toLocaleDateString()) ||
                          "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleViewDetails(claim)}
                      className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>

                    <button className="flex items-center gap-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No claims found.</p>
            </div>
          )}
        </div>
      </div>

      {/* ------------------ Claim Details Modal ------------------ */}
      {showDetails && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">
                Claim Details – {selectedClaim.claimNumber}
              </h3>

              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 text-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Claim Information
                  </h4>

                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {selectedClaim.type}
                  </p>

                  <p>
                    <span className="font-medium">Amount:</span> ₹
                    {selectedClaim.amount}
                  </p>

                  <p>
                    <span className="font-medium">Submitted:</span>{" "}
                    {selectedClaim.submittedDate ||
                      (selectedClaim.createdAt &&
                        new Date(
                          selectedClaim.createdAt
                        ).toLocaleDateString()) ||
                      "—"}
                  </p>

                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${statusPillClass(
                        selectedClaim.status
                      )}`}
                    >
                      {selectedClaim.status.replace("_", " ")}
                    </span>
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Risk & AI Insights
                  </h4>

                  <p>
                    <span className="font-medium">Priority:</span>{" "}
                    {selectedClaim.priority}
                  </p>

                  <p>
                    <span className="font-medium">Risk Level:</span>{" "}
                    {selectedClaim.riskLevel}
                  </p>

                  <p>
                    <span className="font-medium">AI Score:</span>{" "}
                    {selectedClaim.aiScore}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
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

export default ViewClaims;
