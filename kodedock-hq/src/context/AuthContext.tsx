import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Staff {
  id: string;
  name: string;
  email: string;
  role_id: string;
}

interface AuthContextType {
  token: string | null;
  staff: Staff | null;
  login: (token: string, staff: Staff) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("hq_token"));
  const [staff, setStaff] = useState<Staff | null>(() => {
    const saved = localStorage.getItem("hq_staff");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (newToken: string, newStaff: Staff) => {
    setToken(newToken);
    setStaff(newStaff);
    localStorage.setItem("hq_token", newToken);
    localStorage.setItem("hq_staff", JSON.stringify(newStaff));
  };

  const logout = () => {
    setToken(null);
    setStaff(null);
    localStorage.removeItem("hq_token");
    localStorage.removeItem("hq_staff");
  };

  return (
    <AuthContext.Provider value={{ token, staff, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
