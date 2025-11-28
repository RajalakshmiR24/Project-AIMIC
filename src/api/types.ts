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

export interface ReadyForClaimItem {
  patient: {
    _id: string;
    fullName: string;
    age: number;
    sex: string;
    birthDate: string;
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    insuranceId: string;
    primaryCondition: string;
    status: string;
    lastVisit: string | null;
    nextAppointment: string | null;
    visibleToEmployee: boolean;
    visibleToInsurance: boolean;
    patientWorkflowStatus: string;
    createdBy: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
    createdAt: string;
    updatedAt: string;
    __v: number;
  };

  insurance: {
    _id: string;
    patientId: string[];
    insuranceProvider: string;
    planName: string;
    policyNumber: string;
    groupNumber: string;
    insuredName: string;
    insuredIdNumber: string;
    insuredDateOfBirth: string;
    insuredSex: string;
    insuredRelationship: string;
    insuredAddressLine1: string;
    insuredAddressLine2: string;
    insuredCity: string;
    insuredState: string;
    insuredZipCode: string;
    insuredPhone: string;
    otherInsuranceExists: boolean;
    otherInsuranceName: string;
    otherInsurancePolicyNumber: string;
    otherInsuranceGroupNumber: string;
    employmentRelated: boolean;
    autoAccident: boolean;
    autoAccidentState: string;
    otherAccident: boolean;
    priorAuthorizationNumber: string;
    outsideLab: boolean;
    outsideLabCharges: number;
    hospitalizationFrom: string | null;
    hospitalizationTo: string | null;
    insuranceCardFrontBase64: string;
    insuranceCardBackBase64: string;
    createdAt: string;
    updatedAt: string;
    insuranceId: string;
    __v: number;
  };

  latestReport: {
    _id: string;
    patientId: string;
    reportType: string;
    primaryDiagnosis: string;
    secondaryDiagnosis: string[];
    treatmentProvided: string;
    medicationsPrescribed: string;
    labResults: string;
    recommendations: string;
    followUpDate: string;
    referringProviderName: string;
    referringProviderNPI: string;
    serviceDateFrom: string;
    serviceDateTo: string;
    procedureCodes: {
      cpt: string;
      modifier: string;
      diagnosisPointers: string[];
      charges: number;
      units: number;
      _id: string;
    }[];
    createdBy: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  } | null;

  createdBy: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
}


/* ------------------ PATIENT TYPES ------------------ */
export interface Patient {
  _id?: string;

  fullName: string;
  age?: number;
  sex?: "M" | "F" | "U";
  birthDate?: string | null;

  phone?: string;
  email?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;

  insuranceId?: string; // from Insurance auto-generation

  primaryCondition?: string;

  status?: "Active Treatment" | "Follow-up Required" | "Discharged";

  lastVisit?: string | null;
  nextAppointment?: string | null;

  visibleToEmployee?: boolean;
  visibleToInsurance?: boolean;

  patientWorkflowStatus?:
    | "Created"
    | "ReportSubmitted"
    | "ReadyForEmployee"
    | "ReadyForClaim"
    | "ClaimSubmitted"
    | "UnderInsuranceReview"
    | "Approved"
    | "Rejected";

  createdBy?: {
    _id?: string;
    name?: string;
    role?: string;
  } | string;

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

  // MUST be array — backend expects patientId: Types.ObjectId[]
  patientId: string[];

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
