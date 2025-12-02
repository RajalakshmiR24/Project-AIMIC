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

const getPatientName = (ref?: Patient | any) => {
  if (!ref) return "Unknown";
  const first = ref.firstName ?? "";
  const last = ref.lastName ?? "";
  const full = `${first} ${last}`.trim();
  return full || "Unknown";
};

const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString() : "—";

/* ----------------------------------------------------
   FULL DYNAMIC RENDERER FOR ALL FIELDS (from InsuranceRecords)
---------------------------------------------------- */
const isObject = (v: any) => v && typeof v === "object" && !Array.isArray(v);

const RenderField = ({ label, value }: { label: string; value: any }) => {
  if (isObject(value)) {
    return (
      <div className="border rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-2 capitalize">{label}</h3>
        <div className="pl-4 border-l space-y-2">
          {Object.entries(value).map(([k, v]) => (
            <RenderField key={k} label={k} value={v} />
          ))}
        </div>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="border rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-2 capitalize">{label}</h3>
        <div className="space-y-3">
          {value.map((item, i) => (
            <div key={i} className="border rounded p-3 bg-gray-50">
              {isObject(item)
                ? Object.entries(item).map(([k, v]) => (
                    <RenderField key={k} label={k} value={v} />
                  ))
                : String(item)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between border-b pb-1 text-sm">
      <span className="font-medium text-gray-600 capitalize">{label}</span>
      <span className="text-gray-800">{String(value)}</span>
    </div>
  );
};

const InsuranceDetailsFull = ({ data }: { data: any }) => {
  if (!data) return null;

  return (
    <div className="p-6 max-h-[85vh] overflow-auto space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3">
        Insurance Full Details
      </h2>

      {Object.entries(data).map(([k, v]) => (
        <RenderField key={k} label={k} value={v} />
      ))}
    </div>
  );
};

/* ---------------- COMPONENT ---------------- */

const InsuranceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { records = [], loading, fetchInsurance } = useInsurance();

  const [search, setSearch] = useState("");
  const [filteredRecords, setFilteredRecords] = useState<Insurance[]>([]);
  const [pendingClaims, setPendingClaims] = useState<number>(0);
  const [fullView, setFullView] = useState<any>(null);

  /* Load insurance + claims */
  useEffect(() => {
    fetchInsurance();
    loadPendingClaims();
  }, []);

  const loadPendingClaims = async () => {
    try {
      const res = await claimsApi.getAllClaims();
      setPendingClaims(res.length);
    } catch {
      setPendingClaims(0);
    }
  };

  /* Search filter */
  useEffect(() => {
    const s = search.toLowerCase().trim();
    if (!s) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter((r) => {
      const provider = r.insuranceProvider?.toLowerCase() || "";
      const insuranceId = (r as any).insuranceId?.toLowerCase() || "";
      const patientName = getPatientName(r.patientId)?.toLowerCase();

      return (
        provider.includes(s) ||
        insuranceId.includes(s) ||
        patientName.includes(s)
      );
    });

    setFilteredRecords(filtered);
  }, [search, records]);

  /* Stats */
  const stats = useMemo(() => {
    const patientSet = new Set<string>();

    records.forEach((r) => {
      if (r.patientId?._id) patientSet.add(r.patientId._id);
    });

    const providerSet = new Set(
      records.map((r) => r.insuranceProvider?.trim()).filter(Boolean)
    );

    return {
      totalRecords: records.length,
      totalProviders: providerSet.size,
      totalPatients: patientSet.size,
    };
  }, [records]);

  /* Latest 5 */
  const latestRecords = useMemo(
    () =>
      [...filteredRecords]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
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

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer">
          <div className="flex justify-between items-center">
            <p className="opacity-90">Total Records</p>
            <ShieldCheckIcon className="w-12 h-12 opacity-90" />
          </div>
          <p className="text-4xl font-bold mt-3">
            {loading ? "—" : stats.totalRecords}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer">
          <div className="flex justify-between items-center">
            <p className="opacity-90">Providers</p>
            <BuildingLibraryIcon className="w-12 h-12 opacity-90" />
          </div>
          <p className="text-4xl font-bold mt-3">
            {loading ? "—" : stats.totalProviders}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer">
          <div className="flex justify-between items-center">
            <p className="opacity-90">Patients Covered</p>
            <UsersIcon className="w-12 h-12 opacity-90" />
          </div>
          <p className="text-4xl font-bold mt-3">
            {loading ? "—" : stats.totalPatients}
          </p>
        </div>

        <div
          onClick={() => navigate("/claims")}
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer"
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
          <table className="min-w-[950px] w-full text-sm">
            <thead className="bg-gray-100 uppercase text-xs text-gray-600">
              <tr>
                <th className="p-3 text-left w-12">#</th>
                <th className="p-3 text-left">Provider</th>
                <th className="p-3 text-left">Plan</th>
                <th className="p-3 text-left">Policy #</th>
                <th className="p-3 text-left">Group #</th>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Created</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    Loading…
                  </td>
                </tr>
              ) : latestRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-400">
                    No records
                  </td>
                </tr>
              ) : (
                latestRecords.map((ins, idx) => (
                  <tr
                    key={ins._id}
                    onClick={() => setFullView(ins)}
                    className="border-b hover:bg-blue-50 cursor-pointer transition"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setFullView(ins);
                    }}
                  >
                    {/* INDEX */}
                    <td className="p-3">{idx + 1}</td>

                    {/* PROVIDER */}
                    <td className="p-3">{ins.insuranceProvider}</td>

                    {/* PLAN NAME */}
                    <td className="p-3">{ins.planName || "—"}</td>

                    {/* POLICY NUMBER */}
                    <td className="p-3">{ins.policyNumber || "—"}</td>

                    {/* GROUP NUMBER */}
                    <td className="p-3">{ins.groupNumber || "—"}</td>

                    {/* PATIENT */}
                    <td className="p-3">{getPatientName(ins.patientId)}</td>

                    {/* CREATED DATE */}
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

      {/* FULL DATA VIEW MODAL */}
      {fullView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[900px] rounded-lg shadow-lg max-h-[95vh] overflow-auto">
            <InsuranceDetailsFull data={fullView} />

            <div className="p-4 border-t text-right">
            

              <button
                className="px-4 py-2 bg-gray-600 text-white rounded"
                onClick={() => setFullView(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceDashboard;
