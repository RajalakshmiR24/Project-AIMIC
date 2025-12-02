export type Role = "employee" | "hospital" | "insurance";

export const decodeRoleFromToken = (token?: string | null): Role | null => {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));

    const role: string | undefined =
      payload.role || payload.claims?.role;

    return role === "employee" ||
      role === "hospital" ||
      role === "insurance"
      ? role
      : null;
  } catch {
    return null;
  }
};

export const roleToPath = (role: Role | null): string => {
  if (role === "employee") return "/employee";
  if (role === "hospital") return "/hospital";
  if (role === "insurance") return "/insurance";
  return "/unauthorized";
};
