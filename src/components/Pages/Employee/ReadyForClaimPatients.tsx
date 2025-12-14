// ReadyForClaimPatients.tsx — WITH REFRESH BUTTON

import React, { useEffect, useState } from "react";
import { employeeApi } from "../../../api/employee.api";
import { Loader2, ClipboardList, Eye, RefreshCcw } from "lucide-react";
import Swal from "sweetalert2";

const ClaimReviewModal = ({ item, onClose }: any) => {
  const [tab, setTab] = useState<"Patient" | "Insurance" | "Report">("Patient");

  const patient = item.patientId;
  const insurance = item.insuranceId;
  const report = item;

  return (
    <div className="p-6 space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Medical Report Details</h2>
        <button onClick={onClose} className="border px-3 py-1 rounded text-sm">
          Close
        </button>
      </div>

      <div className="flex gap-6 border-b">
        {["Patient", "Insurance", "Report"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`pb-2 text-sm font-medium ${
              tab === t
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Patient" && (
        <div className="bg-gray-100 p-4 rounded text-sm space-y-1">
          <div><b>Name:</b> {patient.firstName} {patient.lastName}</div>
          <div><b>Gender:</b> {patient.gender}</div>
          <div><b>Email:</b> {patient.email}</div>
          <div><b>Phone:</b> {patient.phone}</div>
          <div>
            <b>Address:</b> {patient.address?.line1}, {patient.address?.city}
          </div>
        </div>
      )}

      {tab === "Insurance" && (
        <div className="bg-gray-100 p-4 rounded text-sm space-y-1">
          {insurance ? (
            <>
              <div><b>Provider:</b> {insurance.insuranceProvider}</div>
              <div><b>Plan:</b> {insurance.planName}</div>
              <div><b>Policy #:</b> {insurance.policyNumber}</div>
              <div><b>Group #:</b> {insurance.groupNumber}</div>
              <div><b>Status:</b> {insurance.status}</div>
            </>
          ) : (
            <div className="text-gray-400">No insurance linked</div>
          )}
        </div>
      )}

      {tab === "Report" && (
        <div className="bg-gray-100 p-4 rounded text-sm space-y-1">
          <div><b>Type:</b> {report.reportType}</div>
          <div><b>Diagnosis:</b> {report.primaryDiagnosis}</div>
          <div><b>Treatment:</b> {report.treatmentProvided}</div>

          <div className="mt-2">
            <b>Procedures:</b>
            {report.procedureCodes?.map((p: any) => (
              <div key={p._id}>
                • {p.cpt} — ₹{p.charges} ({p.units})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ReadyForClaimPatients: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeItem, setActiveItem] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getPatientsReadyForClaim();
      setItems(res || []);
    } catch {
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {activeItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[900px] max-h-[90vh] overflow-y-auto shadow-xl">
            <ClaimReviewModal
              item={activeItem}
              onClose={() => setActiveItem(null)}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold flex gap-2 items-center">
          <ClipboardList className="w-5 h-5" />
          Ready for Claim (Submitted Reports)
        </h1>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
        >
          <RefreshCcw
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-6 overflow-x-auto">
        {loading ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No submitted reports
          </div>
        ) : (
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Patient</th>
                <th className="p-3 border">Insurance</th>
                <th className="p-3 border">Report</th>
                <th className="p-3 border text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const patient = item.patientId;
                const insurance = item.insuranceId;

                return (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="p-3 border">
                      <div className="font-semibold">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {patient.email}
                      </div>
                    </td>

                    <td className="p-3 border">
                      {insurance ? (
                        <>
                          <b>{insurance.insuranceProvider}</b>
                          <br />
                          {insurance.policyNumber}
                        </>
                      ) : (
                        <span className="text-gray-400">No insurance</span>
                      )}
                    </td>

                    <td className="p-3 border">
                      <b>{item.reportType}</b>
                      <br />
                      {item.primaryDiagnosis}
                    </td>

                    <td className="p-3 border text-right">
                      <button
                        onClick={() => setActiveItem(item)}
                        className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-2 ml-auto"
                      >
                        <Eye className="w-4 h-4" /> View
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

export default ReadyForClaimPatients;
