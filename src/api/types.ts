// src/api/types.ts
export type Role = "employee" | "doctor" | "insurance";

/* ------------------ AUTH ------------------ */
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
  sex?: string | undefined;
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
