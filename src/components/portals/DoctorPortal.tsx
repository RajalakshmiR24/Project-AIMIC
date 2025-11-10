import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useLocation, Link, useSearchParams } from 'react-router-dom';
import {
  Home, FileText, Users, Upload, Activity, UserPlus, Search,
  Eye, Edit, Download, X, CheckCircle2,
} from 'lucide-react';
import PortalLayout from '../shared/PortalLayout';
import { useDoctor } from '../../contexts/DoctorContext';
import type { MedicalReport } from '../../api/api';
import Swal from 'sweetalert2';

/* ----------------------------------------------------------------
   API-aligned types & safe helpers
----------------------------------------------------------------- */

type PatientStatus = 'Active Treatment' | 'Follow-up Required' | 'Completed' | 'New Patient';
type ReportStatus = 'pending' | 'submitted' | 'approved';

type BackendPatient = {
  _id?: string;
  fullName?: string;
  age?: number;
  phone?: string;
  email?: string;
  insuranceId?: string;
  primaryCondition?: string;
  status?: string;
  lastVisit?: string | null;
  nextAppointment?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type NormalizedPatient = {
  _id?: string;
  name?: string;
  age?: number;
  phone?: string;
  email?: string;
  insuranceId?: string;
  condition?: string;
  status: PatientStatus;
  nextAppointment?: string | null;
  updatedAt?: string;
};

const asPatientStatus = (val?: unknown): PatientStatus => {
  const raw =
    typeof val === 'string'
      ? val
      : (val as any)?.status ?? (val as any)?.condition ?? '';

  const txt = String(raw).toLowerCase().trim();

  switch (txt) {
    case 'active treatment':
    case 'active':
    case 'treatment':
      return 'Active Treatment';
    case 'follow-up required':
    case 'follow up':
    case 'follow-up':
      return 'Follow-up Required';
    case 'completed':
    case 'discharged':
      return 'Completed';
    case 'new patient':
    case 'new':
    default:
      return 'New Patient';
  }
};

const fmt = (d?: string | Date | null) =>
  d ? (typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10)) : '—';

const display = (v: any, fallback = '—'): string => {
  if (v == null) return fallback;
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (Array.isArray(v)) return v.map(x => display(x, '')).filter(Boolean).join(', ');
  if (typeof v === 'object') {
    if ('_id' in v) return String((v as any)._id);
    if ('id' in v) return String((v as any).id);
    if ('name' in v) return String((v as any).name);
    if ('value' in v) return String((v as any).value);
    try { return JSON.stringify(v); } catch { return fallback; }
  }
  return fallback;
};

const lower = (v: unknown): string => (v == null ? '' : String(v).toLowerCase());
const includesI = (hay: unknown, needle: string): boolean => lower(hay).includes(lower(needle));

/** Normalize backend patient into a shape the UI can safely use. */
const normalizePatient = (p: BackendPatient): NormalizedPatient => ({
  _id: p._id,
  name: p.fullName ?? (p as any)?.name,
  age: p.age,
  phone: p.phone,
  email: p.email,
  insuranceId: p.insuranceId,
  condition: p.primaryCondition ?? (p as any)?.condition,
  status: asPatientStatus(p.status ?? (p as any)?.condition),
  nextAppointment: p.nextAppointment ?? null,
  updatedAt: p.updatedAt,
});

