import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import { Eye, RefreshCcw, Search } from "lucide-react";

import { useHospital } from "../../../contexts/HospitalContext";
import { useClaims } from "../../../contexts/ClaimsContext";
import { Claim } from "../../../api/claims.api";

const statusBadge = (status?: string) => {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-700";
    case "Rejected":
      return "bg-red-100 text-red-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getPatientName = (p: any) => {
  if (!p) return "Unknown";
  if (typeof p === "object") return `${p.firstName || ""} ${p.lastName || ""}`.trim();
  return "Unknown";
};

const formatDate = (d?: string | Date | null) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "-";
  }
};

const AllClaimsPage: React.FC = () => {
  const { patients, fetchPatients } = useHospital();
  const { claims, loading: claimsLoading, fetchClaims, fetchClaimById } = useClaims();

  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState<Claim[]>([]);
  const [query, setQuery] = useState("");

  const openViewClaimModal = async (id: string) => {
    const claim = await fetchClaimById(id);
    if (!claim) return;

    const patient =
      typeof claim.patientId === "object"
        ? claim.patientId
        : patients.find((p) => p._id === claim.patientId);

    const html = `
      <div style="text-align:left;line-height:1.5">
        <strong>Claim Number:</strong> ${claim.claimNumber || "-"}<br/>
        <strong>Patient:</strong> ${getPatientName(patient)}<br/>
        <strong>Status:</strong> ${claim.claimStatus || "-"}<br/>
        <strong>Billed Amount:</strong> ${claim.billedAmount ?? "-"}<br/>
        <strong>Approved Amount:</strong> ${claim.approvedAmount ?? "-"}<br/>
        <strong>Submitted Date:</strong> ${formatDate(claim.submittedDate)}<br/>
        ${claim.denialReason
        ? `<strong>Denial Reason:</strong> ${claim.denialReason}<br/>`
        : ""
      }
        ${claim.notes && claim.claimNumber
        ? `<div style="margin-top:8px"><strong>Notes:</strong><div style="margin-top:4px">${claim.notes}</div></div>`
        : ""
      }
      </div>
    `;

    Swal.fire({
      title: "Claim Details",
      width: 760,
      html,
      confirmButtonText: "Close",
      showCloseButton: true,
    });
  };

  const handleSearch = (source: Claim[] = claims) => {
    const q = query.trim().toLowerCase();
    if (!q) return setFiltered(source);

    setFiltered(
      source.filter((c) => {
        const patient =
          typeof c.patientId === "object"
            ? c.patientId
            : patients.find((p) => p._id === c.patientId);

        const patientName = getPatientName(patient).toLowerCase();

        return (
          String(c.claimNumber || "").toLowerCase().includes(q) ||
          String(c.claimStatus || "").toLowerCase().includes(q) ||
          String(c.notes || "").toLowerCase().includes(q) ||
          patientName.includes(q)
        );
      })
    );
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchPatients(), fetchClaims()]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    setFiltered(claims);
  }, [claims, patients]);

  useEffect(() => {
    handleSearch();
  }, [query]);

  const isLoading = loading || claimsLoading;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h1 className="text-2xl font-semibold">All Claims</h1>

        <button
          onClick={async () => {
            setLoading(true);
            await fetchClaims();
            setLoading(false);
            handleSearch();
          }}
          className="px-3 py-2 bg-gray-200 rounded-lg flex items-center gap-2"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      <div className="flex gap-2 items-center bg-white p-3 border rounded-xl">
        <Search size={18} className="text-gray-500" />
        <input
          className="w-full outline-none text-sm"
          placeholder="Search by patient, claim #, status, notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="w-full overflow-x-auto rounded-xl border bg-white shadow-sm">
        {isLoading ? (
          <p className="p-5 text-center">Loading...</p>
        ) : (
          <table className="min-w-max w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Claim #</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Billed</th>
                <th className="p-3 text-left">Submitted</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClaims.map((c) => {
                const patient =
                  typeof c.patientId === "object"
                    ? c.patientId
                    : patients.find((p) => p._id === c.patientId);

                return (
                  <tr key={c._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{getPatientName(patient)}</div>
                      <div className="text-xs text-gray-500">{patient?.email}</div>
                    </td>
                    <td className="p-3">{c.claimNumber}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(
                          c.claimStatus
                        )}`}
                      >
                        {c.claimStatus}
                      </span>
                    </td>
                    <td className="p-3">{c.billedAmount ?? "-"}</td>
                    <td className="p-3">{formatDate(c.submittedDate)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openViewClaimModal(c._id as string)}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No claims found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {filtered.length > 5 && (
          <div className="p-4 border-t flex justify-between items-center bg-gray-50 rounded-b-xl">
            <span className="text-sm text-gray-500">
              Showing {Math.min((currentPage - 1) * 5 + 1, filtered.length)} to {Math.min(currentPage * 5, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
              >
                Previous
              </button>
              {Array.from({ length: Math.ceil(filtered.length / 5) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded text-sm ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === Math.ceil(filtered.length / 5)}
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filtered.length / 5), p + 1))}
                className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllClaimsPage;
