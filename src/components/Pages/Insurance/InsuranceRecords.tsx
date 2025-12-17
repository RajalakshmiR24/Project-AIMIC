import React, { useMemo, useState, useEffect } from "react";
import { useInsurance } from "../../../contexts/InsuranceContext";
import { Insurance, Patient } from "../../../api/types";

import Swal from "sweetalert2";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon
} from "@heroicons/react/24/solid";

const getPatientName = (p: Patient) =>
  p ? `${p.firstName} ${p.lastName}` : "Unknown";

const safe = (v: any) => v ?? "";

/* ----------------------------------------------------
   FULL DYNAMIC RENDERER FOR ALL FIELDS (VIEW ONLY)
---------------------------------------------------- */
const isObject = (v: any) => v && typeof v === "object" && !Array.isArray(v);

const RenderField = ({ label, value }: { label: string; value: any }) => {
  if (isObject(value)) {
    return (
      <div className="border rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-2 capitalize">
          {label}
        </h3>
        <div className="pl-4 border-l space-y-2">
          {Object.entries(value).map(([k, v]) => (
            <RenderField key={k} label={k} value={v} />
          ))}
        </div>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="border rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-2 capitalize">
          {label}
        </h3>
        <div className="space-y-3">
          {value.map((item, i) => (
            <div key={i} className="border rounded p-3 bg-gray-50">
              {isObject(item)
                ? Object.entries(item).map(([k, v]) => (
                  <RenderField key={k} label={k} value={v} />
                ))
                : String(item)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (label === "data" && typeof value === "string" && value.startsWith("data:")) {
    return (
      <div className="flex justify-between border-b pb-1 text-sm">
        <span className="font-medium text-gray-600 capitalize">{label}</span>
        <a href={value} download="document" className="text-blue-600 underline">
          Download File
        </a>
      </div>
    );
  }

  return (
    <div className="flex justify-between border-b pb-1 text-sm">
      <span className="font-medium text-gray-600 capitalize">{label}</span>
      <span className="text-gray-800 break-all">{String(value)}</span>
    </div>
  );
};

const InsuranceDetailsFull = ({ data }: { data: any }) => {
  if (!data) return null;

  return (
    <div className="p-6 max-h-[85vh] overflow-auto space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3">
        Insurance Full Details
      </h2>

      {Object.entries(data).map(([k, v]) => (
        <RenderField key={k} label={k} value={v} />
      ))}
    </div>
  );
};

/* ----------------------------------------------------
   DYNAMIC FULL EDIT FORM
---------------------------------------------------- */
const EditField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
}) => {
  // PRIMITIVE FIELDS — SINGLE INPUT
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null ||
    value === undefined
  ) {
    return (
      <div className="mb-3">
        <label className="text-sm font-medium block mb-1 capitalize">
          {label}
        </label>
        <input
          className="w-full border px-3 py-2 rounded"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // ARRAY FIELDS (ONLY HANDLE real arrays, not strings)
  if (Array.isArray(value)) {
    return (
      <div className="border rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-2 capitalize">
          {label}
        </h3>

        {value.map((item, i) => (
          <div key={i} className="border rounded p-3 bg-gray-50 mb-3">
            {typeof item === "object" && item !== null ? (
              Object.entries(item).map(([k, v]) => (
                <EditField
                  key={k}
                  label={k}
                  value={v}
                  onChange={(v2) => {
                    const arr = [...value];
                    arr[i] = { ...arr[i], [k]: v2 };
                    onChange(arr);
                  }}
                />
              ))
            ) : (
              <input
                className="w-full border px-3 py-2 rounded"
                value={item ?? ""}
                onChange={(e) => {
                  const arr = [...value];
                  arr[i] = e.target.value;
                  onChange(arr);
                }}
              />
            )}

            <button
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            >
              Remove
            </button>
          </div>
        ))}

        <button
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
          onClick={() => onChange([...value, {}])}
        >
          + Add Item
        </button>
      </div>
    );
  }

  // OBJECT FIELDS
  if (typeof value === "object") {
    return (
      <div className="border rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-2 capitalize">
          {label}
        </h3>
        {Object.entries(value).map(([k, v]) => (
          <EditField
            key={k}
            label={k}
            value={v}
            onChange={(v2) => onChange({ ...value, [k]: v2 })}
          />
        ))}
      </div>
    );
  }

  return null;
};

const DynamicInsuranceEditForm = ({
  data,
  setData,
}: {
  data: any;
  setData: (d: any) => void;
}) => (
  <div className="space-y-6">
    {Object.entries(data).map(([k, v]) => (
      <EditField
        key={k}
        label={k}
        value={v}
        onChange={(val) => setData({ ...data, [k]: val })}
      />
    ))}
  </div>
);

/* -----------------------------------------------------
   MAIN COMPONENT
----------------------------------------------------- */
const InsuranceRecords: React.FC = () => {
  const {
    records,
    loading,
    fetchInsurance,
    deleteInsurance,
    updateInsurance,
    addInsurance,
  } = useInsurance();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Insurance | null>(null);
  const [fullView, setFullView] = useState<any>(null);

  useEffect(() => {
    fetchInsurance();
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return records.filter((r) => {
      const provider = r.insuranceProvider?.toLowerCase();
      const policy = r.policyNumber?.toLowerCase();
      const patient = getPatientName(r.patientId)?.toLowerCase();

      return (
        provider?.includes(s) ||
        policy?.includes(s) ||
        patient?.includes(s)
      );
    });
  }, [records, search]);

  const perPage = 7;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: "Delete?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
    });

    if (res.isConfirmed) {
      await deleteInsurance(id);
      Swal.fire("Deleted", "", "success");
    }
  };

  const handleEditSave = async () => {
    if (!editing) return;
    await updateInsurance(editing._id!, editing);
    Swal.fire("Updated", "", "success");
    setEditing(null);
    fetchInsurance();
  };



  /* -----------------------------------------------------
     HELPER COMPONENTS (EXTRACTED)
  ----------------------------------------------------- */

  const FormInput = ({
    label,
    value,
    onChange,
    type = "text",
  }: {
    label: string;
    value: any;
    type?: string;
    onChange: (v: any) => void;
  }) => (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      <input
        type={type}
        className="w-full border px-3 py-2 rounded"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  const Section = ({ title, children }: any) => (
    <div className="border rounded-lg p-5 space-y-4">
      <h4 className="font-semibold text-gray-700 pb-2 border-b">{title}</h4>
      {children}
    </div>
  );

  const InsuranceForm = ({
    data,
    setData,
  }: {
    data: any;
    setData: (d: any) => void;
  }) => {
    const update = (key: string, value: any) =>
      setData({ ...data, [key]: value });

    const updateNested = (parent: string, key: string, value: any) =>
      setData({ ...data, [parent]: { ...(data[parent] || {}), [key]: value } });

    return (
      <div className="space-y-8">
        {/* BASIC INSURANCE INFO */}
        <Section title="Insurance Details">
          <div className="grid grid-cols-2 gap-6">
            <FormInput
              label="Insurance Provider"
              value={data.insuranceProvider}
              onChange={(v) => update("insuranceProvider", v)}
            />
            <FormInput
              label="Plan Name"
              value={data.planName}
              onChange={(v) => update("planName", v)}
            />
            <FormInput
              label="Plan Type"
              value={data.planType}
              onChange={(v) => update("planType", v)}
            />
            <FormInput
              label="Policy Number"
              value={data.policyNumber}
              onChange={(v) => update("policyNumber", v)}
            />
            <FormInput
              label="Group Number"
              value={data.groupNumber}
              onChange={(v) => update("groupNumber", v)}
            />
            <FormInput
              label="Phone"
              value={data.phone}
              onChange={(v) => update("phone", v)}
            />
            <FormInput
              label="Effective Date"
              type="date"
              value={data.effectiveDate?.substring(0, 10)}
              onChange={(v) => update("effectiveDate", v)}
            />
            <FormInput
              label="Expiration Date"
              type="date"
              value={data.expirationDate?.substring(0, 10)}
              onChange={(v) => update("expirationDate", v)}
            />
            <FormInput
              label="Status"
              value={data.status}
              onChange={(v) => update("status", v)}
            />
            <FormInput
              label="Primary Insured"
              value={data.primaryInsured}
              onChange={(v) => update("primaryInsured", v)}
            />
          </div>
        </Section>

        {/* ADDRESS */}
        <Section title="Insurance Address">
          <div className="grid grid-cols-2 gap-6">
            <FormInput
              label="Line 1"
              value={data.address?.line1}
              onChange={(v) => updateNested("address", "line1", v)}
            />
            <FormInput
              label="City"
              value={data.address?.city}
              onChange={(v) => updateNested("address", "city", v)}
            />
            <FormInput
              label="State"
              value={data.address?.state}
              onChange={(v) => updateNested("address", "state", v)}
            />
            <FormInput
              label="Postal Code"
              value={data.address?.postalCode}
              onChange={(v) => updateNested("address", "postalCode", v)}
            />
            <FormInput
              label="Country"
              value={data.address?.country}
              onChange={(v) => updateNested("address", "country", v)}
            />
          </div>
        </Section>

        {/* BILLING CONTACT */}
        <Section title="Billing Contact">
          <div className="grid grid-cols-2 gap-6">
            <FormInput
              label="Name"
              value={data.billingContact?.name}
              onChange={(v) => updateNested("billingContact", "name", v)}
            />
            <FormInput
              label="Email"
              value={data.billingContact?.email}
              onChange={(v) => updateNested("billingContact", "email", v)}
            />
            <FormInput
              label="Phone"
              value={data.billingContact?.phone}
              onChange={(v) => updateNested("billingContact", "phone", v)}
            />
          </div>
        </Section>

        {/* BENEFITS */}
        <Section title="Benefits Summary">
          <div className="grid grid-cols-2 gap-6">
            <FormInput
              label="Deductible"
              value={data.benefitsSummary?.deductible}
              onChange={(v) => updateNested("benefitsSummary", "deductible", v)}
            />
            <FormInput
              label="Out of Pocket Max"
              value={data.benefitsSummary?.outOfPocketMax}
              onChange={(v) => updateNested("benefitsSummary", "outOfPocketMax", v)}
            />
            <FormInput
              label="Coinsurance"
              value={data.benefitsSummary?.coinsurance}
              onChange={(v) => updateNested("benefitsSummary", "coinsurance", v)}
            />
            <FormInput
              label="Copay"
              value={data.benefitsSummary?.copay}
              onChange={(v) => updateNested("benefitsSummary", "copay", v)}
            />
            <FormInput
              label="Currency"
              value={data.benefitsSummary?.currency}
              onChange={(v) => updateNested("benefitsSummary", "currency", v)}
            />
          </div>
        </Section>

        {/* POLICY HOLDER */}
        <Section title="Policy Holder">
          <div className="grid grid-cols-2 gap-6">
            <FormInput
              label="First Name"
              value={data.policyHolder?.firstName}
              onChange={(v) => updateNested("policyHolder", "firstName", v)}
            />
            <FormInput
              label="Last Name"
              value={data.policyHolder?.lastName}
              onChange={(v) => updateNested("policyHolder", "lastName", v)}
            />
            <FormInput
              label="Relation"
              value={data.policyHolder?.relationToPatient}
              onChange={(v) =>
                updateNested("policyHolder", "relationToPatient", v)
              }
            />
            <FormInput
              label="Member ID"
              value={data.policyHolder?.memberId}
              onChange={(v) => updateNested("policyHolder", "memberId", v)}
            />

            <FormInput
              type="date"
              label="DOB"
              value={data.policyHolder?.dob?.substring(0, 10)}
              onChange={(v) => updateNested("policyHolder", "dob", v)}
            />
          </div>
        </Section>

        {/* COVERAGE LIMITS */}
        <Section title="Coverage Limits">
          {(data.coverageLimits || []).map((limit: any, i: number) => (
            <div key={i} className="border p-4 rounded-lg bg-gray-50 space-y-3">
              <FormInput
                label="Type"
                value={limit.type}
                onChange={(v) => {
                  const copy = [...data.coverageLimits];
                  copy[i].type = v;
                  update("coverageLimits", copy);
                }}
              />
              <FormInput
                label="Amount"
                value={limit.amount}
                onChange={(v) => {
                  const copy = [...data.coverageLimits];
                  copy[i].amount = v;
                  update("coverageLimits", copy);
                }}
              />
              <FormInput
                label="Currency"
                value={limit.currency}
                onChange={(v) => {
                  const copy = [...data.coverageLimits];
                  copy[i].currency = v;
                  update("coverageLimits", copy);
                }}
              />

              <button
                className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                onClick={() =>
                  update(
                    "coverageLimits",
                    data.coverageLimits.filter((_: any, idx: number) => idx !== i)
                  )
                }
              >
                Remove
              </button>
            </div>
          ))}

          <button
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
            onClick={() =>
              update("coverageLimits", [
                ...(data.coverageLimits || []),
                { type: "", amount: "", currency: "" },
              ])
            }
          >
            + Add Coverage Limit
          </button>
        </Section>

        {/* DOCUMENTS */}
        <Section title="Documents">
          {(data.documents || []).map((doc: any, i: number) => (
            <div key={i} className="border p-4 rounded-lg bg-gray-50 space-y-3">
              <FormInput
                label="Document Name"
                value={doc.name}
                onChange={(v) => {
                  const copy = [...data.documents];
                  copy[i].name = v;
                  update("documents", copy);
                }}
              />

              {/* File Upload Logic */}
              <div>
                <label className="text-sm font-medium block mb-1">Upload File</label>
                <input
                  type="file"
                  className="w-full border px-3 py-2 rounded bg-white"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Convert to Base64
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                      const base64 = reader.result as string;
                      const copy = [...data.documents];

                      // Auto-fill name if empty
                      if (!copy[i].name) copy[i].name = file.name;

                      copy[i].data = base64; // Set Base64 Data
                      copy[i].url = ""; // Clear URL if using file
                      update("documents", copy);
                    };
                  }}
                />
                {doc.data && <p className="text-xs text-green-600 mt-1">✓ File loaded ({doc.data.length} bytes)</p>}
              </div>

              <button
                className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                onClick={() =>
                  update(
                    "documents",
                    data.documents.filter((_: any, idx: number) => idx !== i)
                  )
                }
              >
                Remove
              </button>
            </div>
          ))}

          <button
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
            onClick={() =>
              update("documents", [
                ...(data.documents || []),
                { name: "", url: "", data: "" },
              ])
            }
          >
            + Add Document
          </button>
        </Section>

        {/* METADATA */}
        <Section title="Metadata">
          <FormInput
            label="Uploaded By"
            value={data.metadata?.uploadedBy}
            onChange={(v) => updateNested("metadata", "uploadedBy", v)}
          />
        </Section>

        {/* READONLY: PATIENT */}
        <Section title="Patient (Read Only)">
          <div className="bg-gray-100 p-3 rounded text-sm">
            {data.patientId?.firstName} {data.patientId?.lastName}
          </div>
        </Section>
      </div>
    );
  };


  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          Insurance Records
        </h2>

        <div className="flex gap-4 items-center">
          <input
            className="border px-3 py-2 w-72 rounded-lg"
            placeholder="Search…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <button
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg"
            onClick={() => fetchInsurance()}
          >
            <ArrowPathIcon className="w-5 h-5" /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left w-12">#</th>
              <th className="p-3 text-left">Provider</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Policy #</th>
              <th className="p-3 text-left">Group #</th>
              <th className="p-3 text-left">Holder</th>
              <th className="p-3 text-left">Patient</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-400">
                  No results
                </td>
              </tr>
            ) : (
              paginated.map((ins, idx) => (
                <tr key={ins._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-600">
                    {(page - 1) * perPage + idx + 1}
                  </td>

                  <td className="p-3">{ins.insuranceProvider}</td>
                  <td className="p-3">{ins.planName || "—"}</td>
                  <td className="p-3">{ins.policyNumber}</td>
                  <td className="p-3">{ins.groupNumber || "—"}</td>

                  <td className="p-3">
                    {ins.policyHolder
                      ? `${ins.policyHolder.firstName} ${ins.policyHolder.lastName}`
                      : "—"}
                  </td>

                  <td className="p-3">{getPatientName(ins.patientId)}</td>

                  <td className="p-3 flex justify-center gap-4">
                    <button onClick={() => setFullView(ins)}>
                      <EyeIcon className="w-5 h-5 text-blue-600" />
                    </button>

                    <button onClick={() => setEditing(ins)}>
                      <PencilSquareIcon className="w-5 h-5 text-green-600" />
                    </button>

                    <button onClick={() => handleDelete(ins._id!)}>
                      <TrashIcon className="w-5 h-5 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="p-4 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx + 1)}
                className={`px-3 py-1 border rounded ${page === idx + 1 ? "bg-green-600 text-white" : ""
                  }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>


      {/* EDIT MODAL — NOW FULL FIELD EDITOR */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setEditing(null)}
        >          <div className="bg-white w-[900px] p-6 rounded-lg shadow-lg space-y-6 max-h-[95vh] overflow-auto" onClick={(e) => e.stopPropagation()}
        >
            <h3 className="text-xl font-semibold border-b pb-2">
              Edit Insurance (All Fields)
            </h3>

            <InsuranceForm data={editing} setData={setEditing} />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                className="px-4 py-2 bg-gray-400 rounded"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleEditSave}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL DATA VIEW MODAL */}
      {fullView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setFullView(null)}
        >
          <div className="bg-white w-[900px] rounded-lg shadow-lg max-h-[95vh] overflow-auto" onClick={(e) => e.stopPropagation()}
          >
            <InsuranceDetailsFull data={fullView} />

            <div className="p-4 border-t text-right">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded"
                onClick={() => setFullView(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceRecords;
