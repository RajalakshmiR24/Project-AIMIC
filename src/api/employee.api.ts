import { axiosInstance } from "./axiosInstance";
import { Claim, Patient, ReadyForClaimItem } from "./types";

export const employeeApi = {
  async getPatientsReadyForClaim(): Promise<ReadyForClaimItem[]> {
    const res = await axiosInstance.get("/api/employee/patients/ready-for-claim");
    return res.data.data;
  },

  async createClaim(data: any): Promise<Claim> {
    const res = await axiosInstance.post("/api/employee/claims/create", data);
    return res.data.data;
  },

  async getAllClaims(): Promise<Claim[]> {
    const res = await axiosInstance.get("/api/employee/claims/all");
    return res.data.data;
  },

  async reviewClaim(id: string, payload: any): Promise<Claim> {
    const res = await axiosInstance.post(`/api/employee/claims/${id}/review`, payload);
    return res.data.data;
  },

  async getPatientByEmail(email: string): Promise<Patient | null> {
    const res = await axiosInstance.get(`/api/employee/patient/email/${email}`);
    return res.data.data;
  },

  async updatePatientStatus(id: string, payload: any): Promise<Patient> {
    const res = await axiosInstance.patch(`/api/patients/${id}/status`, payload);
    return res.data.data;
  }
};
