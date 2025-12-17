import { useEmployee } from "../../../contexts/EmployeeContext";
import {
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import SimpleLineChart from "../../shared/SimpleLineChart";

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


const EmployeeDashboard = () => {
  const { claims, fetchAllClaims, loading } = useEmployee();
  const backendClaims = claims as unknown as ClaimResponse[];

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

      {/* ANALYTICS CHART - LINE */}
      <SimpleLineChart
        title="My Spending Trend (Last 5 Claims)"
        data={backendClaims.slice(0, 5).reverse().map(c => ({
          label: new Date(c.submittedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          value: c.billedAmount
        }))}
        color="text-blue-500"
      />
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


export default EmployeeDashboard;
