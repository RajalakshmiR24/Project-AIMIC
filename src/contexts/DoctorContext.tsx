import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, Patient, MedicalReport } from "../api/api";

interface DoctorContextType {
  patients: Patient[];
  reports: MedicalReport[];
  loading: boolean;
  fetchPatients: () => Promise<void>;
  fetchReports: () => Promise<void>;
  addPatient: (data: Patient) => Promise<void>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  createReport: (data: MedicalReport) => Promise<void>;
  updateReport: (id: string, data: Partial<MedicalReport>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const useDoctor = (): DoctorContextType => {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error("useDoctor must be used within DoctorProvider");
  return ctx;
};

export const DoctorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(false);

  /** Fetch all patients */
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await api.getAllPatients();
      setPatients(data);
    } finally {
      setLoading(false);
    }
  };

  /** Fetch all reports */
  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getAllReports();
      setReports(data);
    } finally {
      setLoading(false);
    }
  };

  /** CRUD: Patients */
  const addPatient = async (data: Patient) => {
    await api.addPatient(data);
    await fetchPatients();
  };

  const updatePatient = async (id: string, data: Partial<Patient>) => {
    await api.updatePatient(id, data);
    await fetchPatients();
  };

  const deletePatient = async (id: string) => {
    await api.deletePatient(id);
    await fetchPatients();
  };

  /** CRUD: Reports */
  const createReport = async (data: MedicalReport) => {
    await api.createReport(data);
    await fetchReports();
  };

  const updateReport = async (id: string, data: Partial<MedicalReport>) => {
    await api.updateReport(id, data);
    await fetchReports();
  };

  const deleteReport = async (id: string) => {
    await api.deleteReport(id);
    await fetchReports();
  };

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
        fetchPatients,
        fetchReports,
        addPatient,
        updatePatient,
        deletePatient,
        createReport,
        updateReport,
        deleteReport,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};
