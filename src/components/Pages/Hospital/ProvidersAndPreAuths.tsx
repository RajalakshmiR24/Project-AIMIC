import React, { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { useHospital } from "../../../contexts/HospitalContext";

const ProvidersAndPreAuths: React.FC = () => {
  const {
    hospitalProviders,
    preAuthorizations,
    fetchHospitalProviders,
    fetchPreAuthorizations,
  } = useHospital();

  const [localLoading, setLocalLoading] = useState(false);
  const [providerQuery, setProviderQuery] = useState("");
  const [preAuthQuery, setPreAuthQuery] = useState("");

  /* ---------------------- PROVIDERS FLATTEN ---------------------- */
  const providersList = useMemo(() => {
    if (!hospitalProviders) return [];

    const first = hospitalProviders[0];
    if (first && Array.isArray(first.hospitalProviderData)) {
      return first.hospitalProviderData.flat();
    }
    return hospitalProviders;
  }, [hospitalProviders]);

  /* ---------------------- FILTER PROVIDERS ---------------------- */
  const filteredProviders = useMemo(() => {
    const q = providerQuery.toLowerCase();
    if (!q) return providersList;

    return providersList.filter((p: any) => {
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.providerCode || "").toLowerCase().includes(q) ||
        (p.specialization || "").toLowerCase().includes(q)
      );
    });
  }, [providerQuery, providersList]);

  /* ---------------------- FILTER PRE-AUTH ---------------------- */
  const filteredPreAuths = useMemo(() => {
    const q = preAuthQuery.toLowerCase();
    if (!q) return preAuthorizations || [];

    return (preAuthorizations || []).filter((pa: any) => {
      return (
        (pa.authorizationNumber || "").toLowerCase().includes(q) ||
        (pa.status || "").toLowerCase().includes(q) ||
        (pa.patientId?.firstName || "").toLowerCase().includes(q) ||
        (pa.patientId?.lastName || "").toLowerCase().includes(q)
      );
    });
  }, [preAuthQuery, preAuthorizations]);

  /* ---------------------- REFRESH DATA ---------------------- */
  const handleRefreshAll = async () => {
    try {
      setLocalLoading(true);
      await Promise.all([fetchHospitalProviders(), fetchPreAuthorizations()]);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalProviders();
    fetchPreAuthorizations();
  }, []);

  /* ---------------------- CLEAN PATIENT NAME ---------------------- */
  const getPatientName = (pa: any) => {
    const p = pa.patient || pa.patientId;
    return p ? `${p.firstName || ""} ${p.lastName || ""}`.trim() : "-";
  };

  /* ============================================================
      A) PROVIDER MODAL — LANDSCAPE TABLE OF ALL PRE-AUTHS
  ============================================================ */
  const showProviderModal = (provider: any) => {
    const preAuths = provider.preAuthorizations || [];

    const rows = preAuths
      .map(
        (pa: any) => `
      <tr>
        <td>${pa.authorizationNumber}</td>
        <td>${getPatientName(pa)}</td>
        <td>${pa.insuranceId?.policyNumber || "-"}</td>
        <td>
          ${pa.procedureCodes
            ?.map((c: any) => `${c.cpt} (₹${c.charges})`)
            .join("<br>")}
        </td>
        <td>${pa.diagnosisCodes?.join(", ") || "-"}</td>
        <td>₹${pa.requestedAmount}</td>
        <td>${pa.status}</td>
      </tr>
    `
      )
      .join("");

    const html = `
      <div style="text-align:left; font-size:15px;">
        <h2 style="margin:0 0 10px 0;">${provider.name}</h2>
        <div><strong>Provider Code:</strong> ${provider.providerCode}</div>
        <div><strong>Specialization:</strong> ${provider.specialization}</div>

        <hr style="margin:16px 0;">

        <h3>Pre-Authorizations</h3>

        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:14px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:8px; border:1px solid #ddd;">AUTH #</th>
                <th style="padding:8px; border:1px solid #ddd;">Patient</th>
                <th style="padding:8px; border:1px solid #ddd;">Policy</th>
                <th style="padding:8px; border:1px solid #ddd;">Procedures</th>
                <th style="padding:8px; border:1px solid #ddd;">Diagnosis</th>
                <th style="padding:8px; border:1px solid #ddd;">Amount</th>
                <th style="padding:8px; border:1px solid #ddd;">Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;

    Swal.fire({
      title: "",
      html,
      width: "90%", // LANDSCAPE
      showCloseButton: true,
      confirmButtonText: "Close",
    });
  };

  /* ============================================================
      B) PRE-AUTH MODAL — FULL DETAILED VIEW (LANDSCAPE)
  ============================================================ */
  const showPreAuthModal = (pa: any) => {
    const patient = pa.patientId || {};
    const insurance = pa.insuranceId || {};
    const procedures = pa.procedureCodes || [];

    const procedureRows = procedures
      .map(
        (p: any) => `
      <tr>
        <td>${p.cpt}</td>
        <td>${p.units}</td>
        <td>₹${p.charges}</td>
      </tr>
    `
      )
      .join("");

    const html = `
      <div style="text-align:left; font-size:15px;">
        <h2 style="margin-bottom:10px;">Authorization: ${pa.authorizationNumber}</h2>

        <hr style="margin:12px 0;">

        <h3>Patient Details</h3>
        <div><strong>Name:</strong> ${patient.firstName || ""} ${
      patient.lastName || ""
    }</div>
        <div><strong>Phone:</strong> ${patient.phone || "-"}</div>
        <div><strong>Email:</strong> ${patient.email || "-"}</div>

        <hr style="margin:12px 0;">

        <h3>Insurance</h3>
        <div><strong>Policy Number:</strong> ${insurance.policyNumber || "-"}</div>

        <hr style="margin:12px 0;">

        <h3>Procedures</h3>
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px; border:1px solid #ddd;">CPT</th>
              <th style="padding:8px; border:1px solid #ddd;">Units</th>
              <th style="padding:8px; border:1px solid #ddd;">Charges</th>
            </tr>
          </thead>
          <tbody>${procedureRows}</tbody>
        </table>

        <hr style="margin:12px 0;">

        <h3>Diagnosis</h3>
        <div>${pa.diagnosisCodes?.join(", ") || "-"}</div>

        <hr style="margin:12px 0;">

        <h3>Amounts & Status</h3>
        <div><strong>Requested:</strong> ₹${pa.requestedAmount}</div>
        <div><strong>Status:</strong> ${pa.status}</div>

        <hr style="margin:12px 0;">

        <h3>Provider</h3>
        <div><strong>Name:</strong> ${pa.providerName}</div>
        <div><strong>Specialization:</strong> ${pa.providerSpecialization}</div>

        <hr style="margin:12px 0;">

        <h3>Hospital</h3>
        <div>${pa.hospitalName}</div>

        <hr style="margin:12px 0;">

        <h3>Notes</h3>
        <div>${pa.notes || "-"}</div>
      </div>
    `;

    Swal.fire({
      title: "",
      html,
      width: "90%", // LANDSCAPE
      showCloseButton: true,
      confirmButtonText: "Close",
    });
  };

  /* ============================================================
      UI RENDER
  ============================================================ */
  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Providers & Pre-Authorizations</h2>

        <button
          onClick={handleRefreshAll}
          disabled={localLoading}
          className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
            localLoading
              ? "bg-gray-200 text-gray-500"
              : "bg-gray-800 text-white"
          }`}
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ---------------- PROVIDERS ---------------- */}
        <section className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between mb-3">
            <div>
              <h3 className="font-medium">Hospital Providers</h3>
              <div className="text-xs text-gray-500">
                {providersList.length} providers
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 p-2 border rounded-md text-sm"
              placeholder="Search providers..."
              value={providerQuery}
              onChange={(e) => setProviderQuery(e.target.value)}
            />
            <button
              onClick={() => setProviderQuery("")}
              className="px-3 py-2 bg-gray-100 rounded-md text-sm"
            >
              Clear
            </button>
          </div>

          <div className="max-h-[36vh] overflow-y-auto">
            <ul className="space-y-2">
              {filteredProviders.map((p: any) => (
                <li
                  key={p._id}
                  className="p-3 border rounded-md flex justify-between items-start"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      Code: {p.providerCode} • {p.specialization}
                    </div>
                  </div>

                  <button
                    onClick={() => showProviderModal(p)}
                    className="px-3 py-1 bg-gray-100 rounded-md"
                  >
                    <Eye size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------- PRE-AUTHORIZATIONS ---------------- */}
        <section className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between mb-3">
            <div>
              <h3 className="font-medium">Pre-Authorizations</h3>
              <div className="text-xs text-gray-500">
                {(preAuthorizations || []).length} items
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 p-2 border rounded-md text-sm"
              placeholder="Search by auth #, patient, status..."
              value={preAuthQuery}
              onChange={(e) => setPreAuthQuery(e.target.value)}
            />

            <button
              onClick={() => setPreAuthQuery("")}
              className="px-3 py-2 bg-gray-100 rounded-md text-sm"
            >
              Clear
            </button>
          </div>

          <div className="max-h-[36vh] overflow-y-auto">
            <ul className="space-y-2">
              {filteredPreAuths.map((pa: any) => (
                <li
                  key={pa._id}
                  className="p-3 border rounded-md flex justify-between items-start"
                >
                  <div>
                    <div className="font-medium">{pa.authorizationNumber}</div>
                    <div className="text-xs text-gray-500">
                      Patient: {getPatientName(pa)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Status: {pa.status}
                    </div>
                  </div>

                  <button
                    onClick={() => showPreAuthModal(pa)}
                    className="px-3 py-1 bg-gray-100 rounded-md"
                  >
                    <Eye size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ProvidersAndPreAuths;
