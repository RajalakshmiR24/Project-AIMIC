// src/contexts/DoctorContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  api,
  Patient as PatientType,
  MedicalReport as MedicalReportType,
  Insurance as InsuranceType,
} from "../api/api";

type LoadingState = {
  patients: boolean;
  reports: boolean;
  insurance: boolean;
};

export interface DoctorContextShape {
  patients: PatientType[];
  reports: MedicalReportType[];
  insuranceRecords: InsuranceType[];
  loading: boolean;
  moreLoading: LoadingState;
  // patient methods
  fetchPatients: () => Promise<void>;
  getPatient: (id: string) => Promise<PatientType | null>;
  addPatient: (p: Partial<PatientType>) => Promise<PatientType>;
  updatePatient: (id: string, payload: Partial<PatientType>) => Promise<PatientType>;
  deletePatient: (id: string) => Promise<void>;
  searchPatients: (q: string) => Promise<PatientType[]>;
  updatePatientStatus: (id: string, status: PatientType["status"]) => Promise<PatientType>;
  updatePatientNextAppointment: (id: string, nextAppointment: string | null) => Promise<PatientType>;
  updatePatientLastVisit: (id: string, lastVisit: string | null) => Promise<PatientType>;
  updatePatientDiagnosis: (id: string, codes: string[]) => Promise<PatientType>;
  updatePatientInsurance: (id: string, payload: Partial<PatientType>) => Promise<PatientType>;

  // reports
  fetchReports: () => Promise<void>;
  fetchReportsByPatient: (patientId: string) => Promise<MedicalReportType[]>;
  getReport: (id: string) => Promise<MedicalReportType | null>;
  createReport: (payload: Partial<MedicalReportType>) => Promise<MedicalReportType>;
  updateReport: (id: string, payload: Partial<MedicalReportType>) => Promise<MedicalReportType>;
  deleteReport: (id: string) => Promise<void>;
  searchReports: (q: string) => Promise<MedicalReportType[]>;
  addReportFiles: (reportId: string, files: any[]) => Promise<MedicalReportType>;
  deleteReportFile: (reportId: string, fileId: string) => Promise<MedicalReportType>;

  // insurance
  fetchInsurance: () => Promise<void>;
  getInsuranceByPatient: (patientId: string) => Promise<InsuranceType | null>;
  addInsurance: (payload: Partial<InsuranceType>) => Promise<InsuranceType>;
  updateInsurance: (id: string, payload: Partial<InsuranceType>) => Promise<InsuranceType>;
  deleteInsurance: (id: string) => Promise<void>;
  searchInsurance: (q: string) => Promise<InsuranceType[]>;
}

const DoctorContext = createContext<DoctorContextShape | undefined>(undefined);

export const useDoctor = (): DoctorContextShape => {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error("useDoctor must be used within DoctorProvider");
  return ctx;
};

