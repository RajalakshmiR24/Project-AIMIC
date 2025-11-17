// src/contexts/InsuranceContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { api, Insurance as InsuranceType } from "../api/api";

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
  getInsuranceByPatient: (patientId: string) => Promise<InsuranceType | null>;
  getInsuranceById: (id: string) => Promise<InsuranceType | null>;
  addInsurance: (payload: Partial<InsuranceType>) => Promise<InsuranceType>;
  updateInsurance: (id: string, payload: Partial<InsuranceType>) => Promise<InsuranceType>;
  deleteInsurance: (id: string) => Promise<void>;
  searchInsurance: (q: string) => Promise<InsuranceType[]>;

  updateCardImages: (id: string, frontBase64?: string, backBase64?: string) => Promise<InsuranceType>;
  updateAccidents: (id: string, payload: {
    employmentRelated?: boolean;
    autoAccident?: boolean;
    autoAccidentState?: string;
    otherAccident?: boolean;
  }) => Promise<InsuranceType>;
  updateHospitalization: (id: string, from?: string | null, to?: string | null) => Promise<InsuranceType>;
  clearOtherInsurance: (id: string) => Promise<InsuranceType>;
}

const InsuranceContext = createContext<InsuranceContextShape | undefined>(undefined);

export const useInsurance = (): InsuranceContextShape => {
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

  const loading = useMemo(() => {
    return loadingState.list || loadingState.single || loadingState.action;
  }, [loadingState]);

  const fetchInsurance = async (): Promise<void> => {
    setLoadingState((s) => ({ ...s, list: true }));
    try {
      const data = await api.getAllInsurance();
      setRecords(data || []);
    } finally {
      setLoadingState((s) => ({ ...s, list: false }));
    }
  };

  const getInsuranceByPatient = async (patientId: string): Promise<InsuranceType | null> => {
    setLoadingState((s) => ({ ...s, single: true }));
    try {
      const rec = await api.getInsuranceByPatientId(patientId);
      return rec || null;
    } catch {
      return null;
    } finally {
      setLoadingState((s) => ({ ...s, single: false }));
    }
  };

  const getInsuranceById = async (id: string): Promise<InsuranceType | null> => {
    setLoadingState((s) => ({ ...s, single: true }));
    try {
      const rec = await api.getInsuranceById(id);
      return rec || null;
    } catch {
      return null;
    } finally {
      setLoadingState((s) => ({ ...s, single: false }));
    }
  };

  const addInsurance = async (payload: Partial<InsuranceType>): Promise<InsuranceType> => {
    setLoadingState((s) => ({ ...s, action: true }));
    try {
      const created = await api.addInsurance(payload as InsuranceType);
      await fetchInsurance();
      return created;
    } finally {
      setLoadingState((s) => ({ ...s, action: false }));
    }
  };

  const updateInsurance = async (id: string, payload: Partial<InsuranceType>): Promise<InsuranceType> => {
    setLoadingState((s) => ({ ...s, action: true }));
    try {
      const updated = await api.updateInsurance(id, payload);
      await fetchInsurance();
      return updated;
    } finally {
      setLoadingState((s) => ({ ...s, action: false }));
    }
  };

  const deleteInsurance = async (id: string): Promise<void> => {
    setLoadingState((s) => ({ ...s, action: true }));
    try {
      await api.deleteInsurance(id);
      await fetchInsurance();
    } finally {
      setLoadingState((s) => ({ ...s, action: false }));
    }
  };

  const searchInsurance = async (q: string): Promise<InsuranceType[]> => {
    setLoadingState((s) => ({ ...s, list: true }));
    try {
      const res = await api.searchInsurance(q);
      return res || [];
    } finally {
      setLoadingState((s) => ({ ...s, list: false }));
    }
  };

  const updateCardImages = async (id: string, frontBase64?: string, backBase64?: string): Promise<InsuranceType> => {
    setLoadingState((s) => ({ ...s, action: true }));
    try {
      const updated = await api.updateInsuranceCardImages(id, frontBase64, backBase64);
      await fetchInsurance();
      return updated;
    } finally {
      setLoadingState((s) => ({ ...s, action: false }));
    }
  };

  const updateAccidents = async (id: string, payload: {
    employmentRelated?: boolean;
    autoAccident?: boolean;
    autoAccidentState?: string;
    otherAccident?: boolean;
  }): Promise<InsuranceType> => {
    setLoadingState((s) => ({ ...s, action: true }));
    try {
      const updated = await api.updateAccidents(id, payload);
      await fetchInsurance();
      return updated;
    } finally {
      setLoadingState((s) => ({ ...s, action: false }));
    }
  };

  const updateHospitalization = async (id: string, from?: string | null, to?: string | null): Promise<InsuranceType> => {
    setLoadingState((s) => ({ ...s, action: true }));
    try {
      const updated = await api.updateHospitalization(id, from, to);
      await fetchInsurance();
      return updated;
    } finally {
      setLoadingState((s) => ({ ...s, action: false }));
    }
  };

  const clearOtherInsurance = async (id: string): Promise<InsuranceType> => {
    setLoadingState((s) => ({ ...s, action: true }));
    try {
      const updated = await api.clearOtherInsurance(id);
      await fetchInsurance();
      return updated;
    } finally {
      setLoadingState((s) => ({ ...s, action: false }));
    }
  };

  useEffect(() => {
    fetchInsurance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ctx: InsuranceContextShape = {
    records,
    loading,
    moreLoading: loadingState,
    fetchInsurance,
    getInsuranceByPatient,
    getInsuranceById,
    addInsurance,
    updateInsurance,
    deleteInsurance,
    searchInsurance,
    updateCardImages,
    updateAccidents,
    updateHospitalization,
    clearOtherInsurance,
  };

  return <InsuranceContext.Provider value={ctx}>{children}</InsuranceContext.Provider>;
};
