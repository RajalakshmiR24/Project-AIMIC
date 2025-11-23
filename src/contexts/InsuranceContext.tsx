// src/contexts/InsuranceContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { insuranceApi } from "../api/insurance.api";
import { Insurance as InsuranceType } from "../api/types";

type LoadingState = {
  list: boolean;
  single: boolean;
  action: boolean;
};

export interface InsuranceContextShape {
  records: InsuranceType[];
  loading: boolean;
  moreLoading: LoadingState;

  fetchInsurance: () => Promise<void>;
  getInsuranceById: (id: string) => Promise<InsuranceType | null>;
  addInsurance: (payload: Partial<InsuranceType>) => Promise<InsuranceType>;
  updateInsurance: (id: string, payload: Partial<InsuranceType>) => Promise<InsuranceType>;
  deleteInsurance: (id: string) => Promise<void>;

  getInsuranceByPatientId: (patientId: string) => Promise<InsuranceType[]>;
  searchInsurance: (query: string) => Promise<InsuranceType[]>;
  updateCardImages: (id: string, payload: Partial<InsuranceType>) => Promise<InsuranceType>;
  updateAccidentInfo: (id: string, payload: Partial<InsuranceType>) => Promise<InsuranceType>;
  updateHospitalization: (id: string, payload: Partial<InsuranceType>) => Promise<InsuranceType>;
  clearOtherInsurance: (id: string) => Promise<InsuranceType>;
}

const InsuranceContext = createContext<InsuranceContextShape | undefined>(undefined);

export const useInsurance = () => {
  const ctx = useContext(InsuranceContext);
  if (!ctx) throw new Error("useInsurance must be used within InsuranceProvider");
  return ctx;
};

export const InsuranceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<InsuranceType[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    list: false,
    single: false,
    action: false,
  });

  const loading = useMemo(
    () => loadingState.list || loadingState.single || loadingState.action,
    [loadingState]
  );

  const fetchInsurance = async () => {
    setLoadingState((s) => ({ ...s, list: true }));
    try {
      const data = await insuranceApi.getAllInsurance();
      setRecords(data || []);
    } finally {
      setLoadingState((s) => ({ ...s, list: false }));
    }
  };

  const getInsuranceById = async (id: string) => {
    setLoadingState((s) => ({ ...s, single: true }));
    try {
      return await insuranceApi.getInsuranceById(id);
    } catch {
      return null;
    } finally {
      setLoadingState((s) => ({ ...s, single: false }));
    }
  };

  const addInsurance = async (payload: Partial<InsuranceType>) => {
    setLoadingState((s) => ({ ...s, action: true }));
    try {
      const created = await insuranceApi.addInsurance(payload as InsuranceType);
      await fetchInsurance();
      return created;
    } finally {
      setLoadingState((s) => ({ ...s, action: false }));
    }
  };

  const updateInsurance = async (id: string, payload: Partial<InsuranceType>) => {
    setLoadingState((s) => ({ ...s, action: true }));
    try {
      const updated = await insuranceApi.updateInsurance(id, payload);
      await fetchInsurance();
      return updated;
    } finally {
      setLoadingState((s) => ({ ...s, action: false }));
    }
  };

  const deleteInsurance = async (id: string) => {
    setLoadingState((s) => ({ ...s, action: true }));
    try {
      await insuranceApi.deleteInsurance(id);
      await fetchInsurance();
    } finally {
      setLoadingState((s) => ({ ...s, action: false }));
    }
  };

  /* ------------ NEW API METHODS ------------ */

  const getInsuranceByPatientId = async (patientId: string) =>
    insuranceApi.getInsuranceByPatientId(patientId);

  const searchInsurance = async (query: string) =>
    insuranceApi.searchInsurance(query);

  const updateCardImages = async (id: string, payload: Partial<InsuranceType>) =>
    insuranceApi.updateCardImages(id, payload);

  const updateAccidentInfo = async (id: string, payload: Partial<InsuranceType>) =>
    insuranceApi.updateAccidentInfo(id, payload);

  const updateHospitalization = async (id: string, payload: Partial<InsuranceType>) =>
    insuranceApi.updateHospitalization(id, payload);

  const clearOtherInsurance = async (id: string) =>
    insuranceApi.clearOtherInsurance(id);

  useEffect(() => {
    fetchInsurance();
  }, []);

  const ctx: InsuranceContextShape = {
    records,
    loading,
    moreLoading: loadingState,
    fetchInsurance,
    getInsuranceById,
    addInsurance,
    updateInsurance,
    deleteInsurance,

    getInsuranceByPatientId,
    searchInsurance,
    updateCardImages,
    updateAccidentInfo,
    updateHospitalization,
    clearOtherInsurance,
  };

  return <InsuranceContext.Provider value={ctx}>{children}</InsuranceContext.Provider>;
};
