// src/pages/PatientManagement.tsx
import React, { useEffect, useState } from "react";
import { useDoctor } from "../../../contexts/DoctorContext";
import {
  Search,
  Pencil,
  Trash2,
  Loader2,
  RefreshCcw,
  UserPlus,
  Eye,
} from "lucide-react";
import { MedicalReport } from "../../../api";

const PatientManagement: React.FC = () => {
  const {
    patients,
    loading,
    fetchPatients,
    fetchReportsByPatient,
    addPatient,
    updatePatient,
    deletePatient,
    searchPatients,
  } = useDoctor();

  const [query, setQuery] = useState("");
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
    phone: "",
    email: "",
    addressLine1: "",
    city: "",
    state: "",
    zipCode: "",
    status: "",
  });

  const reset = () => {
    setForm({
      fullName: "",
      sex: "",
      birthDate: "",
      phone: "",
      email: "",
      addressLine1: "",
      city: "",
      state: "",
      zipCode: "",
      status: "",
    });
    setEditing(null);
  };

  const handleSearch = async () => {
    if (!query.trim()) return setFiltered(patients);
    const results = await searchPatients(query);
    setFiltered(results);
  };

  const handleSubmit = async () => {
    if (editing) {
      await updatePatient(editing._id, form);
    } else {
      await addPatient(form as any);
    }
    reset();
    setOpenForm(false);
  };

  const openViewModal = async (patient: any) => {
    setSelectedPatient(patient);
    const data = await fetchReportsByPatient(patient._id);
    setPatientReports(data);
    setOpenView(true);
  };

  useEffect(() => {
    setFiltered(patients);
  }, [patients]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
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

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 border rounded-lg w-full bg-white">
          <Search size={18} className="text-gray-500" />
          <input
            placeholder="Search by name, email, or phone…"
            className="w-full outline-none text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg w-full sm:w-auto"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Table - Always Table, Scroll on Mobile */}
        <div className="w-full overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="min-w-max w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Full Name</th>
                <th className="p-3 text-left">Sex</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">DOB</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <Loader2 className="animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : (
                filtered.map((p: any) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 whitespace-nowrap">{p.fullName}</td>
                    <td className="p-3 whitespace-nowrap">{p.sex}</td>
                    <td className="p-3 whitespace-nowrap">{p.email}</td>
                    <td className="p-3 whitespace-nowrap">{p.phone}</td>
                    <td className="p-3 whitespace-nowrap">
                      {p.birthDate ? new Date(p.birthDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-3 whitespace-nowrap">{p.status}</td>

                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                          onClick={() => openViewModal(p)}
                        >
                          <Eye size={16} className="text-gray-700" />
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
                              phone: p.phone || "",
                              email: p.email || "",
                              addressLine1: p.addressLine1 || "",
                              city: p.city || "",
                              state: p.state || "",
                              zipCode: p.zipCode || "",
                              status: p.status || "",
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
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-xl border">
            <h2 className="text-xl font-bold">Patient Details</h2>

            <div className="space-y-2 text-sm mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p><strong>Name:</strong> {selectedPatient.fullName}</p>
                <p><strong>Sex:</strong> {selectedPatient.sex}</p>
                <p><strong>Email:</strong> {selectedPatient.email}</p>
                <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                <p><strong>DOB:</strong> {selectedPatient.birthDate?.split("T")[0]}</p>
                <p><strong>Status:</strong> {selectedPatient.status}</p>
                <p><strong>Address:</strong> {selectedPatient.addressLine1}</p>
                <p><strong>City:</strong> {selectedPatient.city}</p>
                <p><strong>State:</strong> {selectedPatient.state}</p>
                <p><strong>Zip:</strong> {selectedPatient.zipCode}</p>
              </div>
            </div>

            <hr className="my-4" />

            <h3 className="text-lg font-semibold">Reports</h3>

            {patientReports.length === 0 ? (
              <p className="text-gray-500 text-sm">No reports found.</p>
            ) : (
              <div className="space-y-4 mt-2">
                {patientReports.map((r: any) => (
                  <div key={r._id} className="border p-3 rounded-lg bg-gray-50 text-sm">
                    <p><strong>Report Type:</strong> {r.reportType}</p>
                    <p><strong>Primary Diagnosis:</strong> {r.primaryDiagnosis}</p>
                    <p><strong>Secondary:</strong> {r.secondaryDiagnosis?.join(", ")}</p>
                    <p><strong>Treatment:</strong> {r.treatmentProvided}</p>
                    <p><strong>Medications:</strong> {r.medicationsPrescribed}</p>
                    <p><strong>Lab Results:</strong> {r.labResults}</p>
                    <p><strong>Recommendations:</strong> {r.recommendations}</p>
                    <p><strong>Follow Up:</strong> {r.followUpDate?.split("T")[0]}</p>

                    <p className="mt-2 font-semibold">Procedures:</p>
                    <ul className="list-disc ml-5">
                      {r.procedureCodes.map((pc: any) => (
                        <li key={pc._id}>
                          CPT {pc.cpt}, Mod {pc.modifier}, Charges: {pc.charges}
                        </li>
                      ))}
                    </ul>
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

      {/* FORM MODAL */}
      {openForm && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-5 shadow-xl border">
            <h2 className="text-xl font-semibold">
              {editing ? "Edit Patient" : "Add Patient"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
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

              <div className="col-span-2">
                <label className="text-gray-600">Address</label>
                <input
                  className="mt-1 w-full border px-3 py-2 rounded-lg"
                  value={form.addressLine1}
                  onChange={(e) =>
                    setForm({ ...form, addressLine1: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-gray-600">City</label>
                <input
                  className="mt-1 w-full border px-3 py-2 rounded-lg"
                  value={form.city}
                  onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-gray-600">State</label>
                <input
                  className="mt-1 w-full border px-3 py-2 rounded-lg"
                  value={form.state}
                  onChange={(e) =>
                    setForm({ ...form, state: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-gray-600">Zip Code</label>
                <input
                  className="mt-1 w-full border px-3 py-2 rounded-lg"
                  value={form.zipCode}
                  onChange={(e) =>
                    setForm({ ...form, zipCode: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-gray-600">Status</label>
                <input
                  className="mt-1 w-full border px-3 py-2 rounded-lg"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
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
