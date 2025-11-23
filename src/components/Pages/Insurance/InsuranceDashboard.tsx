import React, { useEffect, useMemo, useState } from "react";
import { useInsurance } from "../../../contexts/InsuranceContext";
import { ShieldCheckIcon, UsersIcon, BuildingLibraryIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Insurance, Patient } from "../../../api/types";

/* ----------- SAFE HELPERS ------------ */
const getPatientName = (p: string | Patient) =>
typeof p === "string" ? "Unknown" : p?.fullName ?? "Unknown";

const formatDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : "—");

/* -------------------------------------- */

const InsuranceDashboard: React.FC = () => {
const navigate = useNavigate();
const {
records,
loading,
fetchInsurance,
searchInsurance,
getInsuranceByPatientId,
} = useInsurance();

const [search, setSearch] = useState("");
const [filteredRecords, setFilteredRecords] = useState<Insurance[]>([]);

/* LOAD INITIAL */
useEffect(() => {
fetchInsurance();
}, []);

/* SEARCH & FILTER */
useEffect(() => {
if (!search) {
setFilteredRecords(records);
} else {
const s = search.toLowerCase();
const filtered = records.filter(
(r) =>
r.insuranceProvider?.toLowerCase().includes(s) ||
r.policyNumber?.toLowerCase().includes(s) ||
getPatientName(r.patientId).toLowerCase().includes(s)
);
setFilteredRecords(filtered);
}
}, [records, search]);

/* STATS */
const stats = useMemo(() => {
return {
totalRecords: records.length,
totalProviders: new Set(records.map((r) => r.insuranceProvider)).size,
totalPatients: new Set(
records.map((r) => (typeof r.patientId === "string" ? r.patientId : r.patientId?._id))
).size,
};
}, [records]);

/* LATEST RECORDS (limit 5) */
const latestRecords = useMemo(() => {
return [...filteredRecords]
.sort((a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime())
.slice(0, 5);
}, [filteredRecords]);

return ( <div className="space-y-8">

```
  {/* TITLE & SEARCH */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <h2 className="text-3xl font-bold text-gray-800">Insurance Dashboard</h2>

    <div className="flex items-center gap-2 w-full md:w-1/3">
      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute ml-3" />
      <input
        type="text"
        placeholder="Search by provider, policy, or patient..."
        className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  </div>

  {/* STATS CARDS */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg border flex items-center justify-between">
      <div>
        <p className="text-gray-500">Total Insurance Records</p>
        <p className="text-3xl font-bold text-gray-800">{loading ? "—" : stats.totalRecords}</p>
      </div>
      <ShieldCheckIcon className="w-12 h-12 text-green-500" />
    </div>

    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg border flex items-center justify-between">
      <div>
        <p className="text-gray-500">Insurance Providers</p>
        <p className="text-3xl font-bold text-blue-600">{loading ? "—" : stats.totalProviders}</p>
      </div>
      <BuildingLibraryIcon className="w-12 h-12 text-blue-600" />
    </div>

    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg border flex items-center justify-between">
      <div>
        <p className="text-gray-500">Patients Covered</p>
        <p className="text-3xl font-bold text-purple-600">{loading ? "—" : stats.totalPatients}</p>
      </div>
      <UsersIcon className="w-12 h-12 text-purple-600" />
    </div>
  </div>

  {/* LATEST INSURANCE RECORDS */}
  <div className="bg-white rounded-xl shadow border">
    <div className="flex justify-between items-center p-6 border-b">
      <h3 className="text-lg font-semibold text-gray-700">Recent Insurance Records</h3>
      <button
        onClick={() => navigate("/insurance/records")}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        View All
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-[700px] w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-3 text-left">Provider</th>
            <th className="p-3 text-left">Policy #</th>
            <th className="p-3 text-left">Insured</th>
            <th className="p-3 text-left">Patient</th>
            <th className="p-3 text-left">Created At</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">Loading…</td>
            </tr>
          ) : latestRecords.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-400">No recent records</td>
            </tr>
          ) : (
            latestRecords.map((ins) => (
              <tr key={ins._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{ins.insuranceProvider}</td>
                <td className="p-3">{ins.policyNumber ?? "—"}</td>
                <td className="p-3">{ins.insuredName ?? "—"}</td>
                <td className="p-3">{getPatientName(ins.patientId)}</td>
                <td className="p-3">{formatDate(ins.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    <div className="p-4 text-sm text-gray-500 text-center">
      Showing latest 5 records
    </div>
  </div>
</div>


);
};

export default InsuranceDashboard;
