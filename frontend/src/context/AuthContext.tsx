"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { authAPI, clearToken, getToken, onUnauthorized, setToken } from "@/lib/api";
import { LoginData, RegisterData, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  // On first load, if a token is already stored, validate it against
  // /auth/me so a stale/expired token doesn't silently look "logged in".
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    authAPI
      .me()
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Any API call that comes back 401 (expired/invalid token) should drop the
  // person back to the login page instead of leaving them on a broken page.
  useEffect(() => {
    return onUnauthorized(() => {
      setUser(null);
      router.push("/login");
    });
  }, [router]);

  const login = useCallback(async (data: LoginData) => {
    const token = await authAPI.login(data);
    setToken(token.access_token);
    const me = await authAPI.me();
    setUser(me);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await authAPI.register(data);
    await login({ email: data.email, password: data.password });
  }, [login]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
