import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Eye, RefreshCcw, Search } from "lucide-react";

import { useHospital } from "../../../contexts/HospitalContext";
import { useClaims } from "../../../contexts/ClaimsContext";
import { Claim } from "../../../api/claims.api";

const AllClaimsPage: React.FC = () => {
  const { patients, fetchPatients } = useHospital();
  const { claims, loading: claimsLoading, fetchClaims, fetchClaimById } = useClaims();

  const [loading, setLoading] = useState<boolean>(true);
  const [filtered, setFiltered] = useState<Claim[]>([]);
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
    const claim = await fetchClaimById(id);
    if (!claim) return;

    const patient =
      typeof claim.patientId === "object"
        ? claim.patientId
        : patients.find((p) => p._id === claim.patientId);

    const html = `
      <div style="text-align:left;line-height:1.4">
        <strong>Claim Number:</strong> ${claim.claimNumber || "-"}<br/>
        <strong>Patient:</strong> ${patient?.fullName || "-"} <br/>
        <strong>Status:</strong> ${claim.claimStatus || "-"}<br/>
        <strong>Billed Amount:</strong> ${claim.billedAmount ?? "-"}<br/>
        <strong>Approved Amount:</strong> ${claim.approvedAmount ?? "-"}<br/>
        <strong>Submitted By:</strong> ${claim.submittedBy?.name || claim.submittedBy || "-"}<br/>
        <strong>Submitted Date:</strong> ${formatDate(claim.submittedDate)}<br/>
        <strong>Notes:</strong><div style="margin-top:6px">${claim.notes || "-"}</div>
        <div style="margin-top:8px">
          <strong>Attachments:</strong>
          <ul style="padding-left:18px;margin:6px 0">
            ${
              claim.attachments && claim.attachments.length
                ? claim.attachments
                    .map((a) => `<li>${a.fileName} (${a.fileType})</li>`)
                    .join("")
                : "<li>-</li>"
            }
          </ul>
        </div>
      </div>
    `;

    Swal.fire({
      title: `<strong>Claim Details</strong>`,
      width: 800,
      html,
      confirmButtonText: "Close",
      showCloseButton: true,
    });
  };

  const handleSearch = (sourceClaims: Claim[] = claims) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFiltered(sourceClaims);
      return;
    }

    const f = sourceClaims.filter((c) => {
      const patientName =
        typeof c.patientId === "object"
          ? c.patientId?.fullName
          : patients.find((p) => p._id === c.patientId)?.fullName;

      return (
        String(c.claimNumber || "").toLowerCase().includes(q) ||
        String(c.claimStatus || "").toLowerCase().includes(q) ||
        String(c.notes || "").toLowerCase().includes(q) ||
        String(patientName || "").toLowerCase().includes(q)
      );
    });

    setFiltered(f);
  };

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

      {/* SEARCH */}
      <div className="flex gap-2 items-center bg-white p-3 border rounded-xl">
        <Search size={18} className="text-gray-500" />
        <input
          className="w-full outline-none text-sm"
          placeholder="Search claims by patient, claim number, notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={() => handleSearch()} className="px-4 py-2 bg-gray-800 text-white rounded-lg">
          Search
        </button>
      </div>

      {/* TABLE */}
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
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c) => {
                const patient =
                  typeof c.patientId === "object"
                    ? c.patientId
                    : patients.find((p) => p._id === c.patientId);

                return (
                  <tr key={c._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{patient?.fullName || "Unknown"}</div>
                      <div className="text-xs text-gray-500">{patient?.email}</div>
                    </td>
                    <td className="p-3">{c.claimNumber || "-"}</td>
                    <td className="p-3">{c.claimStatus || "-"}</td>
                    <td className="p-3">{c.billedAmount != null ? c.billedAmount : "-"}</td>
                    <td className="p-3">{formatDate(c.createdAt)}</td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => openViewClaimModal(c._id as string)}
                        className="p-2 bg-gray-100 rounded-lg"
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
                    No claims found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllClaimsPage;
