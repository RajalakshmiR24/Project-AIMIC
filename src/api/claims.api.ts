// src/api/claims.api.ts
import { axiosInstance } from "./axiosInstance";

export interface ClaimAttachment {
  fileName: string;
  fileType: string;
  fileBase64: string;
}

export interface ClaimPayload {
  patientId: string;
  insuranceId?: string;
  medicalReportId?: string;

  billedAmount: number;
  approvedAmount?: number;

  notes?: string;
  attachments?: ClaimAttachment[];
}

export interface Claim {
  _id?: string;
  patientId: any;
  insuranceId: any;
  medicalReportId: any;

  claimNumber?: string;
  claimStatus?: "Pending" | "Submitted" | "Rejected" | "Approved";

  billedAmount: number;
  approvedAmount?: number;

  submittedBy?: any;
  submittedDate?: string;

  notes?: string;
  attachments?: ClaimAttachment[];

  createdAt?: string;
  updatedAt?: string;
}

export const claimsApi = {
  async createClaim(data: ClaimPayload): Promise<Claim> {
    const res = await axiosInstance.post("/api/claims", data);
    return res.data.data;
  },

  async getAllClaims(): Promise<Claim[]> {
    const res = await axiosInstance.get("/api/claims");
    return res.data.data;
  },

  async getClaimById(id: string): Promise<Claim> {
    const res = await axiosInstance.get(`/api/claims/${id}`);
    return res.data.data;
  },

  async updateClaim(id: string, data: Partial<Claim>): Promise<Claim> {
    const res = await axiosInstance.put(`/api/claims/${id}`, data);
    return res.data.data;
  },

  async deleteClaim(id: string) {
    return axiosInstance.delete(`/api/claims/${id}`);
  },
};
