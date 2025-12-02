// src/components/Pages/Hospital/PatientManagement.tsx
import React, { useEffect, useState } from "react";
import { useHospital } from "../../../contexts/HospitalContext";
import {
  Trash2,
  Loader2,
  RefreshCcw,
  UserPlus,
  Eye,
  Plus,
} from "lucide-react";
import Swal from "sweetalert2";

type PatientForm = {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string; // yyyy-mm-dd
  phone: string;
  email: string;
  medicalRecordNumber: string;
  patientCode: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  insurance: string[]; // array of insurance IDs
};

const emptyForm = (): PatientForm => ({
  firstName: "",
  lastName: "",
  gender: "",
  dob: "",
  phone: "",
  email: "",
  medicalRecordNumber: "",
  patientCode: "",
  address: {
    line1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  },
  emergencyContact: {
    name: "",
    relation: "",
    phone: "",
  },
  insurance: [""],
});

const pageSize = 5;

const PatientManagement: React.FC = () => {
  const {
    patients,
    loading,
    fetchPatients,
    fetchReportsByPatient,
    addPatient,
    updatePatient,
    deletePatient,
  } = useHospital();

  const [filtered, setFiltered] = useState<any[]>(patients);
  const [openView, setOpenView] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientReports, setPatientReports] = useState<any[]>([]);
  const [form, setForm] = useState<PatientForm>(emptyForm());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setFiltered(patients);
  }, [patients]);

  useEffect(() => {
    // reset page when filter changes
    setCurrentPage(1);
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const openViewModal = async (patient: any) => {
    setSelectedPatient(patient);
    try {
      const reports = await fetchReportsByPatient?.(patient._id);
      setPatientReports(reports || []);
    } catch {
      setPatientReports([]);
    }
    setOpenView(true);
  };

  const onEdit = (p: any) => {
    setEditing(p);
    setForm({
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      gender: p.gender || "",
      dob: p.dob ? p.dob.split("T")[0] : "",
      phone: p.phone || "",
      email: p.email || "",
      medicalRecordNumber: p.medicalRecordNumber || "",
      patientCode: p.patientCode || "",
      address: {
        line1: p.address?.line1 || "",
        city: p.address?.city || "",
        state: p.address?.state || "",
        postalCode: p.address?.postalCode || "",
        country: p.address?.country || "",
      },
      emergencyContact: {
        name: p.emergencyContact?.name || "",
        relation: p.emergencyContact?.relation || "",
        phone: p.emergencyContact?.phone || "",
      },
      insurance: Array.isArray(p.insurance) && p.insurance.length > 0 ? p.insurance.slice() : [""],
    });
    setOpenForm(true);
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditing(null);
  };

  const handleAddInsurance = () => {
    setForm((s) => ({ ...s, insurance: [...s.insurance, ""] }));
  };

  const handleRemoveInsurance = (idx: number) => {
    setForm((s) => {
      const copy = s.insurance.slice();
      copy.splice(idx, 1);
      return { ...s, insurance: copy.length > 0 ? copy : [""] };
    });
  };

  const handleInsuranceChange = (idx: number, value: string) => {
    setForm((s) => {
      const copy = s.insurance.slice();
      copy[idx] = value;
      return { ...s, insurance: copy };
    });
  };

  const validateForm = (): { ok: boolean; msg?: string } => {
    if (!form.firstName.trim()) return { ok: false, msg: "First name required" };
    if (!form.lastName.trim()) return { ok: false, msg: "Last name required" };
    if (!form.phone.trim()) return { ok: false, msg: "Phone required" };
    if (!form.medicalRecordNumber.trim())
      return { ok: false, msg: "Medical record number required" };
    return { ok: true };
  };

  const handleSubmit = async () => {
    const v = validateForm();
    if (!v.ok) {
      Swal.fire({ icon: "warning", title: v.msg });
      return;
    }

    // Build payload matching your API structure (Option 1)
    const payload: any = {
      firstName: form.firstName,
      lastName: form.lastName,
      gender: form.gender,
      dob: form.dob ? new Date(form.dob).toISOString() : null,
      phone: form.phone,
      email: form.email,
      medicalRecordNumber: form.medicalRecordNumber,
      patientCode: form.patientCode,
      address: {
        line1: form.address.line1,
        city: form.address.city,
        state: form.address.state,
        postalCode: form.address.postalCode,
        country: form.address.country,
      },
      emergencyContact: {
        name: form.emergencyContact.name,
        relation: form.emergencyContact.relation,
        phone: form.emergencyContact.phone,
      },
      insurance: form.insurance.filter((i) => !!i && i.trim() !== ""),
    };

    try {
      if (editing) {
        await updatePatient(editing._id, payload);
        Swal.fire({ icon: "success", title: "Patient updated", timer: 1200, showConfirmButton: false });
      } else {
        await addPatient(payload);
        Swal.fire({ icon: "success", title: "Patient created", timer: 1200, showConfirmButton: false });
      }
      resetForm();
      setOpenForm(false);
      fetchPatients();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err?.message || "Something went wrong" });
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold">Patient Management</h1>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              fetchPatients();
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-100 rounded-lg flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>

          <button
            onClick={() => {
              resetForm();
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
                <th className="p-3">#</th>
                <th className="p-3">Name</th>
                <th className="p-3">Gender</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">DOB</th>
                <th className="p-3">MRN</th>
                <th className="p-3">Patient Code</th>
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
                paginated.map((p: any, index: number) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{(currentPage - 1) * pageSize + index + 1}</td>

                    <td className="p-3">{p.firstName} {p.lastName}</td>
                    <td className="p-3">{p.gender}</td>
                    <td className="p-3">{p.email}</td>
                    <td className="p-3">{p.phone}</td>

                    <td className="p-3">{p.dob ? new Date(p.dob).toLocaleDateString() : "-"}</td>

                    <td className="p-3">{p.medicalRecordNumber}</td>
                    <td className="p-3">{p.patientCode}</td>

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
                          onClick={() => onEdit(p)}
                        >
                          <Plus size={16} />
                        </button>

                        <button
                          className="p-2 bg-red-50 rounded-lg hover:bg-red-100"
                          onClick={() =>
                            Swal.fire({
                              title: "Delete patient?",
                              showCancelButton: true,
                              confirmButtonText: "Delete",
                              icon: "warning",
                            }).then((res) => {
                              if (res.isConfirmed) deletePatient(p._id);
                            })
                          }
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

          {/* Pagination */}
          <div className="flex justify-between items-center p-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              className={`px-3 py-1 rounded-lg border ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              Prev
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg border ${currentPage === page ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              className={`px-3 py-1 rounded-lg border ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {openView && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl border">
            <h2 className="text-xl font-bold">Patient Details</h2>

            <div className="space-y-4 text-sm mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <p><strong>First Name:</strong> {selectedPatient.firstName}</p>
                <p><strong>Last Name:</strong> {selectedPatient.lastName}</p>
                <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                <p><strong>Email:</strong> {selectedPatient.email}</p>
                <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                <p><strong>DOB:</strong> {selectedPatient.dob?.split("T")[0] || "-"}</p>
                <p><strong>Medical Record #:</strong> {selectedPatient.medicalRecordNumber}</p>
                <p><strong>Patient Code:</strong> {selectedPatient.patientCode}</p>

                <div className="sm:col-span-2">
                  <h3 className="font-semibold mt-2">Address</h3>
                  <p><strong>Line1:</strong> {selectedPatient.address?.line1 || "-"}</p>
                  <p><strong>City:</strong> {selectedPatient.address?.city || "-"}</p>
                  <p><strong>State:</strong> {selectedPatient.address?.state || "-"}</p>
                  <p><strong>Postal Code:</strong> {selectedPatient.address?.postalCode || "-"}</p>
                  <p><strong>Country:</strong> {selectedPatient.address?.country || "-"}</p>
                </div>

                <div className="sm:col-span-2">
                  <h3 className="font-semibold mt-2">Emergency Contact</h3>
                  <p><strong>Name:</strong> {selectedPatient.emergencyContact?.name || "-"}</p>
                  <p><strong>Relation:</strong> {selectedPatient.emergencyContact?.relation || "-"}</p>
                  <p><strong>Phone:</strong> {selectedPatient.emergencyContact?.phone || "-"}</p>
                </div>

                <div className="sm:col-span-2">
                  <h3 className="font-semibold mt-2">Insurance</h3>
                  <p>{(selectedPatient.insurance || []).length > 0 ? (selectedPatient.insurance || []).join(", ") : "-"}</p>
                </div>

                <div className="sm:col-span-2">
                  <h3 className="font-semibold mt-2">Metadata</h3>
                  <p><strong>Created By:</strong> {selectedPatient.createdBy || "-"}</p>
                  <p><strong>Created At:</strong> {selectedPatient.createdAt ? new Date(selectedPatient.createdAt).toLocaleString() : "-"}</p>
                  <p><strong>Updated At:</strong> {selectedPatient.updatedAt ? new Date(selectedPatient.updatedAt).toLocaleString() : "-"}</p>
                </div>
              </div>

              {patientReports.length > 0 && (
                <>
                  <hr className="my-2" />
                  <h3 className="font-semibold">Reports</h3>
                  <div className="space-y-2">
                    {patientReports.map((r: any) => (
                      <div key={r._id} className="p-3 border rounded bg-gray-50">
                        <p><strong>Type:</strong> {r.reportType}</p>
                        <p><strong>Primary Diagnosis:</strong> {r.primaryDiagnosis}</p>
                        <p><strong>Treatment:</strong> {r.treatmentProvided}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

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

      {/* Add / Edit Form Modal */}
      {openForm && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{editing ? "Edit Patient" : "Add Patient"}</h2>
              <div>
                <button
                  onClick={() => {
                    resetForm();
                    setOpenForm(false);
                  }}
                  className="px-3 py-1 rounded bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
              <div className="space-y-3">
                <div>
                  <label className="text-gray-600">First Name</label>
                  <input className="mt-1 w-full border px-3 py-2 rounded-lg" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>

                <div>
                  <label className="text-gray-600">Last Name</label>
                  <input className="mt-1 w-full border px-3 py-2 rounded-lg" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>

                <div>
                  <label className="text-gray-600">Gender</label>
                  <select className="mt-1 w-full border px-3 py-2 rounded-lg" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-600">DOB</label>
                  <input type="date" className="mt-1 w-full border px-3 py-2 rounded-lg" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                </div>

                <div>
                  <label className="text-gray-600">Phone</label>
                  <input className="mt-1 w-full border px-3 py-2 rounded-lg" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>

                <div>
                  <label className="text-gray-600">Email</label>
                  <input className="mt-1 w-full border px-3 py-2 rounded-lg" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-gray-600">Medical Record Number</label>
                  <input className="mt-1 w-full border px-3 py-2 rounded-lg" value={form.medicalRecordNumber} onChange={(e) => setForm({ ...form, medicalRecordNumber: e.target.value })} />
                </div>

                <div>
                  <label className="text-gray-600">Patient Code</label>
                  <input className="mt-1 w-full border px-3 py-2 rounded-lg" value={form.patientCode} onChange={(e) => setForm({ ...form, patientCode: e.target.value })} />
                </div>

                <div>
                  <label className="text-gray-600">Address Line 1</label>
                  <input className="mt-1 w-full border px-3 py-2 rounded-lg" value={form.address.line1} onChange={(e) => setForm({ ...form, address: { ...form.address, line1: e.target.value } })} />
                </div>

                <div>
                  <label className="text-gray-600">City</label>
                  <input className="mt-1 w-full border px-3 py-2 rounded-lg" value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
                </div>

                <div>
                  <label className="text-gray-600">State</label>
                  <input className="mt-1 w-full border px-3 py-2 rounded-lg" value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
                </div>

                <div>
                  <label className="text-gray-600">Postal Code</label>
                  <input className="mt-1 w-full border px-3 py-2 rounded-lg" value={form.address.postalCode} onChange={(e) => setForm({ ...form, address: { ...form.address, postalCode: e.target.value } })} />
                </div>

                <div>
                  <label className="text-gray-600">Country</label>
                  <input className="mt-1 w-full border px-3 py-2 rounded-lg" value={form.address.country} onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })} />
                </div>
              </div>
            </div>

            {/* Emergency contact */}
            <div className="mt-4">
              <h3 className="font-semibold">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <input className="border px-3 py-2 rounded-lg" placeholder="Name" value={form.emergencyContact.name} onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })} />
                <input className="border px-3 py-2 rounded-lg" placeholder="Relation" value={form.emergencyContact.relation} onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, relation: e.target.value } })} />
                <input className="border px-3 py-2 rounded-lg" placeholder="Phone" value={form.emergencyContact.phone} onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })} />
              </div>
            </div>

            {/* Insurance dynamic */}
            <div className="mt-4">
              <h3 className="font-semibold">Insurance (IDs)</h3>
              <div className="space-y-2 mt-2">
                {form.insurance.map((ins, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      className="flex-1 border px-3 py-2 rounded-lg"
                      value={ins}
                      placeholder="Insurance ID"
                      onChange={(e) => handleInsuranceChange(idx, e.target.value)}
                    />
                    <button
                      className="px-2 py-1 rounded bg-red-50"
                      onClick={() => handleRemoveInsurance(idx)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button type="button" onClick={handleAddInsurance} className="mt-2 px-3 py-1 rounded bg-blue-50 inline-flex items-center gap-2">
                  <Plus size={14} /> Add Insurance
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => {
                  resetForm();
                  setOpenForm(false);
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button onClick={handleSubmit} className="px-5 py-2 bg-blue-600 text-white rounded-lg">
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
