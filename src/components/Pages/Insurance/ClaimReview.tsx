// src/Pages/Insurance/ClaimReview.tsx
import React, { useEffect, useState } from "react";
import { claimsApi, Claim } from "../../../api/claims.api";
import { insuranceApi } from "../../../api/insurance.api";
import ClaimsTabs from "./ClaimsTabs";

type ClaimReviewProps = {
  claimId?: string;
  onClose?: () => void;
};

const TABS = ["Patient", "Insurance", "Report"] as const;

const ClaimReview: React.FC<ClaimReviewProps> = ({ claimId, onClose }) => {
  const [claim, setClaim] = useState<Claim | null>(null);
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]>("Patient");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    if (!claimId) return;
    setLoading(true);
    try {
      const c = await claimsApi.getClaimById(claimId);
      setClaim(c);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [claimId]);

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

  const requestInfo = async () => {
    if (!claim?._id) return;
    const message = window.prompt("Enter request message:");
    if (!message) return;

    setActionLoading(true);
    try {
      await insuranceApi.requestMoreInfo(claim._id, message);
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
        <button
          onClick={load}
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="border-b flex gap-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium ${
              activeTab === tab
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
              <div><strong>Submitted On:</strong> {new Date(claim.submittedDate).toLocaleString()}</div>
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
        </div>
      )}

      {!["Approved", "Rejected"].includes(claim.claimStatus) && (
        <div className="flex gap-3 pt-4">
          <button
            disabled={actionLoading}
            onClick={approve}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve
          </button>

          <button
            disabled={actionLoading}
            onClick={reject}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reject
          </button>

          <button
            disabled={actionLoading}
            onClick={requestInfo}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Request More Info
          </button>
        </div>
      )}

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
