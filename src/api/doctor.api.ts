// src/api/doctor.api.ts
import { axiosInstance } from "./axiosInstance";
import {
  Patient,
  MedicalReport,
  ReportFile,
  ProcedureCode,
} from "./types";

export const doctorApi = {
  /* ---------------- PATIENTS ---------------- */

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

  async searchPatients(keyword: string): Promise<Patient[]> {
    const res = await axiosInstance.get(
      `/api/patients/search/${encodeURIComponent(keyword)}`
    );
    return res.data.data;
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    const res = await axiosInstance.put(`/api/patients/${id}`, data);
    return res.data.data;
  },

  async deletePatient(id: string) {
    return await axiosInstance.delete(`/api/patients/${id}`);
  },

  async updatePatientStatus(id: string, status: Patient["status"]) {
    const res = await axiosInstance.put(`/api/patients/status/${id}`, {
      status,
    });
    return res.data.data;
  },

  async updatePatientNextAppointment(id: string, nextAppointment: string | null) {
    const res = await axiosInstance.put(`/api/patients/appointment/${id}`, {
      nextAppointment,
    });
    return res.data.data;
  },

  async updatePatientLastVisit(id: string, lastVisit: string | null) {
    const res = await axiosInstance.put(`/api/patients/last-visit/${id}`, {
      lastVisit,
    });
    return res.data.data;
  },

  async updatePatientDiagnosis(id: string, codes: string[]) {
    const res = await axiosInstance.put(`/api/patients/diagnosis/${id}`, {
      codes,
    });
    return res.data.data;
  },

  async updatePatientInsurance(id: string, data: Partial<Patient>) {
    const res = await axiosInstance.put(`/api/patients/insurance/${id}`, data);
    return res.data.data;
  },

  /* ---------------- REPORTS ---------------- */

  async createReport(data: MedicalReport): Promise<MedicalReport> {
    const res = await axiosInstance.post("/api/reports", data);
    return res.data.data;
  },

  async getAllReports(): Promise<MedicalReport[]> {
    const res = await axiosInstance.get("/api/reports");
    return res.data.data;
  },

  async getReportsByPatient(patientId: string): Promise<MedicalReport[]> {
    const res = await axiosInstance.get(`/api/reports/patient/${patientId}`);
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

  async deleteReport(id: string) {
    return await axiosInstance.delete(`/api/reports/${id}`);
  },

  async searchReports(q: string): Promise<MedicalReport[]> {
    const res = await axiosInstance.get(`/api/reports/search/${encodeURIComponent(q)}`);
    return res.data.data;
  },

  async addReportFiles(reportId: string, files: ReportFile[]) {
    const res = await axiosInstance.put(`/api/reports/files/${reportId}`, {
      files,
    });
    return res.data.data;
  },

  async deleteReportFile(reportId: string, fileId: string) {
    const res = await axiosInstance.delete(
      `/api/reports/files/${reportId}/${fileId}`
    );
    return res.data.data;
  },

  async addProcedure(reportId: string, procedure: ProcedureCode) {
    const res = await axiosInstance.post(`/api/reports/procedure/${reportId}`, procedure);
    return res.data.data;
  },

  async updateServiceDates(reportId: string, from?: string | null, to?: string | null) {
    const res = await axiosInstance.put(`/api/reports/service-dates/${reportId}`, {
      from,
      to,
    });
    return res.data.data;
  },
    async getPatientByEmail(email: string): Promise<Patient> {
    const res = await axiosInstance.get(`/api/patients/email/search`, {
      params: { email },
    });
    return res.data.data;
  },

  async addReferringProvider(reportId: string, name?: string, npi?: string) {
    const res = await axiosInstance.put(`/api/reports/ref-provider/${reportId}`, {
      name,
      npi,
    });
    return res.data.data;
  },
};
