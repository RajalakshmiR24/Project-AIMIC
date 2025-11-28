import React, { useEffect, useState } from "react";
import { employeeApi } from "../../../api/employee.api";
import { useClaims } from "../../../contexts/ClaimsContext";
import { Loader2, ClipboardList, DollarSign, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { ReadyForClaimItem } from "../../../api/types";

// ----------------------------------------------------
// INTERNAL CLAIM REVIEW MODAL (COPIED FROM ClaimReview)
// ----------------------------------------------------
const ClaimReviewModal: React.FC<{
  claim: any;
  insurance: any;
  report: any;
  onClose: () => void;
}> = ({ claim, insurance, report, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    "Patient" | "Insurance" | "Report" | "Attachments"
  >("Patient");

  const TABS = ["Patient", "Insurance", "Report", "Attachments"] as const;

  const patient = claim.patientId;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Claim Review</h2>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded border text-sm"
        >
          Close
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

      <div className="mt-4">
        {/* PATIENT */}
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
                <div>
                  <strong>Address:</strong> {patient.addressLine1}, {patient.city}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-100 rounded">
              <h3 className="font-medium">Claim Summary</h3>
              <div className="mt-2 text-sm space-y-1">
                <div><strong>Claim #:</strong> {claim.claimNumber}</div>
                <div><strong>Status:</strong> {claim.claimStatus}</div>
                <div><strong>Billed:</strong> ₹{claim.billedAmount}</div>
                <div><strong>Approved:</strong> ₹{claim.approvedAmount ?? "—"}</div>
                <div><strong>Submitted:</strong> {new Date(claim.submittedDate).toLocaleString()}</div>
                <div><strong>Notes:</strong> {claim.notes || "—"}</div>
              </div>
            </div>
          </div>
        )}

        {/* INSURANCE */}
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

        {/* REPORT */}
        {activeTab === "Report" && (
          <div className="p-4 bg-gray-100 rounded text-sm space-y-2">
            <div><strong>Type:</strong> {report.reportType}</div>
            <div><strong>Primary Diagnosis:</strong> {report.primaryDiagnosis}</div>
            <div><strong>Secondary:</strong> {report.secondaryDiagnosis?.join(", ")}</div>
            <div><strong>Treatment:</strong> {report.treatmentProvided}</div>
            <div><strong>Medications:</strong> {report.medicationsPrescribed}</div>
            <div><strong>Lab Results:</strong> {report.labResults}</div>
            <div><strong>Recommendations:</strong> {report.recommendations}</div>
            <div>
              <strong>Service Dates:</strong> {report.serviceDateFrom} → {report.serviceDateTo}
            </div>

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

        {/* ATTACHMENTS */}
        {activeTab === "Attachments" && (
          <div className="p-4 bg-gray-100 rounded space-y-2 text-sm">
            {claim.attachments?.length ? (
              claim.attachments.map((a: any, i: number) => (
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
    </div>
  );
};

// ----------------------------------------------------
// MAIN READY FOR CLAIM PAGE
// ----------------------------------------------------
const ReadyForClaimPatients: React.FC = () => {
  const [items, setItems] = useState<ReadyForClaimItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [modalData, setModalData] = useState<any | null>(null);

  const { createClaim } = useClaims();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await employeeApi.getPatientsReadyForClaim();
      setItems(list || []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

const handleCreateClaim = async (item: ReadyForClaimItem) => {
  try {
    Swal.fire({
      title: "Creating claim...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const billedAmount =
      item.latestReport?.procedureCodes?.reduce(
        (sum, p) => sum + (p.charges || 0),
        0
      ) || 0;

    const payload = {
      patientId: item.patient._id!,
      insuranceId: item.insurance!.insuranceId,
      medicalReportId: item.latestReport!._id,
      billedAmount,
      approvedAmount: 0,
      notes: "",
      attachments: [],
    };

    const created = await createClaim(payload);

    setItems((prev) =>
      prev.filter((i) => i.patient._id !== item.patient._id)
    );

    Swal.close();

    // OPEN MODAL WITH LOCAL DATA (NO API CALL)
    setModalData({
      claim: {
        ...created,
        patientId: item.patient,
        medicalReportId: item.latestReport,
        insuranceId: item.insurance,
        billedAmount,
        attachments: [],
      },
      insurance: item.insurance,
      report: item.latestReport,
    });
  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err?.message || "Unable to create claim",
    });
  }
};

const handleViewDetails = async (item: ReadyForClaimItem) => {
  setModalData({
    claim: {
      claimNumber: "N/A",
      claimStatus: "Draft",
      billedAmount:
        item.latestReport?.procedureCodes?.reduce(
          (sum, p) => sum + (p.charges || 0),
          0
        ) || 0,
      approvedAmount: 0,
      notes: "",
      submittedDate: new Date().toISOString(),
      attachments: [],
      patientId: item.patient,
      medicalReportId: item.latestReport,
      insuranceId: item.insurance,
    },
    insurance: item.insurance,
    report: item.latestReport,
  });
};


  const handleWorkflowChange = async (patientId: string, workflow: string) => {
    try {
      await employeeApi.updatePatientStatus(patientId, {
        patientWorkflowStatus: workflow,
      });

      setItems((prev) =>
        prev.map((i) =>
          i.patient._id === patientId
            ? {
                ...i,
                patient: { ...i.patient, patientWorkflowStatus: workflow },
              }
            : i
        )
      );

      Swal.fire({
        icon: "success",
        title: "Workflow updated",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Unable to update workflow",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">

      {/* MODAL */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[900px] max-h-[90vh] overflow-y-auto p-4">
            <ClaimReviewModal
              claim={modalData.claim}
              insurance={modalData.insurance}
              report={modalData.report}
              onClose={() => setModalData(null)}
            />
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          <ClipboardList className="w-5 h-5" />
          Patients Ready for Claim
        </h1>
        <p className="text-sm text-gray-500">
          Showing patients with <b>ReportSubmitted</b> or <b>ReadyForClaim</b>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No patients ready for claim.
          </div>
        ) : (
          <table className="min-w-max w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Patient</th>
                <th className="p-3 border">Insurance</th>
                <th className="p-3 border">Latest Report</th>
                <th className="p-3 border">Doctor</th>
                <th className="p-3 border">Workflow</th>
                <th className="p-3 border text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-3 border">
                    <div className="font-semibold text-base">{item.patient.fullName}</div>
                    <div className="text-gray-600">{item.patient.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Workflow: {item.patient.patientWorkflowStatus}
                    </div>
                  </td>

                  <td className="p-3 border">
                    <b>ID:</b> {item.patient.insuranceId}
                    <br />
                    <b>Provider:</b> {item.insurance?.insuranceProvider}
                  </td>

                  <td className="p-3 border max-w-[280px]">
                    {item.latestReport ? (
                      <div>
                        <b>{item.latestReport.reportType}</b>
                        <div>{item.latestReport.primaryDiagnosis}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No report</span>
                    )}
                  </td>

                  <td className="p-3 border">
                    {item.createdBy?.name}
                    <div className="text-xs text-gray-500">{item.createdBy?.email}</div>
                  </td>

                  <td className="p-3 border">
                    <select
                      className="border px-2 py-1 rounded"
                      value={item.patient.patientWorkflowStatus}
                      onChange={(e) =>
                        handleWorkflowChange(item.patient._id!, e.target.value)
                      }
                    >
                      <option value="Created">Created</option>
                      <option value="ReportSubmitted">ReportSubmitted</option>
                      <option value="ReadyForEmployee">ReadyForEmployee</option>
                      <option value="ReadyForClaim">ReadyForClaim</option>
                      <option value="ClaimSubmitted">ClaimSubmitted</option>
                      <option value="UnderInsuranceReview">UnderInsuranceReview</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>

                  <td className="p-3 border text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>

                    <button
                      onClick={() => handleCreateClaim(item)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                    >
                      <DollarSign className="w-4 h-4" /> Create Claim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>
    </div>
  );
};

export default ReadyForClaimPatients;
