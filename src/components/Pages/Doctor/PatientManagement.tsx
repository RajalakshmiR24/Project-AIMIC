import React, { useEffect, useState } from "react";
import { useDoctor } from "../../../contexts/DoctorContext";
import {
  Pencil,
  Trash2,
  Loader2,
  RefreshCcw,
  UserPlus,
  Eye,
} from "lucide-react";
import Swal from "sweetalert2";
import { MedicalReport } from "../../../api";
import { insuranceApi } from "../../../api/insurance.api";

const INSURANCE_PROVIDERS = [
  "Blue Shield",
  "Aetna",
  "Cigna",
  "Kaiser Permanente",
  "UnitedHealthcare",
  "Humana",
  "Medicare",
  "Medicaid",
];

const PatientManagement: React.FC = () => {
  const {
    patients,
    loading,
    fetchPatients,
    fetchReportsByPatient,
    addPatient,
    updatePatient,
    deletePatient,
    updatePatientStatus,
  } = useDoctor();

  const [filtered, setFiltered] = useState(patients);
  const [openForm, setOpenForm] = useState(false);
  const [openView, setOpenView] = useState(false);

  const [editing, setEditing] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientReports, setPatientReports] = useState<MedicalReport[]>([]);

  const [form, setForm] = useState({
    fullName: "",
    sex: "",
    birthDate: "",
    age: 0,
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    insuranceProvider: "",
    primaryCondition: "",
    status: "Active Treatment",
    lastVisit: "",
    nextAppointment: "",
    patientWorkflowStatus: "Created",
    visibleToEmployee: false,
    visibleToInsurance: false,
  });

  const reset = () => {
    setForm({
      fullName: "",
      sex: "",
      birthDate: "",
      age: 0,
      phone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      insuranceProvider: "",
      primaryCondition: "",
      status: "Active Treatment",
      lastVisit: "",
      nextAppointment: "",
      patientWorkflowStatus: "Created",
      visibleToEmployee: false,
      visibleToInsurance: false,
    });
    setEditing(null);
  };

  useEffect(() => {
    setFiltered(patients);
  }, [patients]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const dob = new Date(birthDate);
    const diff = Date.now() - dob.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  };

  const handleSubmit = async () => {
    if (!form.insuranceProvider) {
      Swal.fire({ icon: "warning", title: "Please select insurance provider." });
      return;
    }

    const payload: any = {
      ...form,
      age: calculateAge(form.birthDate),
      lastVisit: form.lastVisit || null,
      nextAppointment: form.nextAppointment || null,
    };

    try {
      let created;

      if (editing) {
        created = await updatePatient(editing._id, payload);
      } else {
        created = await addPatient(payload);

        await insuranceApi.addInsurance({
          patientId: [created._id!],
          insuranceProvider: form.insuranceProvider!,
        });


      }

      Swal.fire({
        icon: "success",
        title: editing ? "Updated successfully" : "Patient created",
        timer: 1500,
        showConfirmButton: false,
      });

      reset();
      setOpenForm(false);
      fetchPatients();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Something went wrong",
      });
    }
  };

  const openViewModal = async (patient: any) => {
    setSelectedPatient(patient);
    const data = await fetchReportsByPatient(patient._id);
    setPatientReports(data);
    setOpenView(true);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold">Patient Management</h1>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchPatients}
            className="px-3 py-2 bg-gray-100 rounded-lg flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>

          <button
            onClick={() => {
              reset();
              setOpenForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <UserPlus size={16} />
            Add Patient
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="w-full overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="min-w-max w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Full Name</th>
                <th className="p-3">Gender</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">DOB</th>
                <th className="p-3">Insurance ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Workflow</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center">
                    <Loader2 className="animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : (
                filtered.map((p: any) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{p.fullName}</td>
                    <td className="p-3">{p.sex}</td>
                    <td className="p-3">{p.email}</td>
                    <td className="p-3">{p.phone}</td>
                    <td className="p-3">
                      {p.birthDate
                        ? new Date(p.birthDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3">{p.insuranceId || "-"}</td>

                    <td className="p-3">
                      <select
                        className="border px-2 py-1 rounded"
                        value={p.status}
                        onChange={(e) =>
                          updatePatientStatus(p._id, { status: e.target.value })
                        }
                      >
                        <option value="Active Treatment">
                          Active Treatment
                        </option>
                        <option value="Follow-up Required">
                          Follow-up Required
                        </option>
                        <option value="Discharged">Discharged</option>
                      </select>
                    </td>

                    <td className="p-3">
                      <select
                        className="border px-2 py-1 rounded"
                        value={p.patientWorkflowStatus}
                        onChange={(e) =>
                          updatePatientStatus(p._id, {
                            patientWorkflowStatus: e.target.value,
                          })
                        }
                      >
                        <option value="Created">Created</option>
                        <option value="ReportSubmitted">
                          Report Submitted
                        </option>
                        <option value="ReadyForClaim">
                          Ready For Claim
                        </option>
                        <option value="ClaimSubmitted">Claim Submitted</option>
                        <option value="UnderInsuranceReview">
                          Under Review
                        </option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                          onClick={() => openViewModal(p)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100"
                          onClick={() => {
                            setEditing(p);
                            setForm({
                              fullName: p.fullName || "",
                              sex: p.sex || "",
                              birthDate: p.birthDate
                                ? p.birthDate.split("T")[0]
                                : "",
                              age: p.age || 0,
                              phone: p.phone || "",
                              email: p.email || "",
                              addressLine1: p.addressLine1 || "",
                              addressLine2: p.addressLine2 || "",
                              city: p.city || "",
                              state: p.state || "",
                              zipCode: p.zipCode || "",
                              insuranceProvider: "",
                              primaryCondition: p.primaryCondition || "",
                              status: p.status || "",
                              lastVisit: p.lastVisit
                                ? p.lastVisit.split("T")[0]
                                : "",
                              nextAppointment: p.nextAppointment
                                ? p.nextAppointment.split("T")[0]
                                : "",
                              patientWorkflowStatus:
                                p.patientWorkflowStatus || "Created",
                              visibleToEmployee:
                                p.visibleToEmployee || false,
                              visibleToInsurance:
                                p.visibleToInsurance || false,
                            });
                            setOpenForm(true);
                          }}
                        >
                          <Pencil size={16} className="text-blue-600" />
                        </button>

                        <button
                          className="p-2 bg-red-50 rounded-lg hover:bg-red-100"
                          onClick={() => deletePatient(p._id)}
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      {openView && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl border">
            <h2 className="text-xl font-bold">Patient Details</h2>

            <div className="space-y-2 text-sm mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p>
                  <strong>Name:</strong> {selectedPatient.fullName}
                </p>
                <p>
                  <strong>Sex:</strong> {selectedPatient.sex}
                </p>
                <p>
                  <strong>Email:</strong> {selectedPatient.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedPatient.phone}
                </p>
                <p>
                  <strong>DOB:</strong>{" "}
                  {selectedPatient.birthDate?.split("T")[0]}
                </p>
                <p>
                  <strong>Insurance ID:</strong>{" "}
                  {selectedPatient.insuranceId || "-"}
                </p>
                <p>
                  <strong>Status:</strong> {selectedPatient.status}
                </p>
                <p>
                  <strong>Workflow:</strong>{" "}
                  {selectedPatient.patientWorkflowStatus}
                </p>
              </div>
            </div>

            <hr className="my-4" />
            <h3 className="text-lg font-semibold">Reports</h3>

            {patientReports.length === 0 ? (
              <p className="text-gray-500 text-sm">No reports found.</p>
            ) : (
              <div className="space-y-4 mt-2">
                {patientReports.map((r: any) => (
                  <div
                    key={r._id}
                    className="border p-3 rounded-lg bg-gray-50 text-sm"
                  >
                    <p>
                      <strong>Report Type:</strong> {r.reportType}
                    </p>
                    <p>
                      <strong>Primary Diagnosis:</strong>{" "}
                      {r.primaryDiagnosis}
                    </p>
                    <p>
                      <strong>Secondary:</strong>{" "}
                      {r.secondaryDiagnosis?.join(", ")}
                    </p>
                    <p>
                      <strong>Treatment:</strong> {r.treatmentProvided}
                    </p>
                    <p>
                      <strong>Medications:</strong>{" "}
                      {r.medicationsPrescribed}
                    </p>
                    <p>
                      <strong>Lab Results:</strong> {r.labResults}
                    </p>
                    <p>
                      <strong>Recommendations:</strong> {r.recommendations}
                    </p>
                    <p>
                      <strong>Follow Up:</strong>{" "}
                      {r.followUpDate?.split("T")[0]}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setOpenView(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT FORM */}
      {openForm && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border p-6">
            <h2 className="text-2xl font-semibold mb-5">
              {editing ? "Edit Patient" : "Add Patient"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              {/* LEFT */}
              <div className="space-y-4">
                <div>
                  <label className="text-gray-600">Full Name</label>
                  <input
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-600">Sex</label>
                  <select
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.sex}
                    onChange={(e) =>
                      setForm({ ...form, sex: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="U">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-600">Birth Date</label>
                  <input
                    type="date"
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.birthDate}
                    onChange={(e) =>
                      setForm({ ...form, birthDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-600">Email</label>
                  <input
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-600">Phone</label>
                  <input
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-600">Insurance Provider *</label>
                  <select
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.insuranceProvider}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        insuranceProvider: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Provider</option>
                    {INSURANCE_PROVIDERS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-600">Primary Condition</label>
                  <input
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.primaryCondition}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        primaryCondition: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* RIGHT */}
              <div className="space-y-4">
                <div>
                  <label className="text-gray-600">Address Line 1</label>
                  <input
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.addressLine1}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        addressLine1: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-600">Address Line 2</label>
                  <input
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.addressLine2}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        addressLine2: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-600">City</label>
                  <input
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.city}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        city: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-600">State</label>
                  <input
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.state}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        state: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-600">Zip Code</label>
                  <input
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.zipCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        zipCode: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-600">Last Visit</label>
                  <input
                    type="date"
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.lastVisit}
                    onChange={(e) =>
                      setForm({ ...form, lastVisit: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-600">Next Appointment</label>
                  <input
                    type="date"
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.nextAppointment}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nextAppointment: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-gray-600">Status</label>
                  <select
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="Active Treatment">Active Treatment</option>
                    <option value="Follow-up Required">
                      Follow-up Required
                    </option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-600">Workflow Status</label>
                  <select
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.patientWorkflowStatus}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        patientWorkflowStatus: e.target.value,
                      })
                    }
                  >
                    <option value="Created">Created</option>
                    <option value="ReportSubmitted">Report Submitted</option>
                    <option value="ReadyForEmployee">
                      Ready For Employee
                    </option>
                    <option value="ClaimSubmitted">Claim Submitted</option>
                    <option value="UnderInsuranceReview">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-600">Visible to Employee</label>
                  <select
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.visibleToEmployee ? "true" : "false"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        visibleToEmployee: e.target.value === "true",
                      })
                    }
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-600">Visible to Insurance</label>
                  <select
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                    value={form.visibleToInsurance ? "true" : "false"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        visibleToInsurance: e.target.value === "true",
                      })
                    }
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => {
                  reset();
                  setOpenForm(false);
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg"
              >
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
