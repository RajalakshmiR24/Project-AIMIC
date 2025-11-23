// src/pages/AllReportsPage.tsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useDoctor } from "../../../contexts/DoctorContext";
import { Eye, FilePlus, RefreshCcw, Search } from "lucide-react";

const AllReportsPage: React.FC = () => {
  const {
    patients,
    reports,
    fetchReports,
    fetchPatients,
    createReport,
    getReport,
    updateReport,
  } = useDoctor();

  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  const formatDate = (d?: string | Date | null) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return String(d);
    }
  };

  /* ---------------------------------------------------------
     VIEW MODAL
  --------------------------------------------------------- */
  const openViewReportModal = async (id: string) => {
    const report = await getReport(id);
    if (!report) return;

    const patient =
      typeof report.patientId === "object"
        ? report.patientId
        : patients.find((p) => p._id === report.patientId);

    Swal.fire({
      title: `<strong>Report Details</strong>`,
      width: 900,
      html: `
        <div style="text-align:left;font-size:14px;line-height:1.5;">
          <h3 style="font-weight:600;margin:10px 0 6px;">Patient Information</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <p><b>Name:</b> ${patient?.fullName || "-"}</p>
            <p><b>Email:</b> ${patient?.email || "-"}</p>
            <p><b>Phone:</b> ${patient?.phone || "-"}</p>
            <p><b>Insurance:</b> ${patient?.insuranceId || "-"}</p>
            <p><b>Condition:</b> ${patient?.primaryCondition || "-"}</p>
            <p><b>Status:</b> ${patient?.status || "-"}</p>
            <p><b>Last Visit:</b> ${formatDate(patient?.lastVisit)}</p>
            <p><b>Next Appointment:</b> ${formatDate(patient?.nextAppointment)}</p>
          </div>

          <hr style="margin:12px 0" />

          <h3 style="font-weight:600;margin:10px 0 6px;">Report Details</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <p><b>Type:</b> ${report.reportType}</p>
            <p><b>Primary Dx:</b> ${report.primaryDiagnosis}</p>
            <p><b>Secondary Dx:</b> ${(report.secondaryDiagnosis || []).join(", ")}</p>
            <p><b>Treatment:</b> ${report.treatmentProvided || "-"}</p>
            <p><b>Medications:</b> ${report.medicationsPrescribed || "-"}</p>
            <p><b>Lab Results:</b> ${report.labResults || "-"}</p>
            <p><b>Recommendations:</b> ${report.recommendations || "-"}</p>
            <p><b>Follow Up:</b> ${formatDate(report.followUpDate)}</p>
            <p><b>Service From:</b> ${formatDate(report.serviceDateFrom)}</p>
            <p><b>To:</b> ${formatDate(report.serviceDateTo)}</p>
          </div>

          <hr style="margin:12px 0" />

          <h3 style="font-weight:600;margin:10px 0 6px;">Procedures</h3>
          ${
            report.procedureCodes?.length
              ? `
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:6px;">CPT</th>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:6px;">Modifier</th>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:6px;">Dx Pointers</th>
                    <th style="text-align:right;border-bottom:1px solid #ddd;padding:6px;">Charges</th>
                    <th style="text-align:right;border-bottom:1px solid #ddd;padding:6px;">Units</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.procedureCodes
                    .map(
                      (pc: any) => `
                        <tr>
                          <td style="padding:6px;">${pc.cpt}</td>
                          <td style="padding:6px;">${pc.modifier || "-"}</td>
                          <td style="padding:6px;">${(pc.diagnosisPointers || []).join(", ")}</td>
                          <td style="padding:6px;text-align:right;">${pc.charges}</td>
                          <td style="padding:6px;text-align:right;">${pc.units}</td>
                        </tr>`
                    )
                    .join("")}
                </tbody>
              </table>`
              : `<p style="color:gray">No procedures added</p>`
          }
        </div>
      `,
      confirmButtonText: "Close",
      showCloseButton: true,
    });
  };

  /* ---------------------------------------------------------
     ADD/EDIT MODAL
  --------------------------------------------------------- */
