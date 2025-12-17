// src/Pages/Insurance/ClaimReview.tsx
import React, { useEffect, useState } from "react";
import { claimsApi, Claim } from "../../../api/claims.api";
import { insuranceApi } from "../../../api/insurance.api";
import { useNavigate } from "react-router-dom";
import ClaimsTabs from "./ClaimsTabs";

type ClaimReviewProps = {
  claimId?: string;
  onClose?: () => void;
};

const TABS = ["Patient", "Insurance", "Report"] as const;


const ClaimReview: React.FC<ClaimReviewProps> = ({ claimId, onClose }) => {
  const [claim, setClaim] = useState<Claim | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Patient");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [nextClaimId, setNextClaimId] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    if (!claimId) return;
    setLoading(true);
    try {
      // Load current claim
      const c = await claimsApi.getClaimById(claimId);
      setClaim(c);

      // Load next claim ID
      // OPTIMIZATION: In a real app, this should be a backend endpoint like /claims/:id/next
      const allClaims = await claimsApi.getAllClaims();
      const pendingClaims = allClaims.filter(
        (cl) => cl.claimStatus !== "Approved" && cl.claimStatus !== "Rejected"
      );

      const currentIndex = pendingClaims.findIndex((cl) => cl._id === claimId);

      if (currentIndex !== -1) {
        // If current claim is in the pending list, get the next one
        if (currentIndex < pendingClaims.length - 1) {
          setNextClaimId(pendingClaims[currentIndex + 1]._id || null);
        } else {
          setNextClaimId(null);
        }
      } else {
        // If current claim is NOT in pending list (e.g. just approved/rejected), 
        // the "next" claim is simply the first one in the queue.
        if (pendingClaims.length > 0) {
          setNextClaimId(pendingClaims[0]._id || null);
        } else {
          setNextClaimId(null);
        }
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [claimId]);

  const goToNext = () => {
    if (nextClaimId) {
      navigate(`/insurance/claims/review/${nextClaimId}`);
    }
  };

  // ... (approve, reject, requestInfo functions same as before) 
  const approve = async () => {
    if (!claim?._id) return;
    setActionLoading(true);
    try {
      await insuranceApi.approveClaim(claim._id);
      await load();
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    if (!claim?._id) return;
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;

    setActionLoading(true);
    try {
      await insuranceApi.rejectClaim(claim._id, reason);
      await load();
    } finally {
      setActionLoading(false);
    }
  };


  if (!claimId)
    return <div className="p-4 text-gray-500">Invalid claim</div>;

  if (loading || !claim)
    return <div className="p-4">Loading...</div>;

  const patient = claim.patientId as any;
  const insurance = claim.insuranceId as any;
  const report = claim.medicalReportId as any;

  return (
    <div className="p-6 space-y-6">
      <ClaimsTabs />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Claim Review</h2>
        <div className="flex gap-2">
          {nextClaimId && (
            <button
              onClick={goToNext}
              className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm flex items-center gap-1"
            >
              Next Claim →
            </button>
          )}
          <button
            onClick={load}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="border-b flex gap-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium ${activeTab === tab
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div><strong>Notes:</strong> {claim.notes}</div>

      {/* ================= PATIENT ================= */}
      {activeTab === "Patient" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Patient Info</h3>
            <div className="text-sm space-y-1">
              <div><strong>Name:</strong> {patient.firstName} {patient.lastName}</div>
              <div><strong>Gender:</strong> {patient.gender}</div>
              <div><strong>DOB:</strong> {new Date(patient.dob).toLocaleDateString()}</div>
              <div><strong>Phone:</strong> {patient.phone}</div>
              <div><strong>Email:</strong> {patient.email}</div>
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Claim Summary</h3>
            <div className="text-sm space-y-1">
              <div><strong>Claim #:</strong> {claim.claimNumber}</div>
              <div><strong>Status:</strong> {claim.claimStatus}</div>

              <div><strong>Billed Amount:</strong> ₹{claim.billedAmount}</div>
              <div><strong>Approved Amount:</strong> ₹{claim.approvedAmount ?? "—"}</div>
              <div><strong>Submitted On:</strong> {claim.submittedDate ? new Date(claim.submittedDate).toLocaleString() : "—"}</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= INSURANCE ================= */}
      {activeTab === "Insurance" && insurance && (
        <div className="p-4 bg-gray-100 rounded text-sm space-y-2">
          <div><strong>Provider:</strong> {insurance.insuranceProvider}</div>
          <div><strong>Policy Number:</strong> {insurance.policyNumber}</div>
          <div><strong>Plan:</strong> {insurance.planName}</div>
          <div><strong>Plan Type:</strong> {insurance.planType}</div>
          <div><strong>Status:</strong> {insurance.status}</div>
          <div><strong>Effective Date:</strong> {new Date(insurance.effectiveDate).toLocaleDateString()}</div>
          <div><strong>Expiry Date:</strong> {new Date(insurance.expirationDate).toLocaleDateString()}</div>

          <div className="pt-2">
            <strong>Coverage Limits:</strong>
            <ul className="list-disc ml-5 mt-1">
              {insurance.coverageLimits?.map((c: any) => (
                <li key={c._id}>
                  {c.type} – ₹{c.amount} {c.currency}
                </li>
              ))}
            </ul>
          </div>

          {/* DOCUMENTS */}
          {insurance.documents && insurance.documents.length > 0 && (
            <div className="pt-2 border-t mt-2">
              <strong>Documents:</strong>
              <div className="flex flex-col gap-1 mt-1">
                {insurance.documents.map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-gray-600">📄 {d.name}</span>
                    {d.data ? (
                      <a
                        href={d.data} // It's already a Data URL from FileReader
                        download={d.name}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Download
                      </a>
                    ) : d.url ? (
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">Open URL</a>
                    ) : <span className="text-gray-400 text-xs">(No file)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= REPORT ================= */}
      {activeTab === "Report" && report && (
        <div className="p-4 bg-gray-100 rounded text-sm space-y-3">
          <div><strong>Report Type:</strong> {report.reportType}</div>
          <div><strong>Primary Diagnosis:</strong> {report.primaryDiagnosis}</div>

          {report.secondaryDiagnosis?.length > 0 && (
            <div>
              <strong>Secondary Diagnosis:</strong>
              <ul className="list-disc ml-5 mt-1">
                {report.secondaryDiagnosis.map((d: string, i: number) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          <div><strong>Treatment Provided:</strong> {report.treatmentProvided}</div>
          <div><strong>Medications:</strong> {report.medicationsPrescribed}</div>
          <div><strong>Lab Results:</strong> {report.labResults}</div>
          <div><strong>Recommendations:</strong> {report.recommendations}</div>

          <div>
            <strong>Service Dates:</strong>{" "}
            {new Date(report.serviceDateFrom).toLocaleDateString()} →{" "}
            {new Date(report.serviceDateTo).toLocaleDateString()}
          </div>

          <div>
            <strong>Follow Up:</strong>{" "}
            {new Date(report.followUpDate).toLocaleDateString()}
          </div>

          <div>
            <strong>Referring Doctor:</strong>{" "}
            {report.referringProviderName} ({report.referringProviderNPI})
          </div>

          <div>
            <strong>Procedure Codes:</strong>
            <table className="w-full mt-2 text-xs border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">CPT</th>
                  <th className="p-2 border">Units</th>
                  <th className="p-2 border">Charges</th>
                </tr>
              </thead>
              <tbody>
                {report.procedureCodes?.map((p: any) => (
                  <tr key={p._id}>
                    <td className="p-2 border">{p.cpt}</td>
                    <td className="p-2 border">{p.units}</td>
                    <td className="p-2 border">₹{p.charges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ATTACHMENTS */}
          {report.pdfFiles && report.pdfFiles.length > 0 && (
            <div className="pt-2 border-t mt-2">
              <strong>Attachments (PDFs):</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {report.pdfFiles.map((f: any, i: number) => (
                  <a
                    key={i}
                    href={`data:application/pdf;base64,${f.data}`}
                    download={f.filename}
                    className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded border border-red-200 text-xs hover:bg-red-200"
                  >
                    📄 {f.filename} (Download)
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        {claim.claimStatus !== "Approved" && (
          <button
            disabled={actionLoading}
            onClick={approve}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve
          </button>
        )}

        {claim.claimStatus !== "Rejected" && (
          <button
            disabled={actionLoading}
            onClick={reject}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reject
          </button>
        )}

        {/* Only show Request Info if pending */}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto px-4 py-2 rounded border"
        >
          Close
        </button>
      )}
    </div>
  );
};

export default ClaimReview;
