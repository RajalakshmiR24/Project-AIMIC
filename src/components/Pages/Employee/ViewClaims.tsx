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

/* ---- BACKEND CLAIM SHAPE ---- */
type ClaimResponse = {
  _id?: string;
  claimNumber: string;
  claimStatus: string;
  billedAmount: number;
  submittedDate: string;
  notes?: string;

  patientId?: { fullName?: string };
  insuranceId?: { insuranceProvider?: string; policyNumber?: string };
  medicalReportId?: { reportType?: string };

  attachments?: { fileName: string }[];
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

  // extract unique report types
  const reportTypes = Array.from(
    new Set(
      backendClaims
        .map((c) => c.medicalReportId?.reportType)
        .filter(Boolean)
    )
  );

  const filteredClaims = useMemo(() => {
    const q = searchTerm.toLowerCase();

    return backendClaims.filter((claim) => {
      const matchesSearch =
        claim.claimNumber.toLowerCase().includes(q) ||
        claim.patientId?.fullName?.toLowerCase().includes(q) ||
        claim.medicalReportId?.reportType?.toLowerCase().includes(q) ||
        claim.billedAmount.toString().includes(q);

      const matchesStatus =
        statusFilter === "all" || claim.claimStatus === statusFilter;

      const matchesReport =
        reportFilter === "all" ||
        claim.medicalReportId?.reportType === reportFilter;

      return matchesSearch && matchesStatus && matchesReport;
    });
  }, [backendClaims, searchTerm, statusFilter, reportFilter]);

  return (
    <div className="space-y-6 p-6">
      {/* Filters + Search */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">

          {/* Search */}
          <div className="flex-1 relative w-full">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Claim #, Patient, Report..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Report Type Filter */}
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
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
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
            <div className="text-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto" />
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No claims found.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3 border">Claim #</th>
                  <th className="p-3 border">Patient</th>
                  <th className="p-3 border">Report</th>
                  <th className="p-3 border">Amount</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Submitted</th>
                  <th className="p-3 border text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredClaims.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-100 transition">
                    <td className="p-3 border font-medium">{c.claimNumber}</td>
                    <td className="p-3 border">{c.patientId?.fullName || "—"}</td>
                    <td className="p-3 border">{c.medicalReportId?.reportType || "—"}</td>
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
                        className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition"
                      >
                        <Eye className="w-5 h-5" />
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
                  <Detail label="Status" value={selectedClaim.claimStatus} />
                  <Detail label="Patient" value={selectedClaim.patientId?.fullName} />
                  <Detail
                    label="Insurance"
                    value={`${selectedClaim.insuranceId?.insuranceProvider || ""} ${selectedClaim.insuranceId?.policyNumber || ""}`}
                  />
                  <Detail label="Report" value={selectedClaim.medicalReportId?.reportType} />
                </div>

                <div className="space-y-2 text-sm">
                  <Detail label="Billed Amount" value={`₹${selectedClaim.billedAmount}`} />
                  <Detail
                    label="Submitted"
                    value={new Date(selectedClaim.submittedDate).toLocaleString()}
                  />
                  {selectedClaim.notes && (
                    <Detail label="Notes" value={selectedClaim.notes} />
                  )}
                </div>
              </div>

              {selectedClaim.attachments?.length ? (
                <div>
                  <p className="font-semibold mb-1">Attachments:</p>
                  <ul className="list-disc ml-6">
                    {selectedClaim.attachments.map((a) => (
                      <li key={a.fileName}>{a.fileName}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

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
