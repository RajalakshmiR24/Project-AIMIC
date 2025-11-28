import { useDoctor } from "../../../contexts/DoctorContext";
import { useClaims } from "../../../contexts/ClaimsContext";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, FileText, Activity, IndianRupee } from "lucide-react";

const DoctorDashboard = () => {
  const { patients, reports, loading, fetchPatients, fetchReports } = useDoctor();
  const { claims, loading: claimsLoading, fetchClaims } = useClaims();

  const [refreshing, setRefreshing] = useState(false);

  const totals = useMemo(() => {
    const approved = claims
      .filter((c: any) => c.claimStatus === "Approved")
      .reduce((sum: number, c: any) => sum + (c.approvedAmount || 0), 0);

    const pendingRejected = claims
      .filter((c: any) => c.claimStatus === "Pending" || c.claimStatus === "Rejected")
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
              <p className="text-3xl font-bold">{loading ? "—" : totals.totalPatients}</p>
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

        {/* Pending + Rejected Amount */}
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

      {/* tables section remains unchanged */}
      {/* --------------------- TABLES --------------------- */}
      <div className="grid lg:grid-cols-3 gap-10">

        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-sm border lg:col-span-1">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Patients</h2>
            <Link to="/doctor/patients" className="text-sm text-teal-600">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 font-medium text-gray-700">Name</th>
                  <th className="p-3 font-medium text-gray-700">Age</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={2} className="p-4 text-center text-gray-500">Loading…</td></tr>
                ) : (
                  patients.slice(0, 5).map((p) => (
                    <tr key={p._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{p.fullName}</td>
                      <td className="p-3">{p.age}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm border lg:col-span-1">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Reports</h2>
            <Link to="/doctor/reports" className="text-sm text-teal-600">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 font-medium text-gray-700">Type</th>
                  <th className="p-3 font-medium text-gray-700">Patient</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={2} className="p-4 text-center text-gray-500">Loading…</td></tr>
                ) : (
                  reports.slice(0, 5).map((r) => (
                    <tr key={r._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{r.reportType}</td>
                      <td className="p-3">
                        {typeof r.patientId === "string" ? r.patientId : r.patientId?.fullName}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Claims */}
        <div className="bg-white rounded-xl shadow-sm border lg:col-span-1">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Claims</h2>
            <Link to="/doctor/claims" className="text-sm text-orange-600">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 font-medium text-gray-700">Claim #</th>
                  <th className="p-3 font-medium text-gray-700">Patient</th>
                  <th className="p-3 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {claimsLoading ? (
                  <tr><td colSpan={3} className="p-4 text-center text-gray-500">Loading…</td></tr>
                ) : (
                  claims.slice(0, 5).map((c) => (
                    <tr key={c._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{c.claimNumber}</td>
                      <td className="p-3">{c.patientId?.fullName}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            c.claimStatus === "Approved"
                              ? "bg-green-100 text-green-700"
                              : c.claimStatus === "Submitted"
                              ? "bg-blue-100 text-blue-700"
                              : c.claimStatus === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {c.claimStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
