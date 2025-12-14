import { useState } from "react";
import { useEmployee } from "../../../contexts/EmployeeContext";
import {
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  X,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

type ClaimResponse = {
  _id: string;
  claimNumber: string;
  claimStatus: string;
  billedAmount: number;
  approvedAmount?: number | null;
  submittedDate: string;
  notes?: string;
  denialReason?: string | null;

  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
  };

  insuranceId: {
    _id: string;
    insuranceProvider: string;
    policyNumber: string;
  };

  medicalReportId: {
    _id: string;
    reportType: string;
  };

  submittedBy?: {
    _id: string;
    name: string;
    role: string;
  };
};

const statusPillClass = (status: string) => {
  const map: Record<string, string> = {
    Approved: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Rejected: "bg-red-100 text-red-700",
    Denied: "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};

const EmployeeDashboard = () => {
  const { claims, fetchAllClaims, loading } = useEmployee();
  const backendClaims = claims as unknown as ClaimResponse[];

  const [selectedClaim, setSelectedClaim] = useState<ClaimResponse | null>(null);
  const [showClaimDetails, setShowClaimDetails] = useState(false);

  const totalClaims = backendClaims.length;
  const approved = backendClaims.filter((c) => c.claimStatus === "Approved").length;
  const pending = backendClaims.filter((c) => c.claimStatus === "Pending").length;

  const totalAmount = backendClaims.reduce(
    (sum, c) => sum + (c.billedAmount || 0),
    0
  );

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Employee Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of claims</p>
        </div>

        <button
          onClick={fetchAllClaims}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* CARD GRID */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card
          title="Total Claims"
          value={totalClaims}
          icon={<FileText className="w-6 h-6 text-blue-600" />}
        />
        <Card
          title="Approved"
          value={approved}
          icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
        />
        <Card
          title="Pending"
          value={pending}
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
        />
        <Card
          title="Total Amount"
          value={`₹${totalAmount}`}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
        />
      </div>

      {/* RECENT CLAIMS TABLE */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Claims</h2>
          <Link
            to="/employee/claims"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
          >
            View All <Eye className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="p-3 border">Claim #</th>
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
              {backendClaims.slice(0, 8).map((c) => (
                <tr key={c._id} className="hover:bg-gray-100 transition">
                  <td className="p-3 border font-medium">{c.claimNumber}</td>

                  <td className="p-3 border">{c.patientId?.fullName}</td>

                  <td className="p-3 border">
                    {c.insuranceId.insuranceProvider} <br />
                    <span className="text-xs text-gray-500">
                      {c.insuranceId.policyNumber}
                    </span>
                  </td>

                  <td className="p-3 border">{c.medicalReportId.reportType}</td>

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
                        setShowClaimDetails(true);
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
        </div>
      </div>

      {/* CLAIM MODAL */}
      {showClaimDetails && selectedClaim && (
        <Modal claim={selectedClaim} onClose={() => setShowClaimDetails(false)} />
      )}
    </div>
  );
};

const Card = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: JSX.Element;
}) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
    <div className="flex-1">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
    <div className="opacity-80">{icon}</div>
  </div>
);

const Modal = ({ claim, onClose }: { claim: ClaimResponse; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Claim — {claim.claimNumber}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <p><strong>Status:</strong> {claim.claimStatus}</p>

        <p>
          <strong>Patient:</strong> {claim.patientId.fullName}  
          <br />
          <span className="text-xs text-gray-500">{claim.patientId.email}</span>
        </p>

        <p>
          <strong>Insurance:</strong> {claim.insuranceId.insuranceProvider}  
          <br />
          <span className="text-xs">{claim.insuranceId.policyNumber}</span>
        </p>

        <p><strong>Report:</strong> {claim.medicalReportId.reportType}</p>

        <p><strong>Billed Amount:</strong> ₹{claim.billedAmount}</p>

        {claim.approvedAmount !== null && (
          <p><strong>Approved Amount:</strong> ₹{claim.approvedAmount}</p>
        )}

        <p>
          <strong>Submitted:</strong>{" "}
          {new Date(claim.submittedDate).toLocaleString()}
        </p>

        {claim.notes && <p><strong>Notes:</strong> {claim.notes}</p>}

        {claim.denialReason && (
          <p className="text-red-600">
            <strong>Denial Reason:</strong> {claim.denialReason}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default EmployeeDashboard;
