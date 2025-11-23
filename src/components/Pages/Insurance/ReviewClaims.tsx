// src/components/Pages/Insurance/ReviewClaims.tsx
import React, { useEffect, useState } from "react";
import { claimsApi, Claim } from "../../../api/claims.api";
import { Link } from "react-router-dom";
import ClaimsTabs from "./ClaimsTabs";

const ReviewClaims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await claimsApi.getAllClaims();

      // Filter only claims that need review
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

  // Extract safe patient name
  const getPatientName = (patientId: any) => {
    if (!patientId) return "—";
    if (typeof patientId === "string") return patientId;
    if (typeof patientId === "object" && patientId.fullName) return patientId.fullName;
    return "—";
  };

  return (
    <div className="p-6">
<ClaimsTabs/>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Review Claims</h2>

        <button
          onClick={load}
          className="px-3 py-1 rounded bg-sky-600 text-white text-sm hover:bg-sky-700"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* TABLE */}
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

                <td className="p-3">{getPatientName(c.patientId)}</td>

                <td className="p-3">
                  <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                    {c.claimStatus}
                  </span>
                </td>

                <td className="p-3">₹{c.billedAmount}</td>

                <td className="p-3">
                  <Link
                    to={`/insurance/review/${c._id}`}
                    className="px-3 py-1 rounded border text-sm hover:bg-gray-100"
                  >
                    Review
                  </Link>
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
