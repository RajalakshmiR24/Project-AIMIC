import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  FileText,
  Users,
  Upload,
  Calendar,
  Activity,
  UserPlus,
  Search,
  Eye,
  Edit,
  Download,
  Plus,
  X,
  CheckCircle2,
  Phone,
  Mail,
} from 'lucide-react';
import PortalLayout from '../shared/PortalLayout';

/* =========================
   Types
   ========================= */
type PatientStatus = 'Active Treatment' | 'Follow-up Required' | 'Completed' | 'New Patient';
type ReportStatus = 'pending' | 'submitted' | 'approved';
type AppointmentStatus = 'pending' | 'confirmed' | 'completed';

interface Patient {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  status: PatientStatus;
  condition: string;
  nextAppointment: string;
  phone: string;
  email: string;
  insuranceId?: string;
}

interface Report {
  id: string;
  patient: string;
  type: string;
  date: string;
  status: ReportStatus;
}

interface Appointment {
  id: string;
  patient: string;
  time: string;
  date: string;
  type: string;
  status: AppointmentStatus;
  duration: string;
}

interface ReportForm {
  patientId: string;
  reportType: string;
  diagnosis: string;
  treatment: string;
  recommendations: string;
  followUpDate: string;
  medications: string;
  labResults: string;
}

/* =========================
   Doctor Dashboard
   ========================= */
