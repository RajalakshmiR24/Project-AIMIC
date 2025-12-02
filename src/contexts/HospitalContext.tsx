// src/contexts/HospitalContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type {
  Patient as PatientType,
  MedicalReport as MedicalReportType,
  ProcedureCode,
  HospitalProvider as HospitalProviderType,
  PreAuthorization,
} from "../api/types";


import { hospitalApi } from "../api/hospital.api";

type LoadingState = {
  patients: boolean;
  reports: boolean;
  providers: boolean;
  preAuth: boolean;
};

export interface HospitalContextShape {
  patients: PatientType[];
  reports: MedicalReportType[];
  hospitalProviders: HospitalProviderType[];
  preAuthorizations: PreAuthorization[];

  loading: boolean;
  moreLoading: LoadingState;

  fetchPatients: () => Promise<void>;
  getPatient: (id: string) => Promise<PatientType | null>;
  addPatient: (p: Partial<PatientType>) => Promise<PatientType>;
  updatePatient: (id: string, payload: Partial<PatientType>) => Promise<PatientType>;
  deletePatient: (id: string) => Promise<void>;
  searchPatients: (q: string) => Promise<PatientType[]>;
  updatePatientStatus: (id: string, payload: any) => Promise<PatientType>;

  fetchReports: () => Promise<void>;
  fetchReportsByPatient: (patientId: string) => Promise<MedicalReportType[]>;
  getReport: (id: string) => Promise<MedicalReportType | null>;
  createReport: (payload: Partial<MedicalReportType>) => Promise<MedicalReportType>;
  updateReport: (id: string, payload: Partial<MedicalReportType>) => Promise<MedicalReportType>;
  deleteReport: (id: string) => Promise<void>;
  searchReports: (q: string) => Promise<MedicalReportType[]>;

  addProcedureToReport: (
    reportId: string,
    procedure: ProcedureCode
  ) => Promise<MedicalReportType>;

  updateReportServiceDates: (
    reportId: string,
    from?: string | null,
    to?: string | null
  ) => Promise<MedicalReportType>;

  addReferringProviderToReport: (
    reportId: string,
    name?: string,
    npi?: string
  ) => Promise<MedicalReportType>;

  fetchHospitalProviders: () => Promise<void>;
  fetchPreAuthorizations: () => Promise<void>;
}

const HospitalContext = createContext<HospitalContextShape | undefined>(undefined);

export const useHospital = (): HospitalContextShape => {
  const ctx = useContext(HospitalContext);
  if (!ctx) throw new Error("useHospital must be used within HospitalProvider");
  return ctx;
};

