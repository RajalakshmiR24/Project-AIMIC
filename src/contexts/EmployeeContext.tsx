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
import { doctorApi } from "../api/doctor.api";

type LoadingState = {
  claims: boolean;
  documents: boolean;
};

export interface EmployeeContextShape {
  claims: Claim[];
  employee: any | null;

  loading: boolean;
  moreLoading: LoadingState;

  fetchMyClaims: () => Promise<void>;
  submitClaim: (payload: any) => Promise<Claim>;
  getClaim: (id: string) => Promise<Claim | null>;

  addManagedClaim: (claimId: string) => Promise<any>;
  uploadDocument: (payload: any) => Promise<any>;

  getPatientByEmail: (email: string) => Promise<Patient | null>;
}

const EmployeeContext = createContext<EmployeeContextShape | undefined>(
  undefined
);

export const useEmployee = (): EmployeeContextShape => {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error("useEmployee must be used within EmployeeProvider");
  return ctx;
};

export const EmployeeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const employeeId = localStorage.getItem("employeeId"); // or decoded token
  const [employee, setEmployee] = useState<any | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    claims: false,
    documents: false,
  });

  const loading = useMemo(
    () => loadingState.claims || loadingState.documents,
    [loadingState]
  );

  /* ---------------------------------------------------------
     FETCH MY EMPLOYEE DETAILS & CLAIMS
  --------------------------------------------------------- */
  const fetchMyClaims = async (): Promise<void> => {
    if (!employeeId) return;

    setLoadingState((s) => ({ ...s, claims: true }));
    try {
      const emp = await employeeApi.getEmployee(employeeId);
      setEmployee(emp);
      setClaims(emp?.managedClaims || []);
    } finally {
      setLoadingState((s) => ({ ...s, claims: false }));
    }
  };

  /* ---------------------------------------------------------
     SUBMIT CLAIM
  --------------------------------------------------------- */
  const submitClaim = async (payload: any): Promise<Claim> => {
    const created = await employeeApi.submitClaim(payload);
    await fetchMyClaims();
    return created;
  };

  /* ---------------------------------------------------------
     GET CLAIM BY ID
  --------------------------------------------------------- */
  const getClaim = async (id: string): Promise<Claim | null> => {
    return claims.find((x) => x._id === id) || null;
  };

  /* ---------------------------------------------------------
     ASSIGN CLAIM TO EMPLOYEE
  --------------------------------------------------------- */
  const addManagedClaim = async (claimId: string) => {
    if (!employeeId) return;

    const updated = await employeeApi.addManagedClaim(employeeId, claimId);
    await fetchMyClaims();
    return updated;
  };

  /* ---------------------------------------------------------
     DOCUMENT UPLOAD
  --------------------------------------------------------- */
  const uploadDocument = async (payload: any) => {
    if (!employeeId) return;

    setLoadingState((s) => ({ ...s, documents: true }));
    try {
      return await employeeApi.uploadDocument(employeeId, payload);
    } finally {
      setLoadingState((s) => ({ ...s, documents: false }));
    }
  };

  /* ---------------------------------------------------------
     GET PATIENT BY EMAIL
  --------------------------------------------------------- */
  const getPatientByEmail = async (email: string): Promise<Patient | null> => {
    try {
      return await doctorApi.getPatientByEmail(email);
    } catch {
      return null;
    }
  };

  /* ---------------------------------------------------------
     INITIAL LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    fetchMyClaims();
  }, []);

  const ctx: EmployeeContextShape = {
    claims,
    employee,
    loading,
    moreLoading: loadingState,

    fetchMyClaims,
    submitClaim,
    getClaim,

    addManagedClaim,
    uploadDocument,

    getPatientByEmail,
  };

  return (
    <EmployeeContext.Provider value={ctx}>
      {children}
    </EmployeeContext.Provider>
  );
};
