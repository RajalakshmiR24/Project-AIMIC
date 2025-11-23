import React, { useEffect, useState } from "react";
import { claimsApi, Claim } from "../../../api/claims.api";
import { insuranceApi } from "../../../api/insurance.api";
import ClaimsTabs from "./ClaimsTabs";

type ClaimReviewProps = {
  claimId: string;
  onClose?: () => void;
};

const TABS = ["Patient", "Insurance", "Report", "Attachments", ] as const;

const ClaimReview: React.FC<ClaimReviewProps> = ({ claimId, onClose }) => {
  const [claim, setClaim] = useState<Claim | null>(null);
  const [insurance, setInsurance] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Patient");

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

const load = async () => {
  setLoading(true);
  try {
    const c = await claimsApi.getClaimById(claimId);
    setClaim(c);

    // FIX: insuranceId is populated object → extract _id
    if (c.insuranceId) {
      const insuranceId =
        typeof c.insuranceId === "string"
          ? c.insuranceId
          : c.insuranceId._id;

      const ins = await insuranceApi.getInsuranceById(insuranceId);
      setInsurance(ins);
    }
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
      onClose?.();
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
      onClose?.();
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
      onClose?.();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !claim) return <div className="p-4">Loading...</div>;

  const patient = claim.patientId as any;
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

      {/* ---------------- TABS ---------------- */}
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

      {/* ---------------- TAB CONTENT ---------------- */}
      <div className="mt-4">
        {/* PATIENT TAB */}
        {activeTab === "Patient" && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 rounded">
              <h3 className="font-medium">Patient Info</h3>
              <div className="mt-2 text-sm space-y-1">
                <div><strong>Name:</strong> {patient.fullName}</div>
                <div><strong>Age:</strong> {patient.age}</div>
                <div><strong>Sex:</strong> {patient.sex}</div>
                <div><strong>Phone:</strong> {patient.phone}</div>
                <div><strong>Email:</strong> {patient.email}</div>
                <div><strong>Condition:</strong> {patient.primaryCondition}</div>
                <div><strong>Address:</strong> {patient.addressLine1}, {patient.city}</div>
              </div>
            </div>

            <div className="p-4 bg-gray-100 rounded">
              <h3 className="font-medium">Claim Summary</h3>
              <div className="mt-2 text-sm space-y-1">
                <div><strong>Claim #:</strong> {claim.claimNumber}</div>
                <div><strong>Status:</strong> {claim.claimStatus}</div>
                <div><strong>Billed:</strong> ₹{claim.billedAmount}</div>
                <div><strong>Approved:</strong> ₹{claim.approvedAmount ?? "—"}</div>
                <div><strong>Submitted:</strong> {new Date(claim.submittedDate!).toLocaleString()}</div>
                <div><strong>Notes:</strong> {claim.notes || "—"}</div>
              </div>
            </div>
          </div>
        )}

        {/* INSURANCE TAB */}
        {activeTab === "Insurance" && insurance && (
          <div className="p-4 bg-gray-100 rounded text-sm space-y-2">
            <div><strong>Provider:</strong> {insurance.insuranceProvider}</div>
            <div><strong>Plan:</strong> {insurance.planName}</div>
            <div><strong>Policy #:</strong> {insurance.policyNumber}</div>
            <div><strong>Group #:</strong> {insurance.groupNumber}</div>
            <div><strong>Prior Auth:</strong> {insurance.priorAuthorizationNumber}</div>

            <div className="mt-3 flex gap-4">
              {insurance.insuranceCardFrontBase64 && (
                <a
                  href={`data:application/pdf;base64,${insurance.insuranceCardFrontBase64}`}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View Card Front
                </a>
              )}
              {insurance.insuranceCardBackBase64 && (
                <a
                  href={`data:application/pdf;base64,${insurance.insuranceCardBackBase64}`}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View Card Back
                </a>
              )}
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === "Report" && (
          <div className="p-4 bg-gray-100 rounded text-sm space-y-2">
            <div><strong>Type:</strong> {report.reportType}</div>
            <div><strong>Primary Diagnosis:</strong> {report.primaryDiagnosis}</div>
            <div><strong>Secondary:</strong> {report.secondaryDiagnosis?.join(", ")}</div>
            <div><strong>Treatment:</strong> {report.treatmentProvided}</div>
            <div><strong>Medications:</strong> {report.medicationsPrescribed}</div>
            <div><strong>Lab Results:</strong> {report.labResults}</div>
            <div><strong>Recommendations:</strong> {report.recommendations}</div>
            <div><strong>Service Dates:</strong> {report.serviceDateFrom} → {report.serviceDateTo}</div>

            <div className="mt-3">
              <strong>Procedures:</strong>
              {report.procedureCodes?.map((pc: any, i: number) => (
                <div key={i} className="ml-3">
                  • CPT {pc.cpt} — ₹{pc.charges} ({pc.units} unit)
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ATTACHMENTS TAB */}
        {activeTab === "Attachments" && (
          <div className="p-4 bg-gray-100 rounded space-y-2 text-sm">
            {claim.attachments?.length ? (
              claim.attachments.map((a, i) => (
                <div key={i}>
                  <strong>{a.fileName}</strong>
                  <a
                    href={`data:${a.fileType};base64,${a.fileBase64}`}
                    target="_blank"
                    className="text-blue-600 underline ml-3"
                  >
                    View
                  </a>
                </div>
              ))
            ) : (
              <div>No attachments found.</div>
            )}
          </div>
        )}

      
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={approve}
          disabled={actionLoading}
          className="px-4 py-2 rounded bg-green-600 text-white"
        >
          Approve
        </button>

        <button
          onClick={reject}
          disabled={actionLoading}
          className="px-4 py-2 rounded bg-red-600 text-white"
        >
          Reject
        </button>

        <button
          onClick={requestInfo}
          disabled={actionLoading}
          className="px-4 py-2 rounded border"
        >
          Request More Info
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded border"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default ClaimReview;
