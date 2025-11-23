import React, { useMemo, useState, useEffect } from "react";
import { useInsurance } from "../../../contexts/InsuranceContext";
import { Insurance, Patient } from "../../../api/types";

import Swal from "sweetalert2";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

/* -------- SAFE HELPERS -------- */
const getPatientName = (p: string | Patient) =>
  typeof p === "string" ? "Unknown" : p?.fullName ?? "Unknown";

const safeValue = (val: string | null | undefined) => val ?? "";

/* --------------------------------------- */

const InsuranceRecords: React.FC = () => {
  const {
    records,
    loading,
    fetchInsurance,
    deleteInsurance,
    updateInsurance,
    addInsurance: createInsurance,
  } = useInsurance();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Insurance | null>(null);
  const [adding, setAdding] = useState<Partial<Insurance> | null>(null);

  /* LOAD INITIAL */
  useEffect(() => {
    fetchInsurance();
  }, []);

  /* FILTER */
  const filtered = useMemo(() => {
    const s = search.toLowerCase();

    return records.filter((r) => {
      const provider = r.insuranceProvider?.toLowerCase() || "";
      const policy = r.policyNumber?.toLowerCase() || "";
      const patient = getPatientName(r.patientId)?.toLowerCase() || "";
      return provider.includes(s) || policy.includes(s) || patient.includes(s);
    });
  }, [records, search]);

  /* PAGINATION */
  const perPage = 7;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const formatDate = (d?: string | Date | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleString();
  };

  const handleView = (ins: Insurance) => {
    Swal.fire({
      title: `<strong>${ins.insuranceProvider}</strong>`,
      html: `
        <div style="display:flex; gap:20px; font-size:14px; text-align:left;">
        <div style="width:50%; line-height:1.6;">
            <h3 style="font-size:16px; margin-bottom:8px;">Basic Details</h3>
            <p><b>Provider:</b> ${ins.insuranceProvider ?? "—"}</p>
            <p><b>Plan:</b> ${ins.planName ?? "—"}</p>
            <p><b>Policy Number:</b> ${ins.policyNumber ?? "—"}</p>
            <p><b>Group Number:</b> ${ins.groupNumber ?? "—"}</p>
            <p><b>Insured Name:</b> ${ins.insuredName ?? "—"}</p>
            <p><b>Insured Phone:</b> ${ins.insuredPhone ?? "—"}</p>
            <p><b>Patient:</b> ${getPatientName(ins.patientId)}</p>

            <p><b>Created At:</b> ${formatDate(ins.createdAt)}</p>
            <p><b>Updated At:</b> ${formatDate(ins.updatedAt)}</p>
        </div>

        <div style="width:50%; line-height:1.6;">
          <h3 style="font-size:16px; margin-bottom:8px;">Other Details</h3>
          <p><b>Other Insurance:</b> ${ins.otherInsuranceExists ? "Yes" : "No"}</p>
          <p><b>Prior Authorization #:</b> ${ins.priorAuthorizationNumber ?? "—"}</p>
          <p><b>Auto Accident:</b> ${ins.autoAccident ? "Yes" : "No"}</p>
          <p><b>Employment Related:</b> ${ins.employmentRelated ? "Yes" : "No"}</p>
          <p><b>Other Accident:</b> ${ins.otherAccident ? "Yes" : "No"}</p>
          <p><b>Outside Lab:</b> ${ins.outsideLab ? "Yes" : "No"}</p>

          <h3 style="font-size:16px; margin-top:12px;">Insurance Card</h3>
          <div style="margin-top:8px;">
            <p><b>Front:</b></p>
            ${
              ins.insuranceCardFrontBase64
                ? `<img src="data:image/png;base64,${ins.insuranceCardFrontBase64}" style="width:100%; border-radius:8px;" />`
                : "—"
            }

            <p style="margin-top:12px;"><b>Back:</b></p>
            ${
              ins.insuranceCardBackBase64
                ? `<img src="data:image/png;base64,${ins.insuranceCardBackBase64}" style="width:100%; border-radius:8px;" />`
                : "—"
            }
          </div>
        </div>
      </div>`,
      width: 700,
      confirmButtonText: "Close",
    });
  };

  /* DELETE */
  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: "Delete This Record?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#888",
    });

    if (res.isConfirmed) {
      await deleteInsurance(id);
      Swal.fire("Deleted!", "Record removed.", "success");
    }
  };

  /* SAVE EDIT */
  const handleEditSave = async () => {
    if (!editing) return;

    await updateInsurance(editing._id!, editing);
    Swal.fire("Updated", "Record updated successfully.", "success");
    setEditing(null);
    fetchInsurance();
  };

  /* SAVE NEW RECORD */
  const handleAddSave = async () => {
    if (!adding) return;

    await createInsurance(adding);
    Swal.fire("Added", "New record added successfully.", "success");
    setAdding(null);
    fetchInsurance();
  };

  /* REUSABLE INPUT FIELD */
  const Input = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: any;
    onChange: (v: any) => void;
  }) => (
    <input
      className="w-full border px-3 py-2 rounded"
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );

  /* ---------------------- MODAL UI SHARED ---------------------- */
  const InsuranceForm = ({
    data,
    setData,
  }: {
    data: any;
    setData: (d: any) => void;
  }) => (
    <div className="grid grid-cols-2 gap-6">

      {/* LEFT SIDE */}
      <div className="space-y-6">

        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-700 border-b pb-1">Insurance Details</h4>

          <Input label="Insurance Provider" value={data.insuranceProvider} onChange={(v) => setData({ ...data, insuranceProvider: v })} />

          <Input label="Plan Name" value={data.planName} onChange={(v) => setData({ ...data, planName: v })} />

          <Input label="Policy Number" value={data.policyNumber} onChange={(v) => setData({ ...data, policyNumber: v })} />

          <Input label="Group Number" value={data.groupNumber} onChange={(v) => setData({ ...data, groupNumber: v })} />
        </div>

        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-700 border-b pb-1">Insured Person</h4>

          <Input label="Insured Name" value={data.insuredName} onChange={(v) => setData({ ...data, insuredName: v })} />

          <Input label="Insured Phone" value={data.insuredPhone} onChange={(v) => setData({ ...data, insuredPhone: v })} />

          <Input label="Address Line 1" value={data.insuredAddressLine1} onChange={(v) => setData({ ...data, insuredAddressLine1: v })} />

          <Input label="Address Line 2" value={data.insuredAddressLine2} onChange={(v) => setData({ ...data, insuredAddressLine2: v })} />

          <Input label="City" value={data.insuredCity} onChange={(v) => setData({ ...data, insuredCity: v })} />

          <Input label="State" value={data.insuredState} onChange={(v) => setData({ ...data, insuredState: v })} />

          <Input label="Zip Code" value={data.insuredZipCode} onChange={(v) => setData({ ...data, insuredZipCode: v })} />
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="space-y-6">

        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-700 border-b pb-1">Accident & Employment</h4>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={data.autoAccident} onChange={(e) => setData({ ...data, autoAccident: e.target.checked })} />
            Auto Accident
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={data.employmentRelated} onChange={(e) => setData({ ...data, employmentRelated: e.target.checked })} />
            Employment Related
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={data.otherAccident} onChange={(e) => setData({ ...data, otherAccident: e.target.checked })} />
            Other Accident
          </label>

          <Input label="Auto Accident State" value={data.autoAccidentState} onChange={(v) => setData({ ...data, autoAccidentState: v })} />
        </div>

        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-700 border-b pb-1">Other Insurance</h4>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={data.otherInsuranceExists} onChange={(e) => setData({ ...data, otherInsuranceExists: e.target.checked })} />
            Other Insurance Exists
          </label>

          <Input label="Insurance Name" value={data.otherInsuranceName} onChange={(v) => setData({ ...data, otherInsuranceName: v })} />

          <Input label="Policy Number" value={data.otherInsurancePolicyNumber} onChange={(v) => setData({ ...data, otherInsurancePolicyNumber: v })} />

          <Input label="Group Number" value={data.otherInsuranceGroupNumber} onChange={(v) => setData({ ...data, otherInsuranceGroupNumber: v })} />
        </div>

        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-700 border-b pb-1">Hospitalization</h4>

          <label className="text-sm">From</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={safeValue(data.hospitalizationFrom)}
            onChange={(e) => setData({ ...data, hospitalizationFrom: e.target.value })}
          />

          <label className="text-sm">To</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={safeValue(data.hospitalizationTo)}
            onChange={(e) => setData({ ...data, hospitalizationTo: e.target.value })}
          />
        </div>

      </div>

    </div>
  );

  return (
    <div className="space-y-10">

      {/* PAGE HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-700">Insurance Records</h2>

        <div className="flex items-center gap-4">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border rounded-lg w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />

          {/* ADD NEW */}
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            onClick={() => setAdding({})}
          >
            <PlusIcon className="w-5 h-5" />
            Add
          </button>

          {/* REFRESH */}
          <button
            onClick={() => fetchInsurance()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Provider</th>
                <th className="p-3 text-left">Policy</th>
                <th className="p-3 text-left">Insured</th>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-400">
                    No records found
                  </td>
                </tr>
              ) : (
                paginated.map((ins) => (
                  <tr key={ins._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{ins.insuranceProvider}</td>
                    <td className="p-3">{ins.policyNumber}</td>
                    <td className="p-3">{ins.insuredName}</td>
                    <td className="p-3">{getPatientName(ins.patientId)}</td>

                    <td className="p-3 flex justify-center gap-4">
                      <button onClick={() => handleView(ins)}>
                        <EyeIcon className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                      </button>

                      <button onClick={() => setEditing(ins)}>
                        <PencilSquareIcon className="w-5 h-5 text-green-600 hover:text-green-800" />
                      </button>

                      <button onClick={() => handleDelete(ins._id!)}>
                        <TrashIcon className="w-5 h-5 text-red-600 hover:text-red-800" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  page === i + 1 ? "bg-green-600 text-white" : "bg-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- ADD MODAL ---------------- */}
      {adding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white w-[900px] p-6 rounded-lg shadow-lg space-y-6 max-h-[95vh] overflow-y-auto">

            <h3 className="text-2xl font-semibold text-gray-800 pb-2 border-b">Add Insurance</h3>

            <InsuranceForm data={adding} setData={setAdding} />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setAdding(null)}>
                Cancel
              </button>

              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAddSave}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- EDIT MODAL ---------------- */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white w-[900px] p-6 rounded-lg shadow-lg space-y-6 max-h-[95vh] overflow-y-auto">

            <h3 className="text-2xl font-semibold text-gray-800 pb-2 border-b">Edit Insurance</h3>

            <InsuranceForm data={editing} setData={setEditing} />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setEditing(null)}>
                Cancel
              </button>

              <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleEditSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InsuranceRecords;
