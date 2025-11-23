import { axiosInstance } from "./axiosInstance";
import { Claim, Patient } from "./types";

export const employeeApi = {
  /* -----------------------------------------------------
     GET EMPLOYEE DETAILS (includes managedClaims)
  ----------------------------------------------------- */
  async getEmployee(id: string) {
    const res = await axiosInstance.get(`/api/employees/${id}`);
    return res.data.data;
  },

  /* -----------------------------------------------------
     GET MY CLAIMS (from user’s employee profile)
  ----------------------------------------------------- */
  async getMyClaims(employeeId: string): Promise<Claim[]> {
    const res = await axiosInstance.get(`/api/employees/${employeeId}`);
    return res.data.data?.managedClaims || [];
  },

  /* -----------------------------------------------------
     ASSIGN A CLAIM TO EMPLOYEE
  ----------------------------------------------------- */
  async addManagedClaim(employeeId: string, claimId: string) {
    const res = await axiosInstance.post(
      `/api/employees/${employeeId}/manage-claim`,
      { claimId }
    );
    return res.data.data;
  },

  /* -----------------------------------------------------
     SUBMIT CLAIM (unchanged if backend kept it)
  ----------------------------------------------------- */
  async submitClaim(data: any): Promise<Claim> {
    const res = await axiosInstance.post(`/api/claims/submit`, data);
    return res.data.data;
  },

  /* -----------------------------------------------------
     DOCUMENT UPLOAD
  ----------------------------------------------------- */
  async uploadDocument(employeeId: string, payload: any) {
    const res = await axiosInstance.post(
      `/api/employees/${employeeId}/add-document`,
      payload
    );
    return res.data.data;
  },

  /* -----------------------------------------------------
     GET PATIENT BY EMAIL
  ----------------------------------------------------- */
  async getPatientByEmail(email: string): Promise<Patient> {
    const res = await axiosInstance.get(`/api/patients/email/search`, {
      params: { email },
    });
    return res.data.data;
  },
};