/* =========================
   DASHBOARD
========================= */
const DoctorDashboard: React.FC = () => {
  const { patients, reports, loading, fetchPatients, fetchReports } = useDoctor();

  useEffect(() => {
    fetchPatients();
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nPatients = useMemo<NormalizedPatient[]>(
    () => (patients as BackendPatient[]).map(normalizePatient),
    [patients]
  );

  const totals = useMemo(
    () => ({
      totalPatients: nPatients.length,
      reportsSubmitted: reports.length,
      pendingReports: reports.filter((r: any) => String(r.status || '').toLowerCase() === 'pending').length,
      activeClaims: 0, // wire when claims ready
    }),
    [nPatients, reports]
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshPatients = async () => {
    setIsRefreshing(true);
    try {
      await fetchPatients();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Patient quick view
  const patientDetailsHTML = (p: NormalizedPatient) => `
    <div style="text-align:left; line-height:1.5">
      <div style="font-weight:700; font-size:16px; margin-bottom:8px">${p.name ?? '—'}</div>
      <div><b>Patient ID:</b> ${display(p._id)}</div>
      <div><b>Status:</b> ${asPatientStatus(p.status)}</div>
      <div><b>Age:</b> ${display(p.age)}</div>
      <div><b>Phone:</b> ${display(p.phone)}</div>
      <div><b>Email:</b> ${display(p.email)}</div>
      <div><b>Insurance ID:</b> ${display(p.insuranceId)}</div>
      <div><b>Primary Condition:</b> ${display(p.condition)}</div>
      <div><b>Next Appointment:</b> ${fmt(p.nextAppointment)}</div>
      <div><b>Last Updated:</b> ${fmt(p.updatedAt)}</div>
    </div>
  `;

  const handleViewPatient = (fullId?: string) => {
    if (!fullId) {
      Swal.fire('Not found', 'Missing patient ID', 'warning');
      return;
    }
    const match = nPatients.find(px => String(px._id) === String(fullId));
    if (!match) {
      Swal.fire('Not found', `No patient found with ID ${fullId}`, 'error');
      return;
    }
    Swal.fire({
      title: 'Patient Details',
      html: patientDetailsHTML(match),
      confirmButtonText: 'Close',
      width: 560,
    });
  };

// Full report viewer for Dashboard "Recent Reports"
const handleViewReport = (r: any) => {
  // patientId may be a string or an object with _id/phone/email
  const pidObj =
    typeof r?.patientId === 'object' && r?.patientId !== null ? r.patientId : undefined;

  const pid = pidObj
    ? (pidObj._id || pidObj.id || pidObj.value)
    : (r?.patientId ?? '—');

  const statusText = String(r?.status ?? 'submitted'); // preserve original casing like "Submitted"
  const followUp = r?.followUpDate ? fmt(r.followUpDate) : '—';
  const createdByName = r?.createdBy?.name || '—';
  const createdByEmail = r?.createdBy?.email || '—';

  const html = `
    <div style="text-align:left; line-height:1.6">
      <!-- Header -->
      <div style="font-weight:800; font-size:18px; margin-bottom:2px">${display(r.reportType)}</div>
      <div style="color:#475569; font-size:13px; margin-bottom:12px">
        <b>Report ID:</b> ${display(r._id)} &nbsp; • &nbsp;
        <b>Status:</b> ${display(statusText)} &nbsp; • &nbsp;
        <b>Created:</b> ${fmt(r.createdAt)} &nbsp; • &nbsp;
        <b>Updated:</b> ${fmt(r.updatedAt)}
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
        <!-- LEFT -->
        <div>
          <div style="font-weight:700; margin-bottom:6px">Patient</div>
          <div><b>Patient ID:</b> ${display(pid)}</div>
          ${
            pidObj
              ? `
                <div><b>Phone:</b> ${display(pidObj.phone)}</div>
                <div><b>Email:</b> ${display(pidObj.email)}</div>
              `
              : `<div style="color:#888">No enriched patient contact on this payload.</div>`
          }

          <hr style="margin:12px 0; border:none; border-top:1px solid #eee" />

          <div style="font-weight:700; margin-bottom:6px">Follow-up</div>
          <div><b>Follow-up Date:</b> ${followUp}</div>
          <div><b>Recommendations:</b> ${display(r.recommendations)}</div>
        </div>

        <!-- RIGHT -->
        <div>
          <div style="font-weight:700; margin-bottom:6px">Clinical Details</div>
          <div><b>Primary Diagnosis:</b> ${display(r.primaryDiagnosis)}</div>
          <div><b>Treatment Provided:</b>
            <pre style="white-space:pre-wrap;margin:6px 0 0">${display(r.treatmentProvided)}</pre>
          </div>
          <div><b>Medications Prescribed:</b> ${display(r.medicationsPrescribed)}</div>
          <div><b>Lab Results:</b> ${display(r.labResults)}</div>

          <hr style="margin:12px 0; border:none; border-top:1px solid #eee" />

          <div style="font-weight:700; margin-bottom:6px">Submitted By</div>
          <div><b>Name:</b> ${display(createdByName)}</div>
          <div><b>Email:</b> ${display(createdByEmail)}</div>
        </div>
      </div>
    </div>
  `;

  Swal.fire({ title: 'Report Details', html, width: 1000, confirmButtonText: 'Close' });
};

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : totals.totalPatients}</p>
              <p className="text-xs text-green-600 font-medium">updated live</p>
            </div>
            <Users className="w-8 h-8 text-teal-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reports Submitted</p>
              <p className="text-2xl font-bold text-teal-600">{loading ? '—' : totals.reportsSubmitted}</p>
              <p className="text-xs text-teal-600 font-medium">
                {loading ? '' : `${totals.pendingReports} pending review`}
              </p>
            </div>
            <FileText className="w-8 h-8 text-teal-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Claims</p>
              <p className="text-2xl font-bold text-orange-600">{totals.activeClaims}</p>
              <p className="text-xs text-orange-600 font-medium">Awaiting reports</p>
            </div>
            <Activity className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Dashboard Lists Side by Side */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Patients</h2>
              <button
                onClick={refreshPatients}
                className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center space-x-1"
                title="Refresh patients"
              >
                {isRefreshing ? (
                  <span className="inline-flex items-center">
                    <span className="w-3.5 h-3.5 mr-2 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    Refreshing…
                  </span>
                ) : (
                  <>
                    <span>Refresh</span>
                    <Users className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-gray-600">Loading patients…</div>
            ) : (
              <div className="space-y-4">
                {nPatients.slice(0, 5).map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{display(p.name)}</p>
                        <p className="text-sm text-gray-600">
                          ID: {String(p._id || '').toString().slice(-6) || '—'} • Age: {display(p.age)} • {display(p.insuranceId)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Next: {fmt(p.nextAppointment)}</p>
                      <p className="text-sm font-medium text-teal-600">{asPatientStatus(p.status)}</p>
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleViewPatient(p._id)}
                          className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/doctor/submit?patientId=${encodeURIComponent(String(p._id ?? ''))}`}
                          className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Submit report for this patient"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {nPatients.length === 0 && <div className="text-gray-600">No patients yet.</div>}
              </div>
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
              <Link
                to="/doctor/submit"
                className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center space-x-1"
              >
                <span>Submit New</span>
                <FileText className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-gray-600">Loading reports…</div>
            ) : (
              <div className="space-y-4">
                {reports.slice(0, 5).map((r: any) => {
                  const status: ReportStatus = (String(r.status || 'submitted').toLowerCase() as ReportStatus);
                  const pid = typeof r.patientId === 'object'
                    ? r.patientId?._id || r.patientId?.id || r.patientId?.value
                    : r.patientId;
                  return (
                    <div
                      key={r._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{display(r.reportType)}</p>
                        <p className="text-sm text-gray-600">
                          Patient ID: {display(pid)} • {fmt(r.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : status === 'submitted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                          {String(r.status || 'submitted')}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewReport(r)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.alert(`Downloading report ${display(r._id)}...`)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download report"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {status === 'pending' && (
                            <button
                              onClick={() => window.alert(`Editing report ${display(r._id)}...`)}
                              className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Edit report"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {reports.length === 0 && <div className="text-gray-600">No reports yet.</div>}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

/* =========================
   PATIENT MANAGEMENT
========================= */
const PatientManagement: React.FC = () => {
  const { patients, reports, loading, addPatient, deletePatient, fetchPatients, fetchReports } = useDoctor();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddPatient, setShowAddPatient] = useState<boolean>(false);
  const [newPatient, setNewPatient] = useState<{
    fullName: string; age: string; phone: string; email: string;
    primaryCondition: string; insuranceId: string;
  }>({
    fullName: '', age: '', phone: '', email: '',
    primaryCondition: '', insuranceId: '',
  });

  useEffect(() => {
    fetchPatients();
    fetchReports();
  }, []); // eslint-disable-line

  const nPatients = useMemo<NormalizedPatient[]>(
    () => (patients as BackendPatient[]).map(normalizePatient),
    [patients]
  );

  const filteredPatients = useMemo(() => {
    const q = lower(searchTerm);
    return nPatients.filter((p) =>
      includesI(p.name, q) ||
      includesI(p._id, q) ||
      includesI(p.email, q) ||
      includesI(p.phone, q) ||
      includesI(p.condition, q) ||
      includesI(p.insuranceId, q)
    );
  }, [nPatients, searchTerm]);

  // Helper: get pid string from report.patientId
  const getPid = (r: any): string | undefined => {
    if (!r) return undefined;
    const pid = typeof r.patientId === 'object' && r.patientId !== null
      ? (r.patientId._id || r.patientId.id || r.patientId.value)
      : r.patientId;
    return pid ? String(pid) : undefined;
  };

  // Build the left detail pane HTML for a report
  const reportDetailsHTML = (r: any) => {
    const statusText = r?.status ? String(r.status) : 'submitted';
    return `
      <div style="text-align:left; line-height:1.55">
        <div style="font-weight:800; font-size:18px; margin-bottom:6px">${display(r.reportType)}</div>
        <div style="color:#475569; font-size:13px; margin-bottom:12px">
          <b>Report ID:</b> ${display(r._id)} &nbsp; • &nbsp;
          <b>Status:</b> ${display(statusText)} &nbsp; • &nbsp;
          <b>Created:</b> ${fmt(r.createdAt)} &nbsp; • &nbsp;
          <b>Updated:</b> ${fmt(r.updatedAt)}
        </div>

        <div style="margin-bottom:10px">
          <div style="font-weight:700; margin-bottom:6px">Clinical Details</div>
          <div><b>Primary Diagnosis:</b> ${display(r.primaryDiagnosis)}</div>
          <div><b>Treatment Provided:</b><pre style="white-space:pre-wrap;margin:6px 0 0">${display(r.treatmentProvided)}</pre></div>
          <div><b>Medications Prescribed:</b> ${display(r.medicationsPrescribed)}</div>
          <div><b>Lab Results:</b> ${display(r.labResults)}</div>
        </div>

        <div style="margin-bottom:10px">
          <div style="font-weight:700; margin-bottom:6px">Follow-up</div>
          <div><b>Follow-up Date:</b> ${r?.followUpDate ? fmt(r.followUpDate) : '—'}</div>
          <div><b>Recommendations:</b> ${display(r.recommendations)}</div>
        </div>

        <div>
          <div style="font-weight:700; margin-bottom:6px">Submitted By</div>
          <div><b>Name:</b> ${display(r?.createdBy?.name || '—')}</div>
          <div><b>Email:</b> ${display(r?.createdBy?.email || '—')}</div>
        </div>
      </div>
    `;
  };

  // View History: modal with right table + left detail panel
  const handleViewHistory = async (p: NormalizedPatient) => {
    await fetchReports();

    const ptReports = (reports as any[]).filter(r => {
      const pid = getPid(r);
      return pid && String(pid) === String(p._id);
    });

    if (ptReports.length === 0) {
      Swal.fire('No Reports', `No reports found for ${display(p.name)}.`, 'info');
      return;
    }

    // Sort by createdAt desc
    ptReports.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return db - da;
    });

    const first = ptReports[0];

    const rowsHTML = ptReports.map((r) => {
      const status: ReportStatus = (String(r.status || 'submitted').toLowerCase() as ReportStatus);
      const badge =
        status === 'approved' ? 'background:#dcfce7;color:#166534' :
        status === 'pending'  ? 'background:#fef9c3;color:#854d0e' :
                                'background:#dbeafe;color:#1e3a8a';
      return `
        <tr class="hover:bg-gray-50">
          <td class="px-3 py-2">${display(r.reportType)}</td>
          <td class="px-3 py-2">
            <span style="font-size:12px;padding:2px 8px;border-radius:9999px;${badge}">
              ${display(r.status || 'submitted')}
            </span>
          </td>
          <td class="px-3 py-2">${fmt(r.createdAt)}</td>
          <td class="px-3 py-2">${r?.followUpDate ? fmt(r.followUpDate) : '—'}</td>
          <td class="px-3 py-2">
            <button data-report-id="${r._id}" class="report-view-btn" style="color:#2563eb;padding:6px 10px;border-radius:8px;">
              View
            </button>
          </td>
        </tr>
      `;
    }).join('');

    const html = `
      <div style="display:grid;grid-template-columns: minmax(320px, 1fr) 1.1fr; gap:16px; min-height:420px; align-items:start;">
        <!-- LEFT: details panel -->
        <div id="report-detail-pane" style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;overflow:auto;max-height:520px;">
          ${reportDetailsHTML(first)}
        </div>

        <!-- RIGHT: reports table -->
        <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <div style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
            <div style="font-weight:700">Reports for ${display(p.name)} <span style="color:#64748b;font-weight:500">(${ptReports.length})</span></div>
          </div>
          <div style="overflow:auto;max-height:520px;">
            <table style="width:100%;font-size:14px;border-collapse:collapse;">
              <thead style="position:sticky;top:0;background:#f8fafc;">
                <tr style="text-align:left;color:#334155;">
                  <th class="px-3 py-2" style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">Type</th>
                  <th class="px-3 py-2" style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">Status</th>
                  <th class="px-3 py-2" style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">Created</th>
                  <th class="px-3 py-2" style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">Follow-up</th>
                  <th class="px-3 py-2" style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHTML}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    Swal.fire({
      title: 'Patient Medical History',
      html,
      width: 1100,
      showConfirmButton: true,
      confirmButtonText: 'Close',
      didOpen: () => {
        // Attach click handlers to each View button
        const container = Swal.getHtmlContainer();
        if (!container) return;

        const pane = container.querySelector('#report-detail-pane');
        const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('.report-view-btn'));
        buttons.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const rid = (e.currentTarget as HTMLButtonElement).getAttribute('data-report-id');
            const report = ptReports.find(rr => String(rr._id) === String(rid));
            if (report && pane) {
              (pane as HTMLElement).innerHTML = reportDetailsHTML(report);
              (pane as HTMLElement).scrollTop = 0;
            }
          });
        });
      },
    });
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(newPatient.age, 10);

    const payload: Partial<BackendPatient> = {
      fullName: newPatient.fullName.trim(),
      email: newPatient.email.trim(),
      phone: newPatient.phone.trim(),
      age: Number.isNaN(ageNum) ? undefined : ageNum,
      insuranceId: newPatient.insuranceId.trim() || undefined,
      primaryCondition: newPatient.primaryCondition.trim() || undefined,
      status: 'New Patient',
    };

    try {
      await addPatient(payload as any);
      setNewPatient({
        fullName: '', age: '', phone: '', email: '',
        primaryCondition: '', insuranceId: '',
      });
      setShowAddPatient(false);
      window.alert('Patient added successfully!');
    } catch (err: any) {
      window.alert(`Failed to add patient: ${err?.message ?? 'unknown error'}`);
    }
  };

  const handleDeletePatient = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to remove this patient?')) return;
    try {
      await deletePatient(id);
      window.alert('Patient removed successfully!');
    } catch (err: any) {
      window.alert(`Failed to delete: ${err?.message ?? 'unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Patient */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients by name, ID, phone, email, condition, or insurance..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAddPatient(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Patient Management {loading ? '' : `(${filteredPatients.length})`}
          </h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-gray-600">Loading patients…</div>
          ) : (
            <div className="grid gap-6">
              {filteredPatients.map((p) => (
                <div key={p._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{display(p.name)}</h3>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {asPatientStatus(p.status)}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        Patient ID: {display(p._id)} • Age: {display(p.age)}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="space-y-1">
                      <p><span className="font-medium text-gray-700">Primary Condition:</span> {display(p.condition)}</p>
                      <p><span className="font-medium text-gray-700">Phone:</span> {display(p.phone)}</p>
                    </div>
                    <div className="space-y-1">
                      <p><span className="font-medium text-gray-700">Insurance ID:</span> {display(p.insuranceId)}</p>
                      <p><span className="font-medium text-gray-700">Email:</span> {display(p.email)}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleViewHistory(p)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View History
                    </button>
                    <Link
                      to={`/doctor/submit?patientId=${encodeURIComponent(String(p._id ?? ''))}`}
                      className="text-teal-600 hover:text-teal-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-teal-50 transition-colors"
                    >
                      Submit Report
                    </Link>
                    <button
                      onClick={() => handleDeletePatient(p._id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {filteredPatients.length === 0 && (
                <div className="text-center text-gray-600 py-12">No patients match your search.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Add New Patient</h3>
                <button
                  onClick={() => setShowAddPatient(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleAddPatient} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newPatient.fullName}
                    onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text sm font-medium text-gray-700 mb-1">Insurance ID</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newPatient.insuranceId}
                    onChange={(e) => setNewPatient({ ...newPatient, insuranceId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Condition</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newPatient.primaryCondition}
                    onChange={(e) => setNewPatient({ ...newPatient, primaryCondition: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================
   ALL REPORTS LIST
========================= */
const AllReportsPage: React.FC = () => {
  const { reports, patients, loading, fetchReports, fetchPatients } = useDoctor();
  const [q, setQ] = useState('');

  // Build a fast lookup for patient details
  const nPatients = useMemo<NormalizedPatient[]>(
    () => (patients as BackendPatient[]).map(normalizePatient),
    [patients]
  );
  const patientIndex = useMemo(() => {
    const m = new Map<string, NormalizedPatient>();
    nPatients.forEach(p => {
      if (p._id) m.set(String(p._id), p);
    });
    return m;
  }, [nPatients]);

  useEffect(() => {
    fetchReports();
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return reports;
    return reports.filter((r: any) => {
      const pid = typeof r.patientId === 'object'
        ? r.patientId?._id || r.patientId?.id || r.patientId?.value
        : r.patientId;
      const p = pid ? patientIndex.get(String(pid)) : undefined;

      return (
        includesI(r._id, s) ||
        includesI(r.reportType, s) ||
        includesI(r.status, s) ||
        includesI(r.primaryDiagnosis, s) ||
        includesI(pid, s) ||
        includesI(p?.name, s) ||
        includesI(p?.phone, s) ||
        includesI(p?.condition, s)
      );
    });
  }, [reports, q, patientIndex]);

  // Full detail modal aligned with payload + enriched patient name/condition
  const viewReport = (r: any) => {
    const pidObj = typeof r?.patientId === 'object' && r?.patientId !== null ? r.patientId : undefined;
    const pid = pidObj
      ? (pidObj._id || pidObj.id || pidObj.value)
      : (r?.patientId ?? '—');
    const p = pid ? patientIndex.get(String(pid)) : undefined;

    const statusText = String(r?.status ?? 'submitted'); // keep original casing like "Submitted"
    const followUp = r?.followUpDate ? fmt(r.followUpDate) : '—';
    const createdByName = r?.createdBy?.name || '—';
    const createdByEmail = r?.createdBy?.email || '—';

    const html = `
      <div style="text-align:left; line-height:1.6">
        <!-- Header -->
        <div style="font-weight:800; font-size:18px; margin-bottom:2px">${display(r.reportType)}</div>
        <div style="color:#475569; font-size:13px; margin-bottom:12px">
          <b>Report ID:</b> ${display(r._id)} &nbsp; • &nbsp;
          <b>Status:</b> ${display(statusText)} &nbsp; • &nbsp;
          <b>Created:</b> ${fmt(r.createdAt)} &nbsp; • &nbsp;
          <b>Updated:</b> ${fmt(r.updatedAt)}
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
          <!-- LEFT -->
          <div>
            <div style="font-weight:700; margin-bottom:6px">Patient</div>
            <div><b>Patient ID:</b> ${display(pid)}</div>
            ${p ? `
              <div><b>Name:</b> ${display(p.name)}</div>
              <div><b>Phone:</b> ${display(p.phone)}</div>
              <div><b>Condition:</b> ${display(p.condition)}</div>
            ` : `
              ${pidObj ? `
                <div><b>Phone:</b> ${display(pidObj.phone)}</div>
                <div><b>Email:</b> ${display(pidObj.email)}</div>
              ` : '<div style="color:#888">No enriched patient profile found.</div>'}
            `}

            <hr style="margin:12px 0; border:none; border-top:1px solid #eee" />

            <div style="font-weight:700; margin-bottom:6px">Follow-up</div>
            <div><b>Follow-up Date:</b> ${followUp}</div>
            <div><b>Recommendations:</b> ${display(r.recommendations)}</div>
          </div>

          <!-- RIGHT -->
          <div>
            <div style="font-weight:700; margin-bottom:6px">Clinical Details</div>
            <div><b>Primary Diagnosis:</b> ${display(r.primaryDiagnosis)}</div>
            <div><b>Treatment Provided:</b><pre style="white-space:pre-wrap;margin:6px 0 0">${display(r.treatmentProvided)}</pre></div>
            <div><b>Medications Prescribed:</b> ${display(r.medicationsPrescribed)}</div>
            <div><b>Lab Results:</b> ${display(r.labResults)}</div>

            <hr style="margin:12px 0; border:none; border-top:1px solid #eee" />

            <div style="font-weight:700; margin-bottom:6px">Submitted By</div>
            <div><b>Name:</b> ${display(createdByName)}</div>
            <div><b>Email:</b> ${display(createdByEmail)}</div>
          </div>
        </div>
      </div>
    `;
    Swal.fire({ title: 'Report Details', html, width: 1000, confirmButtonText: 'Close' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search by report id, type, status, diagnosis, patient id/name/phone/condition…"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Link
            to="/doctor/submit"
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
            title="Add Report"
          >
            <FileText className="w-5 h-5" />
            <span>Add Report</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            All Reports {loading ? '' : `(${filtered.length})`}
          </h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-gray-600">Loading reports…</div>
          ) : filtered.length === 0 ? (
            <div className="text-gray-600">No reports found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-700">
                    <th className="px-4 py-3 border-b">Report</th>
                    <th className="px-4 py-3 border-b">Patient</th>
                    <th className="px-4 py-3 border-b">Phone</th>
                    <th className="px-4 py-3 border-b">Condition</th>
                    <th className="px-4 py-3 border-b">Status</th>
                    <th className="px-4 py-3 border-b">Created</th>
                    <th className="px-4 py-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r: any) => {
                    const status: ReportStatus = (String(r.status || 'submitted').toLowerCase() as ReportStatus);
                    const pid = typeof r.patientId === 'object'
                      ? r.patientId?._id || r.patientId?.id || r.patientId?.value
                      : r.patientId;

                    const p = pid ? patientIndex.get(String(pid)) : undefined;
                    const name = p?.name ?? '—';
                    const phone = p?.phone ?? (typeof r.patientId === 'object' ? r.patientId?.phone : undefined) ?? '—';
                    const condition = p?.condition ?? '—';

                    return (
                      <tr key={r._id} className="text-sm hover:bg-gray-50">
                        <td className="px-4 py-3 border-b">
                          <div className="font-medium text-gray-900">{display(r.reportType)}</div>
                          <div className="text-gray-500">#{display(r._id)}</div>
                        </td>
                        <td className="px-4 py-3 border-b">
                          <div className="font-medium text-gray-900">{display(name)}</div>
                          <div className="text-gray-500">ID: {display(pid)}</div>
                        </td>
                        <td className="px-4 py-3 border-b">{display(phone)}</td>
                        <td className="px-4 py-3 border-b">{display(condition)}</td>
                        <td className="px-4 py-3 border-b">
                          <span
                            className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : status === 'submitted'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {String(r.status || 'submitted')}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-b">{fmt(r.createdAt)}</td>
                        <td className="px-4 py-3 border-b">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => viewReport(r)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => window.alert(`Downloading report ${display(r._id)}...`)}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {status === 'pending' && (
                              <button
                                onClick={() => window.alert(`Editing report ${display(r._id)}...`)}
                                className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================
   SUBMIT REPORT
========================= */
type ReportForm = {
  patientId: string;
  reportType: string;
  diagnosis: string;
  treatment: string;
  recommendations: string;
  followUpDate: string;
  medications: string;
  labResults: string;
};

const SubmitReport: React.FC = () => {
  const { createReport, patients, fetchPatients } = useDoctor();
  const [searchParams] = useSearchParams();

  // Ensure patients are loaded (for the dropdown)
  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nPatients = useMemo<NormalizedPatient[]>(
    () => (patients as BackendPatient[]).map(normalizePatient).filter(p => p._id),
    [patients]
  );

  const prefillPatientId = searchParams.get('patientId') || '';

  const [formData, setFormData] = useState<ReportForm>({
    patientId: prefillPatientId, // auto-fill from URL
    reportType: '',
    diagnosis: '',
    treatment: '',
    recommendations: '',
    followUpDate: '',
    medications: '',
    labResults: '',
  });

  // Keep in sync if the URL changes while on the page
  useEffect(() => {
    const qId = searchParams.get('patientId') || '';
    if (qId && formData.patientId !== qId) {
      setFormData(prev => ({ ...prev, patientId: qId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: MedicalReport = {
      patientId: formData.patientId.trim(),
      reportType: formData.reportType,
      primaryDiagnosis: formData.diagnosis,
      treatmentProvided: [
        `Treatment: ${formData.treatment}`,
        formData.medications ? `Medications: ${formData.medications}` : '',
        formData.labResults ? `Lab Results: ${formData.labResults}` : '',
        formData.recommendations ? `Recommendations: ${formData.recommendations}` : '',
        formData.followUpDate ? `Follow-up Date: ${formData.followUpDate}` : '',
      ].filter(Boolean).join('\n'),
    };

    try {
      await createReport(payload);
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          patientId: '',
          reportType: '',
          diagnosis: '',
          treatment: '',
          recommendations: '',
          followUpDate: '',
          medications: '',
          labResults: '',
        });
      }, 2000);
    } catch (err: any) {
      setIsSubmitting(false);
      window.alert(`Failed to submit report: ${err?.message ?? 'unknown error'}`);
    }
  };

  const saveDraft = () => {
    localStorage.setItem('reportDraft', JSON.stringify(formData));
    window.alert('Report draft saved successfully!');
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('reportDraft');
    if (draft) {
      setFormData(JSON.parse(draft));
      window.alert('Draft loaded successfully!');
    } else {
      window.alert('No draft found!');
    }
  };

  // Helper: label for patient in dropdown: "Name — IDtail (Phone)"
  const idTail = (id?: string) => (id ? String(id).replace(/[^a-zA-Z0-9]/g, '').slice(-6) : '—');
  const patientLabel = (p: NormalizedPatient) =>
    `${display(p.name)} — ${idTail(p._id)}${p.phone ? ` (${p.phone})` : ''}`;

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your medical report has been submitted and will be processed for insurance claim verification.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              Timestamp: <span className="font-mono font-bold text-teal-600">{new Date().toISOString()}</span>
            </p>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Submit Medical Report</h2>
            <div className="flex space-x-3">
              <button
                onClick={loadDraft}
                className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center space-x-1"
              >
                <Upload className="w-4 h-4" />
                <span>Load Draft</span>
              </button>
              <button
                onClick={saveDraft}
                className="text-gray-700 hover:text-gray-900 font-medium text-sm flex items-center space-x-1"
              >
                <FileText className="w-4 h-4" />
                <span>Save Draft</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Patient selection + (optional) manual override */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
              >
                <option value="">— Choose a patient —</option>
                {nPatients.map((p) => (
                  <option key={p._id} value={String(p._id)}>
                    {patientLabel(p)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                The value saved will be the Patient ID. Names are for identification only.
              </p>
            </div>

            {/* Optional: keep a read-only display of chosen ID or allow manual override */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID (override if needed)
              </label>
              <input
                type="text"
                placeholder="Enter a Patient ID manually if not listed"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type *</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.reportType}
                onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                required
              >
                <option value="">Select report type</option>
                <option value="Consultation Report">Consultation Report</option>
                <option value="Laboratory Results">Laboratory Results</option>
                <option value="X-Ray Report">X-Ray Report</option>
                <option value="Surgery Report">Surgery Report</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Emergency Report">Emergency Report</option>
              </select>
            </div>

            <div>{/* spacer for layout symmetry */}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Diagnosis *</label>
            <textarea
              rows={3}
              placeholder="Enter primary diagnosis with ICD-10 codes if applicable"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Provided *</label>
            <textarea
              rows={4}
              placeholder="Describe the treatment provided, procedures performed, and clinical findings"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medications Prescribed</label>
              <textarea
                rows={3}
                placeholder="List medications with dosage and frequency"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.medications}
                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lab Results</label>
              <textarea
                rows={3}
                placeholder="Enter relevant lab test results and values"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.labResults}
                onChange={(e) => setFormData({ ...formData, labResults: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations & Follow-up</label>
            <textarea
              rows={3}
              placeholder="Follow-up recommendations, lifestyle changes, and next steps"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
            <input
              type="date"
              className="w-full md:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('reportDraft', JSON.stringify(formData));
                window.alert('Report draft saved successfully!');
              }}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================
   PORTAL SHELL + ROUTES
========================= */
const DoctorPortal: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/doctor' },
    { icon: <Users className="w-5 h-5" />, label: 'Patients', path: '/doctor/patients' },
    { icon: <FileText className="w-5 h-5" />, label: 'All Report', path: '/doctor/reports' }, // updated
  ];

  return (
    <div className="doctor-portal-shell">
      <style>{`
        .doctor-portal-shell nav { overflow-y: hidden !important; }
        .doctor-portal-shell nav::-webkit-scrollbar { display: none; }
      `}</style>

      <PortalLayout
        title="Doctor Portal"
        menuItems={menuItems}
        currentPath={location.pathname}
        headerColor="bg-teal-600"
      >
        <Routes>
          <Route path="/" element={<DoctorDashboard />} />
          <Route path="/patients" element={<PatientManagement />} />
          <Route path="/reports" element={<AllReportsPage />} />
          <Route path="/submit" element={<SubmitReport />} />
        </Routes>
      </PortalLayout>
    </div>
  );
};

export default DoctorPortal;
