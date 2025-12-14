// src/components/Pages/Insurance/ReviewClaims.tsx
import React, { useEffect, useState } from "react";
import { claimsApi, Claim } from "../../../api/claims.api";
import { useNavigate } from "react-router-dom";
import ClaimsTabs from "./ClaimsTabs";

const ReviewClaims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await claimsApi.getAllClaims();

      const filtered = data.filter(
        (c) => c.claimStatus !== "Approved" && c.claimStatus !== "Rejected"
      );

      setClaims(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getPatientName = (patient: any) => {
    if (!patient) return "—";
    if (typeof patient === "string") return patient;

    const first = patient.firstName || "";
    const last = patient.lastName || "";
    return `${first} ${last}`.trim() || "—";
  };

  const statusClass = (status?: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6">
      <ClaimsTabs />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Review Claims</h2>

        <button
          onClick={load}
          className="px-3 py-1 rounded bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Claim #</th>
              <th className="p-3 text-left">Patient</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Billed</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {claims.map((c) => (
              <tr key={c._id} className="even:bg-gray-50">
                <td className="p-3">{c.claimNumber || c._id}</td>

                <td className="p-3">
                  {getPatientName(c.patientId)}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${statusClass(
                      c.claimStatus
                    )}`}
                  >
                    {c.claimStatus}
                  </span>
                </td>

                <td className="p-3">
                  ₹{Number(c.billedAmount || 0).toLocaleString("en-IN")}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => navigate(`/insurance/claims/review/${c._id}`)}
                    className="px-3 py-1 rounded border text-sm hover:bg-gray-100"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}

            {claims.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No claims pending review.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewClaims;