const openReportFormModal = (existing?: any) => {
  const patientOptions = patients
    .map(
      (p: any) =>
        `<option value="${p._id}">${p.fullName} — ${p.email}</option>`
    )
    .join("");

  Swal.fire({
    title: existing ? "Edit Medical Report" : "Add Medical Report",
    width: 900,
    html: `
      <style>
        .grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 10px;
        }
        .full { grid-column: span 2; }
        .label {
          font-weight: 600;
          margin-bottom: 4px;
          display: block;
        }
        .input, .textarea, .select {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 14px;
        }
        .textarea {
          resize: vertical;
        }
      </style>

      <div style="text-align:left;font-size:14px;max-height:70vh;overflow-y:auto;padding-right:10px;">

        <div class="grid-2col">
          
          <div>
            <label class="label">Select Patient *</label>
            <select id="r1" class="select">
              <option value="">— Choose a patient —</option>
              ${patientOptions}
            </select>
          </div>

          <div>
            <label class="label">Report Type *</label>
            <select id="r2" class="select">
              <option value="">Select report type</option>
              <option value="Consultation Report">Consultation Report</option>
              <option value="Laboratory Results">Laboratory Results</option>
              <option value="X-Ray Report">X-Ray Report</option>
              <option value="Surgery Report">Surgery Report</option>
              <option value="Discharge Summary">Discharge Summary</option>
              <option value="Emergency Report">Emergency Report</option>
            </select>
          </div>

          <div>
            <label class="label">Primary Diagnosis *</label>
            <textarea id="r3" rows="3" class="textarea" placeholder="Enter primary diagnosis"></textarea>
          </div>

          <div>
            <label class="label">Secondary Diagnosis</label>
            <textarea id="r4" rows="3" class="textarea" placeholder="Comma separated"></textarea>
          </div>

          <div class="full">
            <label class="label">Treatment Provided *</label>
            <textarea id="r5" rows="4" class="textarea" placeholder="Describe treatment"></textarea>
          </div>

          <div>
            <label class="label">Medications Prescribed</label>
            <textarea id="r6" rows="3" class="textarea" placeholder="List medications"></textarea>
          </div>

          <div>
            <label class="label">Lab Results</label>
            <textarea id="r7" rows="3" class="textarea" placeholder="Enter lab results"></textarea>
          </div>

          <div>
            <label class="label">Recommendations</label>
            <textarea id="r8" rows="3" class="textarea" placeholder="Recommendations"></textarea>
          </div>

          <div>
            <label class="label">Follow-up Date</label>
            <input id="r9" type="date" class="input">
          </div>

          <div>
            <label class="label">Service Date From</label>
            <input id="r10" type="date" class="input">
          </div>

          <div>
            <label class="label">Service Date To</label>
            <input id="r11" type="date" class="input">
          </div>

          <div>
            <label class="label">Referring Provider Name</label>
            <input id="r12" class="input" placeholder="Enter provider name">
          </div>

          <div>
            <label class="label">Referring Provider NPI</label>
            <input id="r13" class="input" placeholder="NPI number">
          </div>

        </div>

      </div>
    `,
    didOpen: () => {
      if (existing) {
        (document.getElementById("r1") as any).value =
          existing.patientId?._id || existing.patientId;

        (document.getElementById("r2") as any).value = existing.reportType || "";
        (document.getElementById("r3") as any).value = existing.primaryDiagnosis || "";
        (document.getElementById("r4") as any).value = (existing.secondaryDiagnosis || []).join(", ");
        (document.getElementById("r5") as any).value = existing.treatmentProvided || "";
        (document.getElementById("r6") as any).value = existing.medicationsPrescribed || "";
        (document.getElementById("r7") as any).value = existing.labResults || "";
        (document.getElementById("r8") as any).value = existing.recommendations || "";

        (document.getElementById("r9") as any).value =
          existing.followUpDate ? existing.followUpDate.split("T")[0] : "";

        (document.getElementById("r10") as any).value =
          existing.serviceDateFrom ? existing.serviceDateFrom.split("T")[0] : "";

        (document.getElementById("r11") as any).value =
          existing.serviceDateTo ? existing.serviceDateTo.split("T")[0] : "";

        (document.getElementById("r12") as any).value = existing.referringProviderName || "";
        (document.getElementById("r13") as any).value = existing.referringProviderNPI || "";
      }
    },
    showCancelButton: true,
    confirmButtonText: existing ? "Update" : "Create",
    preConfirm: () => {
      const patientId = (document.getElementById("r1") as any).value;
      const reportType = (document.getElementById("r2") as any).value;
      const primaryDiagnosis = (document.getElementById("r3") as any).value;

      if (!patientId) return Swal.showValidationMessage("Patient is required");
      if (!reportType) return Swal.showValidationMessage("Report Type is required");
      if (!primaryDiagnosis) return Swal.showValidationMessage("Primary Diagnosis is required");

      return {
        patientId,
        reportType,
        primaryDiagnosis,
        secondaryDiagnosis: (document.getElementById("r4") as any).value
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean),
        treatmentProvided: (document.getElementById("r5") as any).value,
        medicationsPrescribed: (document.getElementById("r6") as any).value,
        labResults: (document.getElementById("r7") as any).value,
        recommendations: (document.getElementById("r8") as any).value,
        followUpDate: (document.getElementById("r9") as any).value || null,
        serviceDateFrom: (document.getElementById("r10") as any).value || null,
        serviceDateTo: (document.getElementById("r11") as any).value || null,
        referringProviderName: (document.getElementById("r12") as any).value,
        referringProviderNPI: (document.getElementById("r13") as any).value,
        status: "Submitted",
      };
    },
  }).then(async (res) => {
    if (!res.isConfirmed) return;

    if (existing) {
      await updateReport(existing._id, res.value);
      await fetchReports();
      Swal.fire("Updated", "Report updated successfully", "success");
    } else {
      await createReport(res.value);
      await fetchReports();
      Swal.fire("Created", "Report created successfully", "success");
    }
  });
};



  /* ---------------------------------------------------------
     SEARCH FUNCTION
  --------------------------------------------------------- */
  const handleSearch = () => {
    const q = query.toLowerCase();

    const f = reports.filter((r: any) => {
      const patient =
        typeof r.patientId === "object"
          ? r.patientId
          : patients.find((p) => p._id === r.patientId);

      return (
        r.reportType?.toLowerCase().includes(q) ||
        r.primaryDiagnosis?.toLowerCase().includes(q) ||
        patient?.fullName?.toLowerCase().includes(q) ||
        patient?.email?.toLowerCase().includes(q)
      );
    });

    setFiltered(f);
  };

  /* ---------------------------------------------------------
     INITIAL LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      await fetchPatients();
      await fetchReports();
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    setFiltered(reports);
  }, [reports]);

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h1 className="text-2xl font-semibold">All Medical Reports</h1>

        <div className="flex gap-2">
          <button
            onClick={async () => {
              setLoading(true);
              await fetchReports();
              setLoading(false);
              handleSearch();
            }}
            className="px-3 py-2 bg-gray-200 rounded-lg flex items-center gap-2"
          >
            <RefreshCcw size={16} /> Refresh
          </button>

          <button
            onClick={() => openReportFormModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <FilePlus size={18} /> Add Report
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex gap-2 items-center bg-white p-3 border rounded-xl">
        <Search size={18} className="text-gray-500" />
        <input
          className="w-full outline-none text-sm"
          placeholder="Search by patient, diagnosis, report type…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg"
        >
          Search
        </button>
      </div>

      {/* TABLE */}
<div className="w-full overflow-x-auto rounded-xl border bg-white shadow-sm">
        {loading ? (
          <p className="p-5 text-center">Loading...</p>
        ) : (
  <table className="min-w-max w-full text-sm">
            <thead className="bg-gray-100 hidden md:table-header-group">
              <tr>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Report Type</th>
                <th className="p-3 text-left">Primary Dx</th>
                <th className="p-3 text-left">Medications</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r: any) => {
                const patient =
                  typeof r.patientId === "object"
                    ? r.patientId
                    : patients.find((p) => p._id === r.patientId);

                return (
                  <tr key={r._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">
                        {patient?.fullName || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {patient?.email}
                      </div>
                    </td>

                    <td className="p-3">{r.reportType}</td>
                    <td className="p-3">{r.primaryDiagnosis}</td>
                    <td className="p-3">{r.medicationsPrescribed || "-"}</td>
                    <td className="p-3">{r.status || "-"}</td>
                    <td className="p-3">{formatDate(r.createdAt)}</td>

                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => openViewReportModal(r._id)}
                        className="p-2 bg-gray-100 rounded-lg"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => openReportFormModal(r)}
                        className="p-2 bg-blue-100 rounded-lg"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllReportsPage;
