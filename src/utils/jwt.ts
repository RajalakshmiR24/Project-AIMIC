type Role = "employee" | "doctor" | "insurance";

export const decodeRoleFromToken = (token?: string | null): Role | null => {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role ?? payload.claims?.role ?? null;
  } catch {
    return null;
  }
};

export const roleToPath = (role: string) => {
  switch (role) {
    case "employee": return "/employee";
    case "doctor": return "/doctor";
    case "insurance": return "/insurance";
    default: return "/unauthorized";
  }
};
