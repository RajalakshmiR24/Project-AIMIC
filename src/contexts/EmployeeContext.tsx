import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

import { Claim, Patient } from "../api/types";
import { employeeApi } from "../api/employee.api";

type LoadingState = {
  claims: boolean;
  documents: boolean;
  statusUpdate: boolean;
};

export interface EmployeeContextShape {
  claims: Claim[];
  loading: boolean;
  moreLoading: LoadingState;

  fetchAllClaims: () => Promise<void>;
  createClaim: (payload: any) => Promise<Claim>;
  getPatientByEmail: (email: string) => Promise<Patient | null>;

  updatePatientStatus: (id: string, payload: any) => Promise<Patient>;
}

const EmployeeContext = createContext<EmployeeContextShape | undefined>(undefined);

export const useEmployee = (): EmployeeContextShape => {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error("useEmployee must be inside Provider");
  return ctx;
};

export const EmployeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    claims: false,
    documents: false,
    statusUpdate: false,
  });

  const loading = useMemo(
    () => loadingState.claims || loadingState.documents || loadingState.statusUpdate,
    [loadingState]
  );

  const fetchAllClaims = async (): Promise<void> => {
    setLoadingState((s) => ({ ...s, claims: true }));
    try {
      const list = await employeeApi.getAllClaims();
      setClaims(list);
    } finally {
      setLoadingState((s) => ({ ...s, claims: false }));
    }
  };

  const createClaim = async (payload: any): Promise<Claim> => {
    const created = await employeeApi.createClaim(payload);
    await fetchAllClaims();
    return created;
  };

  const getPatientByEmail = async (email: string): Promise<Patient | null> => {
    try {
      return await employeeApi.getPatientByEmail(email);
    } catch {
      return null;
    }
  };

  const updatePatientStatus = async (
    id: string,
    payload: any
  ): Promise<Patient> => {
    setLoadingState((s) => ({ ...s, statusUpdate: true }));
    try {
      const updated = await employeeApi.updatePatientStatus(id, payload);
      return updated;
    } finally {
      setLoadingState((s) => ({ ...s, statusUpdate: false }));
    }
  };

  useEffect(() => {
    fetchAllClaims();
  }, []);

  const ctx: EmployeeContextShape = {
    claims,
    loading,
    moreLoading: loadingState,
    fetchAllClaims,
    createClaim,
    getPatientByEmail,
    updatePatientStatus,
  };

  return (
    <EmployeeContext.Provider value={ctx}>
      {children}
    </EmployeeContext.Provider>
  );
};
