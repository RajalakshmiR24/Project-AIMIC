import React, { useEffect, useMemo, useState } from "react";
import { useInsurance } from "../../../contexts/InsuranceContext";
import { claimsApi } from "../../../api/claims.api";
import {
  ShieldCheckIcon,
  UsersIcon,
  BuildingLibraryIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { Insurance, Patient } from "../../../api/types";

/* ---------------- HELPERS ---------------- */

const extractPatients = (ref?: Patient[] | any) => {
  if (!ref) return [];
  if (Array.isArray(ref)) return ref;
  return [];
};

const getPatientNames = (ref?: any) =>
  extractPatients(ref)
    .map((p) => p?.fullName ?? "Unknown")
    .join(", ") || "Unknown";

const getPatientIds = (ref?: any) =>
  Array.from(new Set(extractPatients(ref).map((p) => p?._id))).filter(Boolean);

const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString() : "—";

/* ----------------------------------------- */

const InsuranceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { records = [], loading, fetchInsurance } = useInsurance();

  const [search, setSearch] = useState("");
  const [filteredRecords, setFilteredRecords] = useState<Insurance[]>([]);
  const [pendingClaims, setPendingClaims] = useState<number>(0);

  useEffect(() => {
    fetchInsurance();
    loadPendingClaims();
  }, [fetchInsurance]);

  const loadPendingClaims = async () => {
    try {
      const res = await claimsApi.getAllClaims();
      setPendingClaims(res.length);
    } catch {
      setPendingClaims(0);
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setFilteredRecords(records);
      return;
    }

    const s = search.toLowerCase().trim();

    const filtered = records.filter((r) => {
      const provider = r.insuranceProvider ?? "";
      const insuranceId = (r as any).insuranceId ?? "";
      const patientNames = getPatientNames(r.patientId);

      return (
        provider.toLowerCase().includes(s) ||
        insuranceId.toLowerCase().includes(s) ||
        patientNames.toLowerCase().includes(s)
      );
    });

    setFilteredRecords(filtered);
  }, [search, records]);

  const stats = useMemo(() => {
    const patients = new Set<string>();
    records.forEach((r) =>
      getPatientIds(r.patientId).forEach((id) => patients.add(id))
    );

    const providers = new Set(
      records.map((r) => r.insuranceProvider?.trim()).filter(Boolean)
    );

    return {
      totalRecords: records.length,
      totalProviders: providers.size,
      totalPatients: patients.size,
    };
  }, [records]);

  const latestRecords = useMemo(
    () =>
      [...filteredRecords]
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? "").getTime() -
            new Date(a.createdAt ?? "").getTime()
        )
        .slice(0, 5),
    [filteredRecords]
  );

  return (
    <div className="space-y-10">

      {/* HEADER + SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Insurance Dashboard
        </h2>

        <div className="relative w-full md:w-1/3">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search provider, insurance ID, or patient…"
            className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-md border rounded-xl shadow focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Total Records */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] transition cursor-pointer">
          <div className="flex justify-between items-center">
            <p className="opacity-90">Total Records</p>
            <ShieldCheckIcon className="w-12 h-12 opacity-90" />
          </div>
          <p className="text-4xl font-bold mt-3">{loading ? "—" : stats.totalRecords}</p>
        </div>

        {/* Providers */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] transition cursor-pointer">
          <div className="flex justify-between items-center">
            <p className="opacity-90">Providers</p>
            <BuildingLibraryIcon className="w-12 h-12 opacity-90" />
          </div>
          <p className="text-4xl font-bold mt-3">{loading ? "—" : stats.totalProviders}</p>
        </div>

        {/* Patients Covered */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] transition cursor-pointer">
          <div className="flex justify-between items-center">
            <p className="opacity-90">Patients Covered</p>
            <UsersIcon className="w-12 h-12 opacity-90" />
          </div>
          <p className="text-4xl font-bold mt-3">{loading ? "—" : stats.totalPatients}</p>
        </div>

        {/* Pending Claims */}
        <div
          onClick={() => navigate("/claims")}
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] transition cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <p className="opacity-90">Pending Claims</p>
            <ClipboardDocumentListIcon className="w-12 h-12 opacity-90" />
          </div>
          <p className="text-4xl font-bold mt-3">{pendingClaims}</p>
        </div>

      </div>

      {/* RECENT RECORDS */}
      <div className="bg-white rounded-2xl shadow-xl border">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">
            Recent Insurance Records
          </h3>
          <button
            onClick={() => navigate("/insurance/records")}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[750px] w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3 text-left">Provider</th>
                <th className="p-3 text-left">Insurance ID</th>
                <th className="p-3 text-left">Patients</th>
                <th className="p-3 text-left">Created</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-4 text-center">Loading…</td></tr>
              ) : latestRecords.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-400">No records</td></tr>
              ) : (
                latestRecords.map((ins) => (
                  <tr
                    key={ins._id}
                    onClick={() => navigate(`/insurance/record/${ins._id}`)}
                    className="border-b hover:bg-blue-50 transition cursor-pointer"
                  >
                    <td className="p-3">{ins.insuranceProvider}</td>
                    <td className="p-3">{(ins as any).insuranceId}</td>
                    <td className="p-3">{getPatientNames(ins.patientId)}</td>
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
