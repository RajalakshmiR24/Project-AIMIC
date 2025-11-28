// src/contexts/ClaimsContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { claimsApi, Claim, ClaimPayload } from "../api/claims.api";

interface ClaimsContextType {
  claims: Claim[];
  loading: boolean;

  fetchClaims: () => Promise<void>;
  fetchClaimById: (id: string) => Promise<Claim | null>;

  createClaim: (data: ClaimPayload) => Promise<Claim>;
  updateClaim: (id: string, data: Partial<Claim>) => Promise<Claim>;
  deleteClaim: (id: string) => Promise<void>;
}

const ClaimsContext = createContext<ClaimsContextType | null>(null);

export const ClaimsProvider = ({ children }: { children: React.ReactNode }) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const data = await claimsApi.getAllClaims();
      setClaims(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimById = async (id: string) => {
    try {
      return await claimsApi.getClaimById(id);
    } catch {
      return null;
    }
  };

  const createClaim = async (data: ClaimPayload) => {
    const created = await claimsApi.createClaim(data);
    setClaims((prev) => [created, ...prev]);
    return created;
  };

  const updateClaim = async (id: string, data: Partial<Claim>) => {
    const updated = await claimsApi.updateClaim(id, data);
    setClaims((prev) => prev.map((c) => (c._id === id ? updated : c)));
    return updated;
  };

  const deleteClaim = async (id: string) => {
    await claimsApi.deleteClaim(id);
    setClaims((prev) => prev.filter((c) => c._id !== id));
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <ClaimsContext.Provider
      value={{
        claims,
        loading,
        fetchClaims,
        fetchClaimById,
        createClaim,
        updateClaim,
        deleteClaim,
      }}
    >
      {children}
    </ClaimsContext.Provider>
  );
};

export const useClaims = () => {
  const ctx = useContext(ClaimsContext);
  if (!ctx) throw new Error("useClaims must be used inside ClaimsProvider");
  return ctx;
};
