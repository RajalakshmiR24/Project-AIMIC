// src/pages/AllClaimsPage.tsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useDoctor } from "../../../contexts/DoctorContext";
import { Eye, RefreshCcw, Search } from "lucide-react";

const AllClaimsPage: React.FC = () => {
  const { patients, reports, fetchReports, fetchPatients, getReport } = useDoctor();

  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  const formatDate = (d?: string | Date | null) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return String(d);
    }
  };

  const openViewClaimModal = async (id: string) => {
    const claim = await getReport(id);
    if (!claim) return;

    const patient =
      typeof claim.patientId === "object"
        ? claim.patientId
        : patients.find((p) => p._id === claim.patientId);

    Swal.fire({
      title: `<strong>Claim Details</strong>`,
      width: 900,
      html: `<div>...</div>`,
      confirmButtonText: "Close",
      showCloseButton: true,
    });
  };

  const handleSearch = () => {
    const q = query.toLowerCase();
    const claimStatus = ["Submitted", "Claim Pending", "Claim Approved", "Claim Rejected"];

    const f = reports.filter((r: any) => {
      const patient =
        typeof r.patientId === "object"
          ? r.patientId
          : patients.find((p) => p._id === r.patientId);

      return (
        claimStatus.includes(r.status) &&
        (r.reportType?.toLowerCase().includes(q) ||
          r.primaryDiagnosis?.toLowerCase().includes(q) ||
          patient?.fullName?.toLowerCase().includes(q) ||
          patient?.email?.toLowerCase().includes(q))
      );
    });

    setFiltered(f);
  };

  useEffect(() => {
    const load = async () => {
      await fetchPatients();
      await fetchReports();
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const claimStatus = ["Submitted", "Claim Pending", "Claim Approved", "Claim Rejected"];
    setFiltered(reports.filter((r: any) => claimStatus.includes(r.status)));
  }, [reports]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h1 className="text-2xl font-semibold">All Claims</h1>

        <button
          onClick={async () => {
            setLoading(true);
            await fetchReports();
            setLoading(false);
            handleSearch();
          }}
          className="px-3 py-2 bg-gray-200 rounded-lg flex items-center gap-2"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex gap-2 items-center bg-white p-3 border rounded-xl">
        <Search size={18} className="text-gray-500" />
        <input
          className="w-full outline-none text-sm"
          placeholder="Search claims by patient, diagnosis…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch} className="px-4 py-2 bg-gray-800 text-white rounded-lg">
          Search
        </button>
      </div>

      {/* RESPONSIVE SCROLL TABLE */}
      <div className="w-full overflow-x-auto rounded-xl border bg-white shadow-sm">
        {loading ? (
          <p className="p-5 text-center">Loading...</p>
        ) : (
          <table className="min-w-max w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Report Type</th>
                <th className="p-3 text-left">Primary Dx</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r: any) => {
                const patient =
                  typeof r.patientId === "object"
                    ? r.patientId
                    : patients.find((p) => p._id === r.patientId);

                return (
                  <tr key={r._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{patient?.fullName || "Unknown"}</div>
                      <div className="text-xs text-gray-500">{patient?.email}</div>
                    </td>
                    <td className="p-3">{r.reportType}</td>
                    <td className="p-3">{r.primaryDiagnosis}</td>
                    <td className="p-3">{r.status}</td>
                    <td className="p-3">{formatDate(r.createdAt)}</td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => openViewClaimModal(r._id)}
                        className="p-2 bg-gray-100 rounded-lg"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllClaimsPage;
