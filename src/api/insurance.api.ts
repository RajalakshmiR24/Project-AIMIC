import { axiosInstance } from "./axiosInstance";
import { Insurance } from "./types";
import { Claim } from "./claims.api";

export const insuranceApi = {

  async getAllClaims(): Promise<Claim[]> {
    const res = await axiosInstance.get("/api/claims");
    return res.data.data ?? res.data;
  },

  async getClaimById(id: string): Promise<Claim> {
    const res = await axiosInstance.get(`/api/claims/${id}`);
    return res.data.data ?? res.data;
  },

  async approveClaim(id: string) {
    const res = await axiosInstance.patch(`/api/claims/${id}/approve`);
    return res.data;
  },

  async rejectClaim(id: string, reason: string) {
    const res = await axiosInstance.patch(`/api/claims/${id}/reject`, { reason });
    return res.data;
  },

  async requestMoreInfo(id: string, message: string) {
    const res = await axiosInstance.post(`/api/claims/${id}/request-info`, { message });
    return res.data;
  },

  async getApprovedClaims(): Promise<Claim[]> {
    const res = await axiosInstance.get("/api/claims/approved");
    return res.data.data ?? res.data;
  },

  /* ------------ ANALYTICS ------------ */

  async getAnalytics() {
    const res = await axiosInstance.get("/api/claims/analytics");
    return res.data;
  },

  /* ------------ INSURANCE CRUD ------------ */

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

  async updateInsurance(id: string, payload: Partial<Insurance>) {
    const res = await axiosInstance.put(`/api/insurance/${id}`, payload);
    return res.data.data;
  },

  async deleteInsurance(id: string) {
    const res = await axiosInstance.delete(`/api/insurance/${id}`);
    return res.data;
  },

  /* ------------ NEW BACKEND ROUTES ------------ */

  async getInsuranceByPatientId(patientId: string): Promise<Insurance[]> {
    const res = await axiosInstance.get(`/api/insurance/patient/${patientId}`);
    return res.data.data;
  },

  async searchInsurance(query: string): Promise<Insurance[]> {
    const res = await axiosInstance.get(`/api/insurance/search?q=${query}`);
    return res.data.data;
  },

  async updateCardImages(id: string, payload: Partial<Insurance>): Promise<Insurance> {
    const res = await axiosInstance.put(`/api/insurance/card-images/${id}`, payload);
    return res.data.data;
  },

  async updateAccidentInfo(id: string, payload: Partial<Insurance>): Promise<Insurance> {
    const res = await axiosInstance.put(`/api/insurance/accidents/${id}`, payload);
    return res.data.data;
  },

  async updateHospitalization(id: string, payload: Partial<Insurance>): Promise<Insurance> {
    const res = await axiosInstance.put(`/api/insurance/hospitalization/${id}`, payload);
    return res.data.data;
  },

  async clearOtherInsurance(id: string): Promise<Insurance> {
    const res = await axiosInstance.put(`/api/insurance/clear-other/${id}`);
    return res.data.data;
  }
};
