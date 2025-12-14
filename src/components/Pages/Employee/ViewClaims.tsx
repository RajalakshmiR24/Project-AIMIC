// ViewClaims.tsx — UPDATED TO MATCH LATEST CLAIMS API RESPONSE

import { useState, useMemo } from "react";
import { useEmployee } from "../../../contexts/EmployeeContext";
import {
  Search,
  Filter,
  Eye,
  Download,
  FileText,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";

/* ---- UPDATED BACKEND CLAIM SHAPE ---- */
type ClaimResponse = {
  _id: string;
  claimStatus: string;
  billedAmount: number;
  submittedDate: string;
  notes?: string;

  patientId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    fullName?: string;
  };

  insuranceId?: {
    _id: string;
    insuranceProvider?: string;
    policyNumber?: string;
  };

  medicalReportId?: {
    _id: string;
    reportType?: string;
  };
};

const statusPillClass = (status?: string) => {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const Detail = ({ label, value }: { label: string; value?: string }) => (
  <p className="text-sm">
    <span className="font-semibold">{label}: </span>
    {value || "—"}
  </p>
);

const ViewClaims = () => {
  const { claims, loading, fetchAllClaims } = useEmployee();
  const backendClaims = claims as unknown as ClaimResponse[];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportFilter, setReportFilter] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState<ClaimResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const reportTypes = Array.from(
    new Set(
      backendClaims
        .map((c) => c.medicalReportId?.reportType)
        .filter(Boolean)
    )
  );

  const filteredClaims = useMemo(() => {
    const q = searchTerm.toLowerCase();

    return backendClaims.filter((c) => {
      const matchesSearch =
        c.patientId?.fullName?.toLowerCase().includes(q) ||
        c.medicalReportId?.reportType?.toLowerCase().includes(q) ||
        c.billedAmount.toString().includes(q);

      const matchesStatus =
        statusFilter === "all" || c.claimStatus === statusFilter;

      const matchesReport =
        reportFilter === "all" ||
        c.medicalReportId?.reportType === reportFilter;

      return matchesSearch && matchesStatus && matchesReport;
    });
  }, [backendClaims, searchTerm, statusFilter, reportFilter]);

  return (
    <div className="space-y-6 p-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative w-full">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
              placeholder="Search patient, report, amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              className="pl-10 pr-8 py-3 border rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Report */}
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              className="pl-10 pr-8 py-3 border rounded-lg"
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value)}
            >
              <option value="all">All Reports</option>
              {reportTypes.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchAllClaims}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            All Claims ({filteredClaims.length})
          </h2>
        </div>

        <div className="p-6 overflow-x-auto">
          {loading ? (
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-gray-400" />
          ) : filteredClaims.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-2" />
              No claims found
            </div>
          ) : (
            <table className="w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 border">Patient</th>
                  <th className="p-3 border">Insurance</th>
                  <th className="p-3 border">Report</th>
                  <th className="p-3 border">Amount</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Submitted</th>
                  <th className="p-3 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="p-3 border">
                      <div className="font-medium">{c.patientId?.fullName}</div>
                      <div className="text-xs text-gray-500">
                        {c.patientId?.email}
                      </div>
                    </td>

                    <td className="p-3 border">
                      {c.insuranceId ? (
                        <>
                          <b>{c.insuranceId.insuranceProvider}</b>
                          <br />
                          {c.insuranceId.policyNumber}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="p-3 border">
                      {c.medicalReportId?.reportType || "—"}
                    </td>

                    <td className="p-3 border">₹{c.billedAmount}</td>

                    <td className="p-3 border">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${statusPillClass(
                          c.claimStatus
                        )}`}
                      >
                        {c.claimStatus}
                      </span>
                    </td>

                    <td className="p-3 border">
                      {new Date(c.submittedDate).toLocaleDateString()}
                    </td>

                    <td className="p-3 border text-center">
                      <button
                        onClick={() => {
                          setSelectedClaim(c);
                          setShowDetails(true);
                        }}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showDetails && selectedClaim && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Claim Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Detail label="Patient" value={selectedClaim.patientId?.fullName} />
                <Detail label="Report" value={selectedClaim.medicalReportId?.reportType} />
                <Detail
                  label="Insurance"
                  value={`${selectedClaim.insuranceId?.insuranceProvider || ""} ${selectedClaim.insuranceId?.policyNumber || ""}`}
                />
                <Detail label="Status" value={selectedClaim.claimStatus} />
              </div>

              <div className="space-y-2">
                <Detail label="Amount" value={`₹${selectedClaim.billedAmount}`} />
                <Detail
                  label="Submitted"
                  value={new Date(selectedClaim.submittedDate).toLocaleString()}
                />
                {selectedClaim.notes && (
                  <Detail label="Notes" value={selectedClaim.notes} />
                )}
              </div>
            </div>

            <div className="p-6 flex justify-end">
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewClaims;