export const DoctorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [reports, setReports] = useState<MedicalReportType[]>([]);
  const [insuranceRecords, setInsuranceRecords] = useState<InsuranceType[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    patients: false,
    reports: false,
    insurance: false,
  });

  const loading = useMemo(() => {
    return loadingState.patients || loadingState.reports || loadingState.insurance;
  }, [loadingState]);

  /* ----------------------- PATIENTS ----------------------- */
  const fetchPatients = async (): Promise<void> => {
    setLoadingState((s) => ({ ...s, patients: true }));
    try {
      const data = await api.getAllPatients();
      setPatients(data || []);
    } finally {
      setLoadingState((s) => ({ ...s, patients: false }));
    }
  };

  const getPatient = async (id: string): Promise<PatientType | null> => {
    try {
      const p = await api.getPatientById(id);
      return p || null;
    } catch {
      return null;
    }
  };

  const addPatient = async (payload: Partial<PatientType>): Promise<PatientType> => {
    const created = await api.addPatient(payload as PatientType);
    await fetchPatients();
    return created;
  };

  const updatePatient = async (id: string, payload: Partial<PatientType>): Promise<PatientType> => {
    const updated = await api.updatePatient(id, payload);
    await fetchPatients();
    return updated;
  };

  const deletePatient = async (id: string): Promise<void> => {
    await api.deletePatient(id);
    await fetchPatients();
  };

  const searchPatients = async (q: string): Promise<PatientType[]> => {
    const res = await api.searchPatients(q);
    return res || [];
  };

  const updatePatientStatus = async (id: string, status: PatientType["status"]) => {
    const updated = await api.updatePatientStatus(id, status);
    await fetchPatients();
    return updated;
  };

  const updatePatientNextAppointment = async (id: string, nextAppointment: string | null) => {
    const updated = await api.updatePatientNextAppointment(id, nextAppointment);
    await fetchPatients();
    return updated;
  };

  const updatePatientLastVisit = async (id: string, lastVisit: string | null) => {
    const updated = await api.updatePatientLastVisit(id, lastVisit);
    await fetchPatients();
    return updated;
  };

  const updatePatientDiagnosis = async (id: string, codes: string[]) => {
    const updated = await api.updatePatientDiagnosis(id, codes);
    await fetchPatients();
    return updated;
  };

  const updatePatientInsurance = async (id: string, payload: Partial<PatientType>) => {
    const updated = await api.updatePatientInsurance(id, payload);
    await fetchPatients();
    return updated;
  };

  /* ----------------------- REPORTS ----------------------- */
  const fetchReports = async (): Promise<void> => {
    setLoadingState((s) => ({ ...s, reports: true }));
    try {
      const data = await api.getAllReports();
      setReports(data || []);
    } finally {
      setLoadingState((s) => ({ ...s, reports: false }));
    }
  };

  const fetchReportsByPatient = async (patientId: string): Promise<MedicalReportType[]> => {
    const data = await api.getReportsByPatient(patientId);
    return data || [];
  };

  const getReport = async (id: string): Promise<MedicalReportType | null> => {
    try {
      const r = await api.getReportById(id);
      return r || null;
    } catch {
      return null;
    }
  };

  const createReport = async (payload: Partial<MedicalReportType>): Promise<MedicalReportType> => {
    const created = await api.createReport(payload as MedicalReportType);
    await fetchReports();
    return created;
  };

  const updateReport = async (id: string, payload: Partial<MedicalReportType>): Promise<MedicalReportType> => {
    const updated = await api.updateReport(id, payload);
    await fetchReports();
    return updated;
  };

  const deleteReport = async (id: string): Promise<void> => {
    await api.deleteReport(id);
    await fetchReports();
  };

  const searchReports = async (q: string): Promise<MedicalReportType[]> => {
    const res = await api.searchReports(q);
    // Keep local cache refreshed
    await fetchReports();
    return res || [];
  };

  const addReportFiles = async (reportId: string, files: any[]): Promise<MedicalReportType> => {
    const r = await api.addReportFiles(reportId, files);
    await fetchReports();
    return r;
  };

  const deleteReportFile = async (reportId: string, fileId: string): Promise<MedicalReportType> => {
    const r = await api.deleteReportFile(reportId, fileId);
    await fetchReports();
    return r;
  };

  /* ----------------------- INSURANCE ----------------------- */
  const fetchInsurance = async (): Promise<void> => {
    setLoadingState((s) => ({ ...s, insurance: true }));
    try {
      const data = await api.getAllInsurance();
      setInsuranceRecords(data || []);
    } finally {
      setLoadingState((s) => ({ ...s, insurance: false }));
    }
  };

  const getInsuranceByPatient = async (patientId: string): Promise<InsuranceType | null> => {
    try {
      const rec = await api.getInsuranceByPatientId(patientId);
      return rec || null;
    } catch {
      return null;
    }
  };

  const addInsurance = async (payload: Partial<InsuranceType>): Promise<InsuranceType> => {
    const created = await api.addInsurance(payload as InsuranceType);
    await fetchInsurance();
    return created;
  };

  const updateInsurance = async (id: string, payload: Partial<InsuranceType>): Promise<InsuranceType> => {
    const updated = await api.updateInsurance(id, payload);
    await fetchInsurance();
    return updated;
  };

  const deleteInsurance = async (id: string): Promise<void> => {
    await api.deleteInsurance(id);
    await fetchInsurance();
  };

  const searchInsurance = async (q: string): Promise<InsuranceType[]> => {
    const res = await api.searchInsurance(q);
    return res || [];
  };

  /* ----------------------- EFFECTS ----------------------- */
  useEffect(() => {
    // initial load
    fetchPatients();
    fetchReports();
    fetchInsurance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ctx: DoctorContextShape = {
    patients,
    reports,
    insuranceRecords,
    loading,
    moreLoading: loadingState,
    fetchPatients,
    getPatient,
    addPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    updatePatientStatus,
    updatePatientNextAppointment,
    updatePatientLastVisit,
    updatePatientDiagnosis,
    updatePatientInsurance,

    fetchReports,
    fetchReportsByPatient,
    getReport,
    createReport,
    updateReport,
    deleteReport,
    searchReports,
    addReportFiles,
    deleteReportFile,

    fetchInsurance,
    getInsuranceByPatient,
    addInsurance,
    updateInsurance,
    deleteInsurance,
    searchInsurance,
  };

  return <DoctorContext.Provider value={ctx}>{children}</DoctorContext.Provider>;
};
