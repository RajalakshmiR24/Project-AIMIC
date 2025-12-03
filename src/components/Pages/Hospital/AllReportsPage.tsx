import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useHospital } from "../../../contexts/HospitalContext";
import { Eye, FilePlus, RefreshCcw } from "lucide-react";

const AllReportsPage: React.FC = () => {
  const {
    patients,
    reports,
    hospitalProviders,
    fetchReports,
    fetchPatients,
    fetchHospitalProviders,
    createReport,
    getReport,
    updateReport,
    uploadPdfToReport
  } = useHospital();

  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [providers, setProviders] = useState<any[]>([]);

  /* ---------------- PAGINATION ---------------- */
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const formatDate = (d?: string | Date | null) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  };
  
  const openReportFormModal = (existing?: any) => {
    const patientOptions = patients
      .map(
        (p: any) =>
          `<option value="${p._id}">${p.firstName || ""} ${p.lastName || ""} — ${p.email || "-"}</option>`
      )
      .join("");

    const providerOptions = providers
      .map(
        (p) =>
          `<option value="${p._id}" data-name="${p.name || ""}" data-npi="${p.providerCode || ""}">
             ${p.name || ""} — ${p.providerCode || ""}
           </option>`
      )
      .join("");

    Swal.fire({
      title: existing ? "Edit Medical Report" : "Add Medical Report",
      width: 950,
      html: `
      <style>
        .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 10px; }
        .full { grid-column: span 2; }
        .label { font-weight: 600; margin-bottom: 4px; display: block; }
        .input, .textarea, .select {
          width: 100%; padding: 10px; border-radius: 8px;
          border: 1px solid #d1d5db; font-size: 14px;
        }
        .textarea { resize: vertical; }
        .pc-row {
          display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr auto;
          gap: 10px; margin-bottom: 10px; align-items: center;
        }
        .pc-container {
          margin-top: 10px; padding: 10px;
          border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa;
        }
        .btn-sm { padding: 6px 10px; background:#2563eb; color:white;
          border-radius:6px; font-size:13px; cursor:pointer; }
        .btn-del { background:#ef4444!important; }
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
            <textarea id="r3" rows="3" class="textarea"></textarea>
          </div>

          <div>
            <label class="label">Secondary Diagnosis</label>
            <textarea id="r4" rows="3" class="textarea"></textarea>
          </div>

          <div class="full">
            <label class="label">Treatment Provided *</label>
            <textarea id="r5" rows="3" class="textarea"></textarea>
          </div>

          <div>
            <label class="label">Medications Prescribed</label>
            <textarea id="r6" rows="2" class="textarea"></textarea>
          </div>

          <div>
            <label class="label">Lab Results</label>
            <textarea id="r7" rows="2" class="textarea"></textarea>
          </div>

          <div>
            <label class="label">Recommendations</label>
            <textarea id="r8" rows="2" class="textarea"></textarea>
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
            <label class="label">Select Doctor *</label>
            <select id="prov" class="select">
              <option value="">— Select Doctor —</option>
              ${providerOptions}
            </select>
          </div>

          <div>
            <label class="label">Referring Provider Name</label>
            <input id="r12" class="input" readonly>
          </div>

          <div>
            <label class="label">Referring Provider Code</label>
            <input id="r13" class="input" readonly>
          </div>

          <div>
            <label class="label">Status</label>
            <select id="r14" class="select">
              <option value="Submitted">Submitted</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div>
            <label class="label">Created By (auto)</label>
            <input id="r15" class="input" disabled>
          </div>
        </div>

        <label class="label" style="margin-top:14px;">Procedure Codes</label>
        <div id="pcContainer" class="pc-container"></div>
        <button id="addPC" class="btn-sm" style="margin-top:8px;">+ Add CPT Row</button>
      </div>
    `,
      didOpen: () => {
        const provSelect = document.getElementById("prov") as HTMLSelectElement;
        const refName = document.getElementById("r12") as HTMLInputElement;
        const refCode = document.getElementById("r13") as HTMLInputElement;

        provSelect.addEventListener("change", () => {
          const opt = provSelect.selectedOptions[0];
          refName.value = opt?.dataset?.name || "";
          refCode.value = opt?.dataset?.npi || "";
        });

        const pcContainer = document.getElementById("pcContainer") as HTMLElement;
        const addPCBtn = document.getElementById("addPC") as HTMLButtonElement;
        const createdByInput = document.getElementById("r15") as HTMLInputElement;

        const addRow = (pc?: any) => {
          const div = document.createElement("div");
          div.className = "pc-row";
          div.innerHTML = `
            <input class="input pc-cpt" placeholder="CPT" value="${pc?.cpt || ""}">
            <input class="input pc-mod" placeholder="Modifier" value="${pc?.modifier || ""}">
            <input class="input pc-dx" placeholder="Dx pointers (comma)" value="${pc?.diagnosisPointers?.join(", ") || ""}">
            <input class="input pc-charges" type="number" placeholder="Charges" value="${pc?.charges || ""}">
            <input class="input pc-units" type="number" placeholder="Units" value="${pc?.units || ""}">
            <button class="btn-sm btn-del pc-del">X</button>
          `;
          pcContainer.appendChild(div);

          div.querySelector(".pc-del")?.addEventListener("click", () => div.remove());
        };

        addPCBtn.addEventListener("click", (e) => {
          e.preventDefault();
          addRow();
        });

        if (existing) {
          (document.getElementById("r1") as HTMLSelectElement).value =
            existing.patientId?._id || existing.patientId || "";

          (document.getElementById("r2") as HTMLSelectElement).value =
            existing.reportType || "";

          (document.getElementById("r3") as HTMLTextAreaElement).value =
            existing.primaryDiagnosis || "";

          (document.getElementById("r4") as HTMLTextAreaElement).value =
            (existing.secondaryDiagnosis || []).join(", ");

          (document.getElementById("r5") as HTMLTextAreaElement).value =
            existing.treatmentProvided || "";

          (document.getElementById("r6") as HTMLTextAreaElement).value =
            existing.medicationsPrescribed || "";

          (document.getElementById("r7") as HTMLTextAreaElement).value =
            existing.labResults || "";

          (document.getElementById("r8") as HTMLTextAreaElement).value =
            existing.recommendations || "";

          (document.getElementById("r9") as HTMLInputElement).value =
            existing.followUpDate?.split("T")[0] || "";

          (document.getElementById("r10") as HTMLInputElement).value =
            existing.serviceDateFrom?.split("T")[0] || "";

          (document.getElementById("r11") as HTMLInputElement).value =
            existing.serviceDateTo?.split("T")[0] || "";

          (document.getElementById("r12") as HTMLInputElement).value =
            existing.referringProviderName || "";

          (document.getElementById("r13") as HTMLInputElement).value =
            existing.referringProviderNPI || "";

          const matchProv = providers.find(
            (p) =>
              p.providerCode === existing.referringProviderNPI ||
              p._id === existing.providerId
          );
          if (matchProv) {
            (document.getElementById("prov") as HTMLSelectElement).value =
              matchProv._id;
            (document.getElementById("r12") as HTMLInputElement).value =
              matchProv.name || existing.referringProviderName || "";
            (document.getElementById("r13") as HTMLInputElement).value =
              matchProv.providerCode || existing.referringProviderNPI || "";
          }

          (document.getElementById("r14") as HTMLSelectElement).value =
            existing.status || "Submitted";

          if (existing.createdBy && typeof existing.createdBy === "object") {
            createdByInput.value = `${existing.createdBy.name} (${existing.createdBy.email})`;
            (createdByInput as any).dataset.userid = existing.createdBy._id;
          }

          existing.procedureCodes?.forEach((pc: any) => addRow(pc));
        }
      },
      showCancelButton: true,
      confirmButtonText: existing ? "Update" : "Create",
      preConfirm: () => {
        const patientId = (document.getElementById("r1") as HTMLSelectElement).value;

        const reportType = (document.getElementById("r2") as HTMLSelectElement).value;
        const primaryDiagnosis = (document.getElementById("r3") as HTMLTextAreaElement).value;

        const secondaryDiagnosis = (document.getElementById("r4") as HTMLTextAreaElement).value
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);

        const treatmentProvided = (document.getElementById("r5") as HTMLTextAreaElement).value;
        const medicationsPrescribed = (document.getElementById("r6") as HTMLTextAreaElement).value;
        const labResults = (document.getElementById("r7") as HTMLTextAreaElement).value;
        const recommendations = (document.getElementById("r8") as HTMLTextAreaElement).value;

        const followUpDate = (document.getElementById("r9") as HTMLInputElement).value || null;
        const serviceDateFrom = (document.getElementById("r10") as HTMLInputElement).value || null;
        const serviceDateTo = (document.getElementById("r11") as HTMLInputElement).value || null;

        const referringProviderName = (document.getElementById("r12") as HTMLInputElement).value;
        const referringProviderNPI = (document.getElementById("r13") as HTMLInputElement).value;

        const providerId = (document.getElementById("prov") as HTMLSelectElement).value;

        const status = (document.getElementById("r14") as HTMLSelectElement).value;

        const createdByInput = document.getElementById("r15") as HTMLInputElement;
        const createdBy = (createdByInput as any).dataset?.userid || undefined;

        const procedureCodes = Array.from(
          document.querySelectorAll(".pc-row")
        ).map((row: any) => ({
          cpt: (row.querySelector(".pc-cpt") as HTMLInputElement).value,
          modifier: (row.querySelector(".pc-mod") as HTMLInputElement).value,
          diagnosisPointers: (row.querySelector(".pc-dx") as HTMLInputElement).value
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
          charges:
            Number((row.querySelector(".pc-charges") as HTMLInputElement).value) || 0,
          units:
            Number((row.querySelector(".pc-units") as HTMLInputElement).value) || 0,
        }));

        return {
          patientId,
          reportType,
          primaryDiagnosis,
          secondaryDiagnosis,
          treatmentProvided,
          medicationsPrescribed,
          labResults,
          recommendations,
          followUpDate,
          serviceDateFrom,
          serviceDateTo,
          referringProviderName,
          referringProviderNPI,
          providerId,
          status,
          createdBy,
          procedureCodes,
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
     UPLOAD PDF HANDLER
  --------------------------------------------------------- */
  const handleUploadPdf = async (reportId: string) => {
    const { value: file } = await Swal.fire({
      title: "Upload PDF Document",
      input: "file",
      inputAttributes: { accept: "application/pdf" },
      confirmButtonText: "Upload",
      showCancelButton: true,
    });

    if (!file) return;

    try {
      await uploadPdfToReport(reportId, file);
      Swal.fire("Uploaded", "PDF uploaded successfully", "success");
    } catch {
      Swal.fire("Error", "Upload failed", "error");
    }
  };

  /* ---------------------------------------------------------
     VIEW REPORT MODAL
  --------------------------------------------------------- */
  const openViewReportModal = async (id: string) => {
    const report = await getReport(id);
    if (!report) return;

    const patient =
      typeof report.patientId === "object"
        ? report.patientId
        : patients.find((p) => p._id === report.patientId);

    const procHtml = report.procedureCodes?.length
      ? `<table style="width:100%;border-collapse:collapse;font-size:13px;">
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
                  <td style="padding:6px;">${pc.cpt || "-"}</td>
                  <td style="padding:6px;">${pc.modifier || "-"}</td>
                  <td style="padding:6px;">${(pc.diagnosisPointers || []).join(", ") || "-"}</td>
                  <td style="padding:6px;text-align:right;">${pc.charges ?? "-"}</td>
                  <td style="padding:6px;text-align:right;">${pc.units ?? "-"}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>`
      : `<p style="color:gray">No procedures added</p>`;

    Swal.fire({
      title: `<strong>Report Details</strong>`,
      width: 950,
      html: `
      <div style="text-align:left;font-size:14px;line-height:1.5;">

        <h3 style="font-weight:600;margin:10px 0 6px;">Patient Information</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <p><b>Name:</b> ${patient?.fullName || `${patient?.firstName || ""} ${patient?.lastName || ""}`}</p>
          <p><b>Email:</b> ${patient?.email || "-"}</p>
          <p><b>Phone:</b> ${patient?.phone || "-"}</p>
          <p><b>Patient ID:</b> ${patient?._id || "-"}</p>
        </div>

        <hr style="margin:12px 0" />

        <h3 style="font-weight:600;margin:10px 0 6px;">Report Details</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <p><b>Type:</b> ${report.reportType || "-"}</p>
          <p><b>Primary Dx:</b> ${report.primaryDiagnosis || "-"}</p>
          <p><b>Secondary Dx:</b> ${(report.secondaryDiagnosis || []).join(", ")}</p>
          <p><b>Treatment:</b> ${report.treatmentProvided || "-"}</p>
          <p><b>Medications:</b> ${report.medicationsPrescribed || "-"}</p>
          <p><b>Lab Results:</b> ${report.labResults || "-"}</p>
          <p><b>Recommendations:</b> ${report.recommendations || "-"}</p>
          <p><b>Follow Up:</b> ${formatDate(report.followUpDate)}</p>
          <p><b>Service From:</b> ${formatDate(report.serviceDateFrom)}</p>
          <p><b>Service To:</b> ${formatDate(report.serviceDateTo)}</p>
          <p><b>Status:</b> ${report.status || "-"}</p>
          <p><b>Created At:</b> ${formatDate(report.createdAt)}</p>
          <p><b>Updated At:</b> ${formatDate(report.updatedAt)}</p>
          <p><b>Referring Provider:</b> ${report.referringProviderName || "-"}</p>
          <p><b>Provider Code:</b> ${report.referringProviderNPI || "-"}</p>
        </div>

        <hr style="margin:12px 0" />
        <h3 style="font-weight:600;margin:10px 0 6px;">Procedures</h3>
        ${procHtml}
      </div>
    `,
      confirmButtonText: "Close",
      showCloseButton: true,
    });
  };

  /* ---------------------------------------------------------
     SEARCH
  --------------------------------------------------------- */
  const handleSearch = () => {
    const q = query.toLowerCase();

    const f = reports.filter((r: any) => {
      const patient =
        typeof r.patientId === "object"
          ? r.patientId
          : patients.find((p) => p._id === r.patientId);

      return (
        (r.reportType || "").toLowerCase().includes(q) ||
        (r.primaryDiagnosis || "").toLowerCase().includes(q) ||
        (r.treatmentProvided || "").toLowerCase().includes(q) ||
        (patient?.fullName ||
          `${patient?.firstName || ""} ${patient?.lastName || ""}` ||
          ""
        )
          .toLowerCase()
          .includes(q) ||
        (patient?.email || "").toLowerCase().includes(q) ||
        (r.referringProviderName || "").toLowerCase().includes(q)
      );
    });

    setFiltered(f);
    setPage(1);
  };

  /* ---------------------------------------------------------
     INITIAL LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      await fetchPatients();
      await fetchReports();
      await fetchHospitalProviders();

      if (Array.isArray(hospitalProviders) && hospitalProviders.length > 0) {
        const hp = hospitalProviders[0];
        if (hp && Array.isArray(hp.hospitalProviderData)) {
          setProviders(hp.hospitalProviderData || []);
        }
      }

      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => setFiltered(reports), [reports]);
  useEffect(() => handleSearch(), [query]);

  return (
    <div className="w-full space-y-6">
<div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white p-3 border rounded-xl">
  <div className="flex items-center gap-3">
    <h1 className="text-2xl font-semibold whitespace-nowrap">All Medical Reports</h1>
  </div>

  <div className="flex items-center gap-2">
    <input
      className="w-52 sm:w-72 md:w-96 outline-none text-sm border p-2 rounded-lg"
      placeholder="Search by patient, diagnosis, report type…"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
    <button onClick={handleSearch} className="px-4 py-2 bg-gray-800 text-white rounded-lg">
      Search
    </button>
  </div>

  <div className="flex items-center gap-2">
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


      <div className="w-full overflow-x-auto rounded-xl border bg-white shadow-sm">
        {loading ? (
          <p className="p-5 text-center">Loading...</p>
        ) : (
          <>
            <table className="min-w-max w-full text-sm">
              <thead className="bg-gray-100 hidden md:table-header-group">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Patient</th>
                  <th className="p-3 text-left">Report Type</th>
                  <th className="p-3 text-left">Provider</th>
                  <th className="p-3 text-left">Service Dates</th>
                  <th className="p-3 text-left">Procedures</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Created</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((r: any, index: number) => {
                  const patient =
                    typeof r.patientId === "object"
                      ? r.patientId
                      : patients.find((p) => p._id === r.patientId);

                  const procSummary = (r.procedureCodes || [])
                    .map((p: any) => `${p.cpt} (${p.units}u / ${p.charges})`)
                    .join(" • ");

                  return (
                    <tr key={r._id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-semibold">
                        {(page - 1) * PAGE_SIZE + index + 1}
                      </td>

                      <td className="p-3">
                        <div className="font-medium">
                          {patient?.fullName ||
                            `${patient?.firstName || ""} ${
                              patient?.lastName || ""
                            }`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {patient?.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          Phone: {patient?.phone}
                        </div>
                      </td>

                      <td className="p-3">{r.reportType}</td>

                      <td className="p-3">
                        <div className="font-medium">
                          {r.referringProviderName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.referringProviderNPI}
                        </div>
                      </td>

                      <td className="p-3 text-xs">
                        <div>{formatDate(r.serviceDateFrom)}</div>
                        <div>to {formatDate(r.serviceDateTo)}</div>
                        <div>
                          Follow-up: {formatDate(r.followUpDate)}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="text-xs">
                          {procSummary || "—"}
                        </div>
                      </td>

                      <td className="p-3">{r.status}</td>
                      <td className="p-3">{formatDate(r.createdAt)}</td>

                      <td className="p-3 text-right space-x-2 flex justify-end">
                        <button
                          onClick={() => openViewReportModal(r._id)}
                          className="p-2 bg-gray-100 rounded-lg"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => openReportFormModal(r)}
                          className="p-2 bg-blue-100 rounded-lg"
                          title="Edit"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => handleUploadPdf(r._id)}
                          className="p-2 bg-green-100 rounded-lg"
                          title="Upload PDF"
                        >
                          📄
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* PAGINATION FOOTER */}
            <div className="flex justify-between items-center p-4 text-sm">
              <div>
                Page {page} of {totalPages}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-2 rounded-lg ${
                    page === 1
                      ? "bg-gray-200 text-gray-400"
                      : "bg-gray-800 text-white"
                  }`}
                >
                  Prev
                </button>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-2 rounded-lg ${
                    page === totalPages
                      ? "bg-gray-200 text-gray-400"
                      : "bg-gray-800 text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllReportsPage;
