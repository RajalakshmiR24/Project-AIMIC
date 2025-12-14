import React, { useEffect, useState } from "react";
import { insuranceApi } from "../../../api/insurance.api";
import { Claim } from "../../../api/claims.api";
import ClaimReview from "./ClaimReview";
import ClaimsTabs from "./ClaimsTabs";

const ApprovedClaims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Claim | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await insuranceApi.getApprovedClaims();
      setClaims(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <ClaimsTabs />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Approved Claims</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-1 rounded bg-sky-600 text-white text-sm hover:bg-sky-700"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Claim #</th>
              <th className="text-left p-3">Patient</th>
              <th className="text-left p-3">Billed</th>
              <th className="text-left p-3">Approved</th>
              <th className="text-left p-3">Submitted</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {claims.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No approved claims found.
                </td>
              </tr>
            )}

            {claims.map((c) => {
              const patient: any = c.patientId;

              return (
                <tr key={c._id} className="even:bg-gray-50">
                  {/* CLAIM NUMBER */}
                  <td className="p-3">{c.claimNumber || c._id}</td>

                  {/* PATIENT NAME — updated to firstName + lastName */}
                  <td className="p-3">
                    {patient
                      ? `${patient.firstName} ${patient.lastName}`
                      : "Unknown Patient"}
                  </td>

                  {/* BILLED */}
                  <td className="p-3">₹{c.billedAmount ?? 0}</td>

                  {/* APPROVED */}
                  <td className="p-3">₹{c.approvedAmount ?? 0}</td>

                  {/* SUBMITTED DATE */}
                  <td className="p-3">
                    {c.submittedDate
                      ? new Date(c.submittedDate).toLocaleDateString()
                      : "—"}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-3">
                    <button
                      onClick={() => {
                        setSelected(c);
                        setOpen(true);
                      }}
                      className="px-3 py-1 rounded border text-sm hover:bg-gray-100"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {open && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setOpen(false);
              setSelected(null);
            }}
          />

          {/* MODAL CONTENT */}
          <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Claim Review</h3>

              <button
                onClick={() => {
                  setOpen(false);
                  setSelected(null);
                }}
                className="px-3 py-1 rounded text-sm"
              >
                Close
              </button>
            </div>

            <div className="p-4">
              <ClaimReview
                claimId={selected._id as string}
                onClose={() => {
                  setOpen(false);
                  setSelected(null);
                  load();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedClaims;
