import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  token?: string;
}

interface LoginContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export const LoginProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const isLoggedIn = !!user;

  return (
    <LoginContext.Provider value={{ user, login, logout, isLoggedIn }}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = (): LoginContextType => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error("useLogin must be used within a LoginProvider");
  }
  return context;
};
