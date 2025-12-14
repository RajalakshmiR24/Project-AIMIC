// src/Pages/Insurance/AllClaimsList.tsx
import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { insuranceApi } from "../../../api/insurance.api";
import ClaimsTabs from "./ClaimsTabs";

const AllClaimsList: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllClaims = async () => {
    try {
      setLoading(true);
      const res = await insuranceApi.getAllClaims();
      setClaims(res || []);
    } catch (err) {
      console.error("Failed to load claims", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllClaims();
  }, []);

  return (
    <div className="p-6">
      <ClaimsTabs />

      <h2 className="text-lg font-semibold mb-4">All Claims</h2>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading claims...</div>
      ) : claims.length === 0 ? (
        <div className="text-gray-500 text-sm">No claims found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 border">Claim No</th>
                <th className="p-3 border">Patient</th>
                <th className="p-3 border">Policy</th>
                <th className="p-3 border">Bill Amount</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {claims.map((c) => (
                <tr key={c._id} className="border">
                  <td className="p-3 border">{c.claimNumber}</td>

                  <td className="p-3 border">
                    {c.patientId?.fullName}
                    <div className="text-xs text-gray-500">
                      {c.patientId?.email}
                    </div>
                  </td>

                  <td className="p-3 border">
                    {c.insuranceId?.planName}
                    <div className="text-xs text-gray-500">
                      {c.insuranceId?.policyNumber}
                    </div>
                  </td>

                  <td className="p-3 border">₹{c.billedAmount}</td>

                  <td
                    className={`p-3 border capitalize ${
                      c.claimStatus === "Approved"
                        ? "text-green-600 font-semibold"
                        : c.claimStatus === "Rejected"
                        ? "text-red-600 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {c.claimStatus}
                  </td>

                  <td className="p-3 border text-center">
                    <Link
                      to={`/insurance/claims/review/${c._id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllClaimsList;
