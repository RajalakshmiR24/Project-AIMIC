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
  Patient as PatientType,
  MedicalReport as MedicalReportType,
  ReportFile,
  ProcedureCode
} from "../api/types";

import { doctorApi } from "../api/doctor.api";

type LoadingState = {
  patients: boolean;
  reports: boolean;
};

export interface DoctorContextShape {
  patients: PatientType[];
  reports: MedicalReportType[];
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

  addReportFiles: (reportId: string, files: ReportFile[]) => Promise<MedicalReportType>;
  deleteReportFile: (reportId: string, fileId: string) => Promise<MedicalReportType>;

  addProcedureToReport: (reportId: string, procedure: ProcedureCode) => Promise<MedicalReportType>;
  updateReportServiceDates: (reportId: string, from?: string | null, to?: string | null) => Promise<MedicalReportType>;
  addReferringProviderToReport: (reportId: string, name?: string, npi?: string) => Promise<MedicalReportType>;
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
  const [loadingState, setLoadingState] = useState<LoadingState>({
    patients: false,
    reports: false,
  });

  const loading = useMemo(
    () => loadingState.patients || loadingState.reports,
    [loadingState]
  );

  /* ---------------------------------------------------------
     PATIENT OPERATIONS
  --------------------------------------------------------- */
  const fetchPatients = async () => {
    setLoadingState(s => ({ ...s, patients: true }));
    try {
      const data = await doctorApi.getAllPatients();
      setPatients(data || []);
    } finally {
      setLoadingState(s => ({ ...s, patients: false }));
    }
  };

  const getPatient = async (id: string) => {
    try {
      return await doctorApi.getPatientById(id);
    } catch {
      return null;
    }
  };

  const addPatient = async (payload: Partial<PatientType>) => {
    const created = await doctorApi.addPatient(payload as PatientType);
    await fetchPatients();
    return created;
  };

  const updatePatient = async (id: string, payload: Partial<PatientType>) => {
    const updated = await doctorApi.updatePatient(id, payload);
    await fetchPatients();
    return updated;
  };

  const deletePatient = async (id: string) => {
    await doctorApi.deletePatient(id);
    await fetchPatients();
  };

  const searchPatients = async (q: string) => {
    return await doctorApi.searchPatients(q);
  };



  const fetchReports = async () => {
    setLoadingState(s => ({ ...s, reports: true }));
    try {
      const data = await doctorApi.getAllReports();
      setReports(data || []);
    } finally {
      setLoadingState(s => ({ ...s, reports: false }));
    }
  };

  const fetchReportsByPatient = async (pid: string) =>
    await doctorApi.getReportsByPatient(pid);

  const getReport = async (id: string) => {
    try {
      return await doctorApi.getReportById(id);
    } catch {
      return null;
    }
  };

  const createReport = async (payload: Partial<MedicalReportType>) => {
    const created = await doctorApi.createReport(payload as MedicalReportType);
    await fetchReports();
    return created;
  };

  const updateReport = async (id: string, payload: Partial<MedicalReportType>) => {
    const updated = await doctorApi.updateReport(id, payload);
    await fetchReports();
    return updated;
  };

  const deleteReport = async (id: string) => {
    await doctorApi.deleteReport(id);
    await fetchReports();
  };

  const searchReports = async (q: string) => {
    const res = await doctorApi.searchReports(q);
    await fetchReports();
    return res || [];
  };

  const addReportFiles = async (reportId: string, files: ReportFile[]) => {
    const r = await doctorApi.addReportFiles(reportId, files);
    await fetchReports();
    return r;
  };

  const deleteReportFile = async (reportId: string, fileId: string) => {
    const r = await doctorApi.deleteReportFile(reportId, fileId);
    await fetchReports();
    return r;
  };

  const addProcedureToReport = async (reportId: string, procedure: ProcedureCode) => {
    const r = await doctorApi.addProcedure(reportId, procedure);
    await fetchReports();
    return r;
  };

  const updateReportServiceDates = async (reportId: string, from?: string | null, to?: string | null) => {
    const r = await doctorApi.updateServiceDates(reportId, from, to);
    await fetchReports();
    return r;
  };

  const addReferringProviderToReport = async (reportId: string, name?: string, npi?: string) => {
    const r = await doctorApi.addReferringProvider(reportId, name, npi);
    await fetchReports();
    return r;
  };
const updatePatientStatus = async (id: string, payload: any) => {
  const updated = await doctorApi.updatePatientStatus(id, payload);
  await fetchPatients();
  return updated;
};


  /* ---------------------------------------------------------
     INITIAL
  --------------------------------------------------------- */
  useEffect(() => {
    fetchPatients();
    fetchReports();
  }, []);

  return (
    <DoctorContext.Provider
      value={{
        patients,
        reports,
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
        addReportFiles,
        deleteReportFile,
        addProcedureToReport,
        updateReportServiceDates,
        addReferringProviderToReport,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};
