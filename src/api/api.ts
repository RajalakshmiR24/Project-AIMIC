// src/api/api.ts
import { axiosInstance } from "./axiosInstance";

export type Role = "employee" | "doctor" | "insurance";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/* ------------------ CLAIM TYPES ------------------ */
export interface Claim {
  _id?: string;
  claimNumber: string;
  employeeName: string;
  type: string;
  amount: number;
  priority: "urgent" | "high" | "low";
  riskLevel: "high" | "medium" | "low";
  aiScore: number;
  submittedDate: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  rejectionReason?: string;
  paymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ------------------ PATIENT TYPES ------------------ */
export interface Patient {

  _id?: string;
  fullName: string;
  age?: number;
  dateOfBirth?: string | null;
  birthDate?: string | null;
  sex?: string | undefined
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  maritalStatus?: string;
  insuredIdNumber?: string;
  patientRelationship?: "Self" | "Spouse" | "Child" | "Other";
  insuredName?: string;
  insuredAddressLine1?: string;
  insuredAddressLine2?: string;
  insuredCity?: string;
  insuredState?: string;
  insuredZipCode?: string;
  insuredPhone?: string;
  insuranceId?: string;
  insuredOtherInsurance?: string;
  insurancePlanName?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  patientSignatureOnFile?: boolean;
  insuredSignatureOnFile?: boolean;
  conditionEmployment?: boolean;
  conditionAutoAccident?: boolean;
  conditionAutoAccidentState?: string;
  conditionOtherAccident?: boolean;
  otherInsuredName?: string;
  otherInsuredPolicyNumber?: string;
  otherInsuredGroupNumber?: string;
  otherInsuredDateOfBirth?: string | null;
  otherInsuredSex?: "M" | "F" | "U";
  otherInsuredEmployer?: string;
  otherInsuredInsurancePlanName?: string;
  dateCurrentIllness?: string | null;
  otherDate?: string | null;
  referringPhysician?: string;
  referringPhysicianNPI?: string;
  additionalClaimInfo?: string;
  diagnosisCodes?: string[];
  hospitalizationFrom?: string | null;
  hospitalizationTo?: string | null;
  resubmissionCode?: string;
  originalRefNumber?: string;
  priorAuthorizationNumber?: string;
  federalTaxId?: string;
  patientAccountNumber?: string;
  acceptAssignment?: boolean;
  totalCharge?: number;
  amountPaid?: number;
  billingProviderInfo?: string;
  billingProviderNPI?: string;
  primaryCondition?: string;
  secondaryCondition?: string;
  tertiaryCondition?: string;
  lastVisit?: string | null;
  nextAppointment?: string | null;
  status?: "Active Treatment" | "Follow-up Required" | "Discharged" | string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ------------------ MEDICAL REPORT TYPES ------------------ */
export interface ReportFile {
  _id?: string;
  fileName: string;
  fileType: string;
  base64Data: string;
  createdAt?: string;
}

export interface ProcedureCode {
  cpt: string;
  modifier?: string;
  diagnosisPointers?: string[];
  charges?: number;
  units?: number;
}

export interface MedicalReport {
  _id?: string;
  patientId: string | Patient;
  reportType: string;
  primaryDiagnosis: string;
  secondaryDiagnosis?: string[];
  treatmentProvided: string;
  medicationsPrescribed?: string;
  labResults?: string;
  recommendations?: string;
  followUpDate?: string | null;
  createdBy?: string | { _id?: string; name?: string; email?: string };
  reportFiles?: ReportFile[];
  procedureCodes?: ProcedureCode[];
  serviceDateFrom?: string | null;
  serviceDateTo?: string | null;
  referringProviderName?: string;
  referringProviderNPI?: string;
  status?: "Submitted" | "Draft" | string;
  createdAt?: string;
  updatedAt?: string;
}

/* ------------------ INSURANCE TYPES ------------------ */
export interface Insurance {
  _id?: string;
  patientId: string | Patient;
  insuranceProvider: string;
  planName?: string;
  policyNumber?: string;
  groupNumber?: string;
  insuredName?: string;
  insuredIdNumber?: string;
  insuredDateOfBirth?: string | null;
  insuredSex?: "M" | "F" | "U";
  insuredRelationship?: "Self" | "Spouse" | "Child" | "Other";
  insuredAddressLine1?: string;
  insuredAddressLine2?: string;
  insuredCity?: string;
  insuredState?: string;
  insuredZipCode?: string;
  insuredPhone?: string;
  otherInsuranceExists?: boolean;
  otherInsuranceName?: string;
  otherInsurancePolicyNumber?: string;
  otherInsuranceGroupNumber?: string;
  employmentRelated?: boolean;
  autoAccident?: boolean;
  autoAccidentState?: string;
  otherAccident?: boolean;
  priorAuthorizationNumber?: string;
  outsideLab?: boolean;
  outsideLabCharges?: number;
  hospitalizationFrom?: string | null;
  hospitalizationTo?: string | null;
  insuranceCardFrontBase64?: string;
  insuranceCardBackBase64?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ------------------ TOKEN HANDLING ------------------ */
const STORAGE_TOKEN = "token";

function setAuthHeader(token?: string | null) {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
}

setAuthHeader(localStorage.getItem(STORAGE_TOKEN));

/* =====================================================
   API SERVICE
===================================================== */
export const api = {
  /** ------------------ AUTH ------------------ **/
  async login(credentials: LoginCredentials): Promise<any> {
    const res = await axiosInstance.post("/api/auth/login", credentials);
    const token =
      res.data?.token ||
      res.data?.accessToken ||
      res.data?.jwt ||
      res.data?.id_token ||
      res.data?.data?.token ||
      res.data?.data?.accessToken;
    if (token) {
      localStorage.setItem(STORAGE_TOKEN, token);
      setAuthHeader(token);
    }
    return res.data;
  },

  async register(data: RegisterData): Promise<any> {
    const res = await axiosInstance.post("/api/auth/register", data);
    const token =
      res.data?.token ||
      res.data?.accessToken ||
      res.data?.jwt ||
      res.data?.id_token ||
      res.data?.data?.token ||
      res.data?.data?.accessToken;
    if (token) {
      localStorage.setItem(STORAGE_TOKEN, token);
      setAuthHeader(token);
    }
    return res.data;
  },

  async me(): Promise<{ user: User }> {
    const res = await axiosInstance.get("/api/auth/me");
    return res.data;
  },

  /** ------------------ CLAIMS ------------------ **/
  async getAllClaims(): Promise<Claim[]> {
    const res = await axiosInstance.get("/api/claims");
    return res.data;
  },

  async getClaimById(id: string): Promise<Claim> {
    const res = await axiosInstance.get(`/api/claims/${id}`);
    return res.data;
  },

  async approveClaim(id: string): Promise<{ message: string }> {
    const res = await axiosInstance.patch(`/api/claims/${id}/approve`);
    return res.data;
  },

  async rejectClaim(id: string, reason: string): Promise<{ message: string }> {
    const res = await axiosInstance.patch(`/api/claims/${id}/reject`, { reason });
    return res.data;
  },

  async requestMoreInfo(id: string, message: string): Promise<{ message: string }> {
    const res = await axiosInstance.post(`/api/claims/${id}/request-info`, { message });
    return res.data;
  },

  async getApprovedClaims(): Promise<Claim[]> {
    const res = await axiosInstance.get("/api/claims/approved");
    return res.data;
  },

  async getAnalytics(): Promise<any> {
    const res = await axiosInstance.get("/api/claims/analytics");
    return res.data;
  },

  /** ------------------ PATIENTS ------------------ **/
  async addPatient(data: Patient): Promise<Patient> {
    const res = await axiosInstance.post("/api/patients", data);
    return res.data.data;
  },

  async getAllPatients(): Promise<Patient[]> {
    const res = await axiosInstance.get("/api/patients");
    return res.data.data;
  },

  async getPatientById(id: string): Promise<Patient> {
    const res = await axiosInstance.get(`/api/patients/${id}`);
    return res.data.data;
  },

  async getPatientByEmail(email: string): Promise<Patient> {
    const res = await axiosInstance.get(`/api/patients/email/search`, { params: { email } });
    return res.data.data;
  },

  async searchPatients(keyword: string): Promise<Patient[]> {
    const res = await axiosInstance.get(`/api/patients/search/${encodeURIComponent(keyword)}`);
    return res.data.data;
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    const res = await axiosInstance.put(`/api/patients/${id}`, data);
    return res.data.data;
  },

  async updatePatientStatus(id: string, status: Patient["status"]): Promise<Patient> {
    const res = await axiosInstance.put(`/api/patients/status/${id}`, { status });
    return res.data.data;
  },

  async updatePatientNextAppointment(id: string, nextAppointment: string | null): Promise<Patient> {
    const res = await axiosInstance.put(`/api/patients/next-appointment/${id}`, { nextAppointment });
    return res.data.data;
  },

  async updatePatientLastVisit(id: string, lastVisit: string | null): Promise<Patient> {
    const res = await axiosInstance.put(`/api/patients/last-visit/${id}`, { lastVisit });
    return res.data.data;
  },

  async updatePatientDiagnosis(id: string, diagnosisCodes: string[]): Promise<Patient> {
    const res = await axiosInstance.put(`/api/patients/diagnosis/${id}`, { diagnosisCodes });
    return res.data.data;
  },

  async updatePatientInsurance(id: string, insuranceFields: Partial<Patient>): Promise<Patient> {
    const res = await axiosInstance.put(`/api/patients/insurance/${id}`, insuranceFields);
    return res.data.data;
  },

  async deletePatient(id: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(`/api/patients/${id}`);
    return res.data;
  },

  /** ------------------ MEDICAL REPORTS ------------------ **/
  async createReport(data: MedicalReport): Promise<MedicalReport> {
    const res = await axiosInstance.post("/api/reports", data);
    return res.data.data;
  },

  async getAllReports(): Promise<MedicalReport[]> {
    const res = await axiosInstance.get("/api/reports");
    return res.data.data;
  },

  async getReportById(id: string): Promise<MedicalReport> {
    const res = await axiosInstance.get(`/api/reports/${id}`);
    return res.data.data;
  },

  async getReportsByPatient(patientId: string): Promise<MedicalReport[]> {
    const res = await axiosInstance.get(`/api/reports/patient/${patientId}`);
    return res.data.data;
  },

  async searchReports(keyword: string): Promise<MedicalReport[]> {
    const res = await axiosInstance.get(`/api/reports/search/${encodeURIComponent(keyword)}`);
    return res.data.data;
  },

  async updateReport(id: string, data: Partial<MedicalReport>): Promise<MedicalReport> {
    const res = await axiosInstance.put(`/api/reports/${id}`, data);
    return res.data.data;
  },

  async updateReportStatus(id: string, status: MedicalReport["status"]): Promise<MedicalReport> {
    const res = await axiosInstance.put(`/api/reports/status/${id}`, { status });
    return res.data.data;
  },

  async addReportFiles(reportId: string, files: ReportFile[]): Promise<MedicalReport> {
    const res = await axiosInstance.put(`/api/reports/files/${reportId}`, { files });
    return res.data.data;
  },

  async deleteReportFile(reportId: string, fileId: string): Promise<MedicalReport> {
    const res = await axiosInstance.delete(`/api/reports/file/${reportId}/${fileId}`);
    return res.data.data;
  },

  async addProcedure(reportId: string, procedure: ProcedureCode): Promise<MedicalReport> {
    const res = await axiosInstance.post(`/api/reports/procedure/${reportId}`, procedure);
    return res.data.data;
  },

  async updateServiceDates(reportId: string, from?: string | null, to?: string | null): Promise<MedicalReport> {
    const body: any = {};
    if (from !== undefined) body.serviceDateFrom = from;
    if (to !== undefined) body.serviceDateTo = to;
    const res = await axiosInstance.put(`/api/reports/service-dates/${reportId}`, body);
    return res.data.data;
  },

  async addReferringProvider(reportId: string, name?: string, npi?: string): Promise<MedicalReport> {
    const body: any = {};
    if (name !== undefined) body.referringProviderName = name;
    if (npi !== undefined) body.referringProviderNPI = npi;
    const res = await axiosInstance.put(`/api/reports/referring/${reportId}`, body);
    return res.data.data;
  },

  async deleteReport(id: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(`/api/reports/${id}`);
    return res.data;
  },

  /** ------------------ INSURANCE ------------------ **/
  async addInsurance(data: Insurance): Promise<Insurance> {
    const res = await axiosInstance.post("/api/insurance", data);
    return res.data.data;
  },

  async getAllInsurance(): Promise<Insurance[]> {
    const res = await axiosInstance.get("/api/insurance");
    return res.data.data;
  },

  async getInsuranceById(id: string): Promise<Insurance> {
    const res = await axiosInstance.get(`/api/insurance/${id}`);
    return res.data.data;
  },

  async getInsuranceByPatientId(patientId: string): Promise<Insurance> {
    const res = await axiosInstance.get(`/api/insurance/patient/${patientId}`);
    return res.data.data;
  },

  async searchInsurance(keyword: string): Promise<Insurance[]> {
    const res = await axiosInstance.get(`/api/insurance/search`, { params: { keyword } });
    return res.data.data;
  },

  async updateInsurance(id: string, data: Partial<Insurance>): Promise<Insurance> {
    const res = await axiosInstance.put(`/api/insurance/${id}`, data);
    return res.data.data;
  },

  async updateInsuranceCardImages(id: string, frontBase64?: string, backBase64?: string): Promise<Insurance> {
    const body: any = {};
    if (frontBase64) body.insuranceCardFrontBase64 = frontBase64;
    if (backBase64) body.insuranceCardBackBase64 = backBase64;
    const res = await axiosInstance.put(`/api/insurance/card-images/${id}`, body);
    return res.data.data;
  },

  async updateAccidents(id: string, payload: {
    employmentRelated?: boolean;
    autoAccident?: boolean;
    autoAccidentState?: string;
    otherAccident?: boolean;
  }): Promise<Insurance> {
    const res = await axiosInstance.put(`/api/insurance/accidents/${id}`, payload);
    return res.data.data;
  },

  async updateHospitalization(id: string, from?: string | null, to?: string | null): Promise<Insurance> {
    const body: any = {};
    if (from !== undefined) body.hospitalizationFrom = from;
    if (to !== undefined) body.hospitalizationTo = to;
    const res = await axiosInstance.put(`/api/insurance/hospitalization/${id}`, body);
    return res.data.data;
  },

  async clearOtherInsurance(id: string): Promise<Insurance> {
    const res = await axiosInstance.put(`/api/insurance/clear-other/${id}`);
    return res.data.data;
  },

  async deleteInsurance(id: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(`/api/insurance/${id}`);
    return res.data;
  },
};
