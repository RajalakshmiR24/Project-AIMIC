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

/* ------------------ CLAIMS TYPES ------------------ */
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
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ------------------ MEDICAL REPORT TYPES ------------------ */
export interface MedicalReport {
  _id?: string;
  patientId: string;
  reportType: string;
  primaryDiagnosis: string;
  treatmentProvided: string;
  createdBy?: string;
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
  /** ------------------ AUTH SECTION ------------------ **/
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

  /** ------------------ CLAIMS SECTION ------------------ **/
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

  /** ------------------ DOCTOR SECTION ------------------ **/

  /** 👨‍⚕️ PATIENTS */
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

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    const res = await axiosInstance.put(`/api/patients/${id}`, data);
    return res.data.data;
  },

  async deletePatient(id: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(`/api/patients/${id}`);
    return res.data;
  },

  /** 📋 MEDICAL REPORTS */
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

  async updateReport(id: string, data: Partial<MedicalReport>): Promise<MedicalReport> {
    const res = await axiosInstance.put(`/api/reports/${id}`, data);
    return res.data.data;
  },

  async deleteReport(id: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(`/api/reports/${id}`);
    return res.data;
  },
};