const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [patients] = useState<Patient[]>([
    {
      id: 'P001',
      name: 'John Doe',
      age: 35,
      lastVisit: '2025-01-15',
      status: 'Active Treatment',
      condition: 'Hypertension',
      nextAppointment: '2025-01-22',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@email.com',
    },
    {
      id: 'P002',
      name: 'Jane Smith',
      age: 28,
      lastVisit: '2025-01-12',
      status: 'Follow-up Required',
      condition: 'Diabetes Type 2',
      nextAppointment: '2025-01-19',
      phone: '+1 (555) 234-5678',
      email: 'jane.smith@email.com',
    },
    {
      id: 'P003',
      name: 'Mike Johnson',
      age: 42,
      lastVisit: '2025-01-10',
      status: 'Completed',
      condition: 'Broken Arm',
      nextAppointment: 'None',
      phone: '+1 (555) 345-6789',
      email: 'mike.johnson@email.com',
    },
  ]);

  const [reports] = useState<Report[]>([
    { id: 'R001', patient: 'John Doe', type: 'Lab Results', date: '2025-01-15', status: 'pending' },
    { id: 'R002', patient: 'Jane Smith', type: 'X-Ray Report', date: '2025-01-12', status: 'submitted' },
    { id: 'R003', patient: 'Mike Johnson', type: 'Treatment Summary', date: '2025-01-10', status: 'approved' },
  ]);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  const handleScheduleAppointment = (patientId: string) => {
    window.alert(`Scheduling appointment for patient ${patientId}...`);
  };

  const handleCallPatient = (phone: string) => {
    // Prefer native dialer if available
    window.location.href = `tel:${phone}`;
  };

  const handleEmailPatient = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-xs text-green-600 font-medium">+3 this week</p>
            </div>
            <Users className="w-8 h-8 text-teal-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reports Submitted</p>
              <p className="text-2xl font-bold text-teal-600">15</p>
              <p className="text-xs text-teal-600 font-medium">5 pending review</p>
            </div>
            <FileText className="w-8 h-8 text-teal-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Appointments Today</p>
              <p className="text-2xl font-bold text-blue-600">6</p>
              <p className="text-xs text-blue-600 font-medium">2 completed</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Claims</p>
              <p className="text-2xl font-bold text-orange-600">8</p>
              <p className="text-xs text-orange-600 font-medium">Awaiting reports</p>
            </div>
            <Activity className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/doctor/patients')}
              className="flex items-center space-x-3 p-6 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl hover:from-teal-100 hover:to-teal-200 transition-all duration-300 group border border-teal-200"
            >
              <div className="p-3 bg-teal-600 rounded-lg group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-teal-700 block">Add New Patient</span>
                <span className="text-sm text-teal-600">Register new patient</span>
              </div>
            </button>
            <button
              onClick={() => window.alert('Opening appointment scheduler...')}
              className="flex items-center space-x-3 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group border border-blue-200"
            >
              <div className="p-3 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-blue-700 block">Schedule Appointment</span>
                <span className="text-sm text-blue-600">Book patient visit</span>
              </div>
            </button>
            <button
              onClick={() => window.alert('Opening emergency protocols...')}
              className="flex items-center space-x-3 p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-xl hover:from-red-100 hover:to-red-200 transition-all duration-300 group border border-red-200"
            >
              <div className="p-3 bg-red-600 rounded-lg group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-red-700 block">Emergency Protocol</span>
                <span className="text-sm text-red-600">Quick access tools</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Patients</h2>
            <button
              onClick={() => window.alert('Opening full patient list...')}
              className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center space-x-1"
            >
              <span>View All</span>
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">
                      ID: {patient.id} • Age: {patient.age} • {patient.condition}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Last Visit: {patient.lastVisit}</p>
                    <p className="text-sm font-medium text-teal-600">{patient.status}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCallPatient(patient.phone)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Call patient"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEmailPatient(patient.email)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Email patient"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewPatient(patient)}
                      className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
            <button
              onClick={() => window.alert('Opening reports management...')}
              className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center space-x-1"
            >
              <span>Manage All</span>
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-semibold text-gray-900">{report.type}</p>
                  <p className="text-sm text-gray-600">
                    Patient: {report.patient} • {report.date}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      report.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : report.status === 'submitted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {report.status}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.alert(`Viewing report ${report.id}...`)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View report"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.alert(`Downloading report ${report.id}...`)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {report.status === 'pending' && (
                      <button
                        onClick={() => window.alert(`Editing report ${report.id}...`)}
                        className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit report"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Details Modal */}
      {showPatientDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Patient Details - {selectedPatient.name}
                </h3>
                <button
                  onClick={() => setShowPatientDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Patient Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">ID:</span> {selectedPatient.id}
                    </p>
                    <p>
                      <span className="font-medium">Age:</span> {selectedPatient.age}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span> {selectedPatient.phone}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedPatient.email}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Medical Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Condition:</span> {selectedPatient.condition}
                    </p>
                    <p>
                      <span className="font-medium">Last Visit:</span> {selectedPatient.lastVisit}
                    </p>
                    <p>
                      <span className="font-medium">Next Appointment:</span> {selectedPatient.nextAppointment}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> {selectedPatient.status}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleCallPatient(selectedPatient.phone)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </button>
                <button
                  onClick={() => handleEmailPatient(selectedPatient.email)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
                <button
                  onClick={() => handleScheduleAppointment(selectedPatient.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================
   Patient Management
   ========================= */
const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'P001',
      name: 'John Doe',
      age: 35,
      lastVisit: '2025-01-15',
      status: 'Active Treatment',
      condition: 'Hypertension',
      nextAppointment: '2025-01-22',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@email.com',
      insuranceId: 'INS123456',
    },
    {
      id: 'P002',
      name: 'Jane Smith',
      age: 28,
      lastVisit: '2025-01-12',
      status: 'Follow-up Required',
      condition: 'Diabetes Type 2',
      nextAppointment: '2025-01-19',
      phone: '+1 (555) 234-5678',
      email: 'jane.smith@email.com',
      insuranceId: 'INS234567',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddPatient, setShowAddPatient] = useState<boolean>(false);
  const [newPatient, setNewPatient] = useState<{
    name: string;
    age: string;
    phone: string;
    email: string;
    condition: string;
    insuranceId: string;
  }>({
    name: '',
    age: '',
    phone: '',
    email: '',
    condition: '',
    insuranceId: '',
  });

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(newPatient.age, 10);
    const nextIdNum = patients.reduce((max, p) => {
      const n = parseInt(p.id.replace(/\D/g, ''), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);

    const patient: Patient = {
      id: `P${String(nextIdNum + 1).padStart(3, '0')}`,
      name: newPatient.name.trim(),
      age: Number.isNaN(ageNum) ? 0 : ageNum,
      phone: newPatient.phone.trim(),
      email: newPatient.email.trim(),
      insuranceId: newPatient.insuranceId.trim() || undefined,
      condition: newPatient.condition.trim() || 'Not specified',
      lastVisit: new Date().toISOString().split('T')[0],
      status: 'New Patient',
      nextAppointment: 'To be scheduled',
    };

    setPatients((prev) => [...prev, patient]);
    setNewPatient({ name: '', age: '', phone: '', email: '', condition: '', insuranceId: '' });
    setShowAddPatient(false);
    window.alert('Patient added successfully!');
  };

  const handleDeletePatient = (patientId: string) => {
    if (window.confirm('Are you sure you want to remove this patient?')) {
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
      window.alert('Patient removed successfully!');
    }
  };

  const handleScheduleAppointment = (patientId: string) => {
    window.alert(`Scheduling appointment for patient ${patientId}...`);
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
              placeholder="Search patients by name, ID, or condition..."
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
          <h2 className="text-xl font-semibold text-gray-900">Patient Management ({filteredPatients.length})</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-6">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          patient.status === 'Active Treatment'
                            ? 'bg-green-100 text-green-800'
                            : patient.status === 'Follow-up Required'
                            ? 'bg-yellow-100 text-yellow-800'
                            : patient.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {patient.status}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      Patient ID: {patient.id} • Age: {patient.age}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium text-gray-700">Insurance ID:</span>{' '}
                      {patient.insuranceId || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Last Visit:</span> {patient.lastVisit}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Phone:</span> {patient.phone}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium text-gray-700">Condition:</span> {patient.condition}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Next Appointment:</span>{' '}
                      {patient.nextAppointment}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Email:</span> {patient.email}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => window.alert(`Viewing medical history for ${patient.name}...`)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View History
                  </button>
                  <button
                    onClick={() => window.alert(`Creating report for ${patient.name}...`)}
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-teal-50 transition-colors"
                  >
                    Submit Report
                  </button>
                  <button
                    onClick={() => handleScheduleAppointment(patient.id)}
                    className="text-green-600 hover:text-green-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Schedule
                  </button>
                  <button
                    onClick={() => handleDeletePatient(patient.id)}
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
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance ID</label>
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
                    value={newPatient.condition}
                    onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
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
   Submit Report
   ========================= */
const SubmitReport: React.FC = () => {
  const [formData, setFormData] = useState<ReportForm>({
    patientId: '',
    reportType: '',
    diagnosis: '',
    treatment: '',
    recommendations: '',
    followUpDate: '',
    medications: '',
    labResults: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

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
    }, 3000);
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
              Report ID:{' '}
              <span className="font-mono font-bold text-teal-600">R{Date.now().toString().slice(-6)}</span>
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
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID *</label>
              <input
                type="text"
                placeholder="Enter patient ID"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type *</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.reportType}
                onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                required
              >
                <option value="">Select report type</option>
                <option value="consultation">Consultation Report</option>
                <option value="lab">Laboratory Results</option>
                <option value="xray">X-Ray Report</option>
                <option value="surgery">Surgery Report</option>
                <option value="discharge">Discharge Summary</option>
                <option value="emergency">Emergency Report</option>
              </select>
            </div>
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
              onClick={saveDraft}
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
   Appointments
   ========================= */
const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'A001',
      patient: 'John Doe',
      time: '09:00 AM',
      date: '2025-01-20',
      type: 'Follow-up',
      status: 'confirmed',
      duration: '30 min',
    },
    {
      id: 'A002',
      patient: 'Jane Smith',
      time: '10:30 AM',
      date: '2025-01-20',
      type: 'Consultation',
      status: 'pending',
      duration: '45 min',
    },
    {
      id: 'A003',
      patient: 'Mike Johnson',
      time: '02:00 PM',
      date: '2025-01-20',
      type: 'Check-up',
      status: 'completed',
      duration: '30 min',
    },
  ]);

  const handleConfirmAppointment = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: 'confirmed' } : apt)),
    );
    window.alert(`Appointment ${appointmentId} confirmed!`);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
      window.alert(`Appointment ${appointmentId} cancelled!`);
    }
  };

  const handleReschedule = (appointmentId: string) => {
    window.alert(`Opening reschedule dialog for appointment ${appointmentId}...`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
            <button
              onClick={() => window.alert('Opening appointment scheduler...')}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{appointment.patient}</h3>
                    <p className="text-gray-600">
                      {appointment.type} • {appointment.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{appointment.time}</p>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => handleConfirmAppointment(appointment.id)}
                      className="text-green-600 hover:text-green-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Confirm
                    </button>
                  )}
                  <button
                    onClick={() => handleReschedule(appointment.id)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="text-center text-gray-600 py-12">No appointments scheduled.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================
   Portal Shell
   ========================= */
const DoctorPortal: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/doctor' },
    { icon: <Users className="w-5 h-5" />, label: 'Patients', path: '/doctor/patients' },
    { icon: <FileText className="w-5 h-5" />, label: 'Submit Report', path: '/doctor/submit' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Appointments', path: '/doctor/appointments' },
  ];

  return (
    <PortalLayout title="Doctor Portal" menuItems={menuItems} currentPath={location.pathname} headerColor="bg-teal-600">
      <Routes>
        <Route path="/" element={<DoctorDashboard />} />
        <Route path="/patients" element={<PatientManagement />} />
        <Route path="/submit" element={<SubmitReport />} />
        <Route path="/appointments" element={<Appointments />} />
      </Routes>
    </PortalLayout>
  );
};

export default DoctorPortal;
