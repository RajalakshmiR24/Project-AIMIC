import { useHospital } from "../../../contexts/HospitalContext";
import { useClaims } from "../../../contexts/ClaimsContext";
import { useMemo, useState } from "react";
// Link removed (unused)
import { Users, FileText, Activity, IndianRupee } from "lucide-react";
import SimpleBarChart from "../../shared/SimpleBarChart";

const HospitalDashboard = () => {
  const { patients, reports, loading, fetchPatients, fetchReports } = useHospital();
  const { claims, loading: claimsLoading, fetchClaims } = useClaims();

  const [refreshing, setRefreshing] = useState(false);

  const totals = useMemo(() => {
    const approved = claims
      .filter((c: any) => c.claimStatus === "Approved")
      .reduce((sum: number, c: any) => sum + (c.approvedAmount || 0), 0);

    const pendingRejected = claims
      .filter(
        (c: any) => c.claimStatus === "Pending" || c.claimStatus === "Rejected"
      )
      .reduce((sum: number, c: any) => sum + (c.billedAmount || 0), 0);

    return {
      totalPatients: patients.length,
      reportsSubmitted: reports.length,
      pendingReports: reports.filter(
        (r: any) => String(r.status).toLowerCase() === "pending"
      ).length,
      totalClaims: claims.length,
      activeClaims: claims.filter((c: any) => c.claimStatus !== "Approved").length,
      approvedAmount: approved,
      pendingRejectedAmount: pendingRejected,
    };
  }, [patients, reports, claims]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPatients(), fetchReports(), fetchClaims()]);
    setRefreshing(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Dashboard Overview</h2>

        <button
          onClick={handleRefresh}
          className="px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-xs"
        >
          {refreshing ? "..." : "Refresh"}
        </button>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Total Patients */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">Total Patients</p>
              <p className="text-3xl font-bold">
                {loading ? "—" : totals.totalPatients}
              </p>
              <p className="text-xs text-green-600">Updated automatically</p>
            </div>
            <Users className="w-10 h-10 text-teal-600" />
          </div>
        </div>

        {/* Reports Submitted */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">Reports Submitted</p>
              <p className="text-3xl font-bold text-teal-600">
                {loading ? "—" : totals.reportsSubmitted}
              </p>
              <p className="text-xs text-teal-600">{totals.pendingReports} pending</p>
            </div>
            <FileText className="w-10 h-10 text-teal-600" />
          </div>
        </div>

        {/* Total Claims */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">Total Claims</p>
              <p className="text-3xl font-bold text-orange-600">
                {claimsLoading ? "—" : totals.totalClaims}
              </p>
              <p className="text-xs text-orange-600">{totals.activeClaims} active</p>
            </div>
            <Activity className="w-10 h-10 text-orange-600" />
          </div>
        </div>

        {/* Approved Amount */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">Approved Amount</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{totals.approvedAmount.toLocaleString()}
              </p>
            </div>
            <IndianRupee className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Pending & Rejected Amount */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">Pending & Rejected Amount</p>
              <p className="text-3xl font-bold text-red-600">
                ₹{totals.pendingRejectedAmount.toLocaleString()}
              </p>
            </div>
            <IndianRupee className="w-10 h-10 text-red-600" />
          </div>
        </div>
      </div>

      {/* ANALYTICS CHARTS */}
      <div className="grid md:grid-cols-2 gap-6">
        <SimpleBarChart
          title="Activity Volume"
          data={[
            { label: "Patients", value: totals.totalPatients, color: "bg-teal-500" },
            { label: "Reports", value: totals.reportsSubmitted, color: "bg-blue-500" },
            { label: "Claims", value: totals.totalClaims, color: "bg-orange-500" },
          ]}
        />

        <SimpleBarChart
          title="Financial Overview"
          data={[
            { label: "Approved", value: totals.approvedAmount, color: "bg-green-500" },
            { label: "Pending/Rejected", value: totals.pendingRejectedAmount, color: "bg-red-500" },
          ]}
        />
      </div>
    </div>
  );
};

export default HospitalDashboard;