export const HospitalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [reports, setReports] = useState<MedicalReportType[]>([]);
const [hospitalProviders, setHospitalProviders] = useState<HospitalProviderType[]>([]);
  const [preAuthorizations, setPreAuthorizations] = useState<PreAuthorization[]>([]);

  const [loadingState, setLoadingState] = useState<LoadingState>({
    patients: false,
    reports: false,
    providers: false,
    preAuth: false,
  });

  const loading = useMemo(
    () =>
      loadingState.patients ||
      loadingState.reports ||
      loadingState.providers ||
      loadingState.preAuth,
    [loadingState]
  );

  /* ---------------- PATIENT OPERATIONS ---------------- */

  const fetchPatients = async () => {
    setLoadingState((s) => ({ ...s, patients: true }));
    try {
      const data = await hospitalApi.getAllPatients();
      setPatients(data || []);
    } finally {
      setLoadingState((s) => ({ ...s, patients: false }));
    }
  };

  const getPatient = async (id: string) => {
    try {
      return await hospitalApi.getPatientById(id);
    } catch {
      return null;
    }
  };

  const addPatient = async (payload: Partial<PatientType>) => {
    const created = await hospitalApi.addPatient(payload as PatientType);
    await fetchPatients();
    return created;
  };

  const updatePatient = async (id: string, payload: Partial<PatientType>) => {
    const updated = await hospitalApi.updatePatient(id, payload);
    await fetchPatients();
    return updated;
  };

  const deletePatient = async (id: string) => {
    await hospitalApi.deletePatient(id);
    await fetchPatients();
  };

  const searchPatients = async (q: string) => {
    return await hospitalApi.searchPatients(q);
  };

  const updatePatientStatus = async (id: string, payload: any) => {
    const updated = await hospitalApi.updatePatientStatus(id, payload);
    await fetchPatients();
    return updated;
  };

  /* ---------------- REPORT OPERATIONS ---------------- */

  const fetchReports = async () => {
    setLoadingState((s) => ({ ...s, reports: true }));
    try {
      const data = await hospitalApi.getAllReports();
      setReports(data || []);
    } finally {
      setLoadingState((s) => ({ ...s, reports: false }));
    }
  };

  const fetchReportsByPatient = async (pid: string) =>
    await hospitalApi.getReportsByPatient(pid);

  const getReport = async (id: string) => {
    try {
      return await hospitalApi.getReportById(id);
    } catch {
      return null;
    }
  };

  const createReport = async (payload: Partial<MedicalReportType>) => {
    const created = await hospitalApi.createReport(payload as MedicalReportType);
    await fetchReports();
    return created;
  };

  const updateReport = async (id: string, payload: Partial<MedicalReportType>) => {
    const updated = await hospitalApi.updateReport(id, payload);
    await fetchReports();
    return updated;
  };

  const deleteReport = async (id: string) => {
    await hospitalApi.deleteReport(id);
    await fetchReports();
  };

  const searchReports = async (q: string) => {
    const res = await hospitalApi.searchReports(q);
    await fetchReports();
    return res || [];
  };

  const addProcedureToReport = async (
    reportId: string,
    procedure: ProcedureCode
  ) => {
    const r = await hospitalApi.addProcedure(reportId, procedure);
    await fetchReports();
    return r;
  };

  const updateReportServiceDates = async (
    reportId: string,
    from?: string | null,
    to?: string | null
  ) => {
    const r = await hospitalApi.updateServiceDates(reportId, from, to);
    await fetchReports();
    return r;
  };

  const addReferringProviderToReport = async (
    reportId: string,
    name?: string,
    npi?: string
  ) => {
    const r = await hospitalApi.addReferringProvider(reportId, name, npi);
    await fetchReports();
    return r;
  };

  /* ---------------- PROVIDERS ---------------- */

  const fetchHospitalProviders = async () => {
    setLoadingState((s) => ({ ...s, providers: true }));
    try {
      const data = await hospitalApi.getAllHospitalProviders();
      setHospitalProviders(data || []);
    } finally {
      setLoadingState((s) => ({ ...s, providers: false }));
    }
  };

  /* ---------------- PRE-AUTHORIZATIONS ---------------- */

  const fetchPreAuthorizations = async () => {
    setLoadingState((s) => ({ ...s, preAuth: true }));
    try {
      const data = await hospitalApi.getAllPreAuthorizations();
      setPreAuthorizations(data || []);
    } finally {
      setLoadingState((s) => ({ ...s, preAuth: false }));
    }
  };

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    fetchPatients();
    fetchReports();
    fetchHospitalProviders();
    fetchPreAuthorizations();
  }, []);

  return (
    <HospitalContext.Provider
      value={{
        patients,
        reports,
        hospitalProviders,
        preAuthorizations,

        loading,
        moreLoading: loadingState,

        fetchPatients,
        getPatient,
        addPatient,
        updatePatient,
        deletePatient,
        searchPatients,
        updatePatientStatus,

        fetchReports,
        fetchReportsByPatient,
        getReport,
        createReport,
        updateReport,
        deleteReport,
        searchReports,

        addProcedureToReport,
        updateReportServiceDates,
        addReferringProviderToReport,

        fetchHospitalProviders,
        fetchPreAuthorizations,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};
