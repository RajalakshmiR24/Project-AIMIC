/* ------------------ ROLES ------------------ */
export type Role = "employee" | "hospital" | "insurance";

/* ------------------ AUTH TYPES ------------------ */
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

  // For hospital users:
  hospitalProviderData?: HospitalProvider[];
}

/* ------------------ HOSPITAL PROVIDER ------------------ */
export interface HospitalProvider {
  name: string;
  providerCode?: string;
  specialization?: string;
  isActive?: boolean;

  tiedUpInsurances: boolean;

  preAuthorizations?: Array<{
    authorizationNumber: string;
    patientId: string;
    insuranceId: string;

    procedureCodes?: Array<{
      cpt: string;
      units?: number;
      charges?: number;
    }>;

    diagnosisCodes?: string[];
    requestedAmount: number;
    approvedAmount?: number;

    status: "Pending" | "Approved" | "Rejected";
    rejectionReason?: string;
    authorizationDate?: string;
    validFrom?: string;
    validTo?: string;

    createdBy: string;
    notes?: string;
  }>;
}

/* ------------------ PATIENT TYPES ------------------ */
export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: "Male" | "Female" | "Other";
  dob?: Date;

  phone?: string;
  email?: string;

  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };

  medicalRecordNumber?: string;
  patientCode?: string;

  insurance?: string[]; // list of insurance ObjectIds

  metadata?: Record<string, any>;
  createdBy: string;

  createdAt?: string;
  updatedAt?: string;

  // frontend helper
  fullName?: string;
}

/* ------------------ MEDICAL REPORT TYPES ------------------ */
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

  serviceDateFrom?: string | null;
  serviceDateTo?: string | null;

  referringProviderName?: string;
  referringProviderNPI?: string;

  createdBy?: string | { _id?: string; name?: string; email?: string };
  status?: "Submitted" | "Draft";

  procedureCodes?: ProcedureCode[];

  /** UPDATED — backend format */
  pdfFiles?: Array<{
    filename: string;
    data: string; // base64
  }>;

  createdAt?: string;
  updatedAt?: string;
}


/* ------------------ INSURANCE TYPES ------------------ */

export type PlanType =
  | "HMO"
  | "PPO"
  | "EPO"
  | "POS"
  | "INDEMNITY"
  | "OTHER";

export type InsuranceStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "PENDING"
  | "CANCELLED";

export interface CoverageLimit {
  type: string;
  amount: number;
  currency?: string;
  notes?: string;
}

export interface PolicyHolder {
  firstName: string;
  lastName: string;
  dob?: string;
  relationToPatient?: string;
  memberId?: string;
}

export interface InsuranceDocument {
  name: string;
  url: string;
  uploadedAt?: string;
  providerDocumentId?: string;
}

export interface Insurance {
  _id?: string;

  insuranceId: string; // your backend sample uses this
  patientId: Patient;  // *** IMPORTANT: single patient object ***

  policyHolder?: PolicyHolder;

  insuranceProvider: string;
  planName?: string;
  planType?: PlanType;
  policyNumber: string;
  groupNumber?: string;

  effectiveDate?: string;
  expirationDate?: string;

  status: InsuranceStatus;

  phone?: string;
  phoneExtension?: string;

  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  billingContact?: {
    name?: string;
    email?: string;
    phone?: string;
  };

  primaryInsured?: boolean;

  coverageLimits?: CoverageLimit[];

  benefitsSummary?: {
    deductible?: number;
    outOfPocketMax?: number;
    coinsurance?: number;
    copay?: number;
    currency?: string;
  };

  documents?: InsuranceDocument[];

  metadata?: Record<string, any>;

  createdAt?: string;
  updatedAt?: string;
}

/* ------------------ CLAIM TYPES (NEW SCHEMA) ------------------ */
export interface Claim {
  _id?: string;

  patientId: string;
  insuranceId: string;
  medicalReportId: string;

  claimNumber: string;
  claimStatus: "Pending" | "Submitted" | "Rejected" | "Approved";

  billedAmount: number;
  approvedAmount?: number;

  submittedBy: string;
  submittedDate?: string;

  notes?: string;

  createdAt?: string;
  updatedAt?: string;
}
export interface PreAuthorization {
  _id: string;
  authorizationNumber: string;
  patientId: Patient;
  insuranceId: any;
  procedureCodes: {
    cpt: string;
    units?: number;
    charges?: number;
  }[];
  diagnosisCodes: string[];
  requestedAmount: number;
  approvedAmount?: number;
  status: string;
  rejectionReason?: string;
  authorizationDate?: string;
  validFrom?: string;
  validTo?: string;
  createdBy: any;
  notes?: string;

  providerId: string;
  providerName: string;
  providerSpecialization?: string;

  hospitalId: string;
  hospitalName: string;

  tiedUpInsurances: boolean;

  createdAt?: string;
  updatedAt?: string;
}export interface HospitalProviderItem {
  _id: string;
  name: string;
  providerCode: string;
  specialization: string;
  isActive: boolean;
  tiedUpInsurances: boolean;
}

export interface HospitalProvider {
  _id: string;
  name: string;
  email: string;
  role: string;
  hospitalProviderData: HospitalProviderItem[];
}
