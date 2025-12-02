// src/api/hospital.api.ts
import { axiosInstance } from "./axiosInstance";
import {
  Patient,
  MedicalReport,
  ProcedureCode,
  HospitalProvider,
  PreAuthorization,
} from "./types";

export const hospitalApi = {
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

  async updatePatientStatus(id: string, payload: any): Promise<Patient> {
    const res = await axiosInstance.patch(`/api/patients/${id}/status`, payload);
    return res.data.data;
  },

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

  async updateReport(
    id: string,
    data: Partial<MedicalReport>
  ): Promise<MedicalReport> {
    const res = await axiosInstance.put(`/api/reports/${id}`, data);
    return res.data.data;
  },

  async deleteReport(id: string) {
    return await axiosInstance.delete(`/api/reports/${id}`);
  },

  async searchReports(q: string): Promise<MedicalReport[]> {
    const res = await axiosInstance.get(
      `/api/reports/search/${encodeURIComponent(q)}`
    );
    return res.data.data;
  },

  async addProcedure(reportId: string, procedure: ProcedureCode) {
    const res = await axiosInstance.post(
      `/api/reports/procedure/${reportId}`,
      procedure
    );
    return res.data.data;
  },

  async updateServiceDates(
    reportId: string,
    from?: string | null,
    to?: string | null
  ) {
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
    const res = await axiosInstance.put(`/api/reports/referring/${reportId}`, {
      referringProviderName: name,
      referringProviderNPI: npi,
    });
    return res.data.data;
  },

  async getAllHospitalProviders(): Promise<HospitalProvider[]> {
    const res = await axiosInstance.get("/api/reports/hospital-providers/all");
    return res.data.data;
  },

  async getAllPreAuthorizations(): Promise<PreAuthorization[]> {
    const res = await axiosInstance.get("/api/reports/pre-authorizations/all");
    return res.data.data;
  },
};
