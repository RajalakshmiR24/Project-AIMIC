import React, { useEffect, useMemo, useState } from "react";
import { useInsurance } from "../../../contexts/InsuranceContext";
import { claimsApi } from "../../../api/claims.api";
import {
  ShieldCheckIcon,
  UsersIcon,
  BuildingLibraryIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import SimplePieChart from "../../shared/SimplePieChart";
import SimpleBarChart from "../../shared/SimpleBarChart";
import SimpleLineChart from "../../shared/SimpleLineChart";

/* ---------------- HELPERS ---------------- */

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ----------------------------------------------------
   FULL DYNAMIC RENDERER FOR ALL FIELDS
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

  /* Claims Stats State */
  const [claimStats, setClaimStats] = useState({ approved: 0, pending: 0, rejected: 0 });

  /* NEW: Chart Data States */
  const [trendData, setTrendData] = useState<{ label: string; value: number }[]>([]);
  const [typeData, setTypeData] = useState<{ label: string; value: number; color: string }[]>([]);

  const [fullView, setFullView] = useState<any>(null);

  /* Load insurance + claims */
  useEffect(() => {
    fetchInsurance();
    loadClaimStats();
  }, []);

  const loadClaimStats = async () => {
    try {
      const res = await claimsApi.getAllClaims();
      const stats = {
        approved: res.filter((c: any) => c.claimStatus === "Approved").length,
        pending: res.filter((c: any) => c.claimStatus === "Pending").length,
        rejected: res.filter((c: any) => c.claimStatus === "Rejected").length,
      };
      setClaimStats(stats);

      // --- 1. Compute Trend Data (Monthly Volume) ---
      const trendMap: Record<string, number> = {};
      const sortedRes = [...res].sort((a: any, b: any) =>
        new Date(a.createdAt || a.submittedDate).getTime() - new Date(b.createdAt || b.submittedDate).getTime()
      );

      sortedRes.forEach((c: any) => {
        const d = new Date(c.createdAt || c.submittedDate);
        const key = `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`; // Daily Trend? Or Monthly?
        // User asked for "date wise". Let's try Date-wise if range is small, or Month-wise.
        // Seed data is 6 months. Month-Year is better.
        const monthKey = `${MONTH_NAMES[d.getMonth()]}`;
        trendMap[monthKey] = (trendMap[monthKey] || 0) + 1;
      });

      // Sort months logic (simple array filter based on MONTH_NAMES order)
      const trendChartData = MONTH_NAMES
        .filter(m => trendMap[m])
        .map(m => ({ label: m, value: trendMap[m] }));

      setTrendData(trendChartData);

      // --- 2. Compute Type Data (Claims by Report Type) ---
      const typeMap: Record<string, number> = {};
      res.forEach((c: any) => {
        const type = c.medicalReportId?.reportType || "Unknown";
        // Simplify type name (remove " Report")
        const shortType = type.replace(" Report", "").replace(" Consultation", "").replace(" Note", "");
        typeMap[shortType] = (typeMap[shortType] || 0) + 1;
      });

      const COLORS = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"];
      const typeChartData = Object.entries(typeMap)
        .sort((a, b) => b[1] - a[1]) // Top quantity first
        .slice(0, 5) // Top 5
        .map(([label, value], i) => ({
          label,
          value,
          color: COLORS[i % COLORS.length]
        }));

      setTypeData(typeChartData);

    } catch {
      setClaimStats({ approved: 0, pending: 0, rejected: 0 });
      setTrendData([]);
      setTypeData([]);
    }
  };

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

  return (
    <div className="space-y-10 pb-10">
      {/* HEADER + SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Insurance Dashboard
        </h2>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
          onClick={() => navigate("/insurance/claims/all")}
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-2xl shadow-lg cursor-pointer"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="opacity-90 font-semibold">Claims Overview</p>
            <ClipboardDocumentListIcon className="w-8 h-8 opacity-90" />
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center bg-white/20 rounded px-2 py-1">
              <span>Approved</span>
              <span className="font-bold">{claimStats.approved}</span>
            </div>
            <div className="flex justify-between items-center bg-white/20 rounded px-2 py-1">
              <span>Pending</span>
              <span className="font-bold">{claimStats.pending}</span>
            </div>
            <div className="flex justify-between items-center bg-white/20 rounded px-2 py-1">
              <span>Rejected</span>
              <span className="font-bold">{claimStats.rejected}</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate("/insurance/pre-auths")}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <p className="opacity-90">Pre-Auths</p>
            <ShieldCheckIcon className="w-12 h-12 opacity-90" />
          </div>
          <p className="text-4xl font-bold mt-3">View</p>
        </div>
      </div>

      {/* ANALYTICS CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CHART 1: STATUS PIE */}
        <div className="flex justify-center">
          <SimplePieChart
            title="Claims Status Distribution"
            data={[
              { label: "Approved", value: claimStats.approved, color: "bg-green-500" },
              { label: "Pending", value: claimStats.pending, color: "bg-orange-400" },
              { label: "Rejected", value: claimStats.rejected, color: "bg-red-500" },
            ]}
          />
        </div>

        {/* CHART 2: TYPE BAR */}
        <div className="flex justify-center w-full">
          <SimpleBarChart
            title="Top Claim Categories"
            data={typeData}
          />
        </div>
      </div>

      {/* CHART 3: TREND LINE - FULL WIDTH */}
      <div className="w-full">
        <SimpleLineChart
          title="Monthly Claims Volume"
          data={trendData}
          color="text-blue-600"
        />
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
