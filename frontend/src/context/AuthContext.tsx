"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  authAPI,
  clearToken,
  getToken,
  getTokenExpiryMs,
  onUnauthorized,
  setToken,
} from "@/lib/api";
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
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }, []);

  // Session expired — either the access token's exp passed while the tab
  // was open, or the backend rejected it (401) on some request. Either way:
  // clear everything and send the person back to log in, with a reason so
  // the login page can explain what happened (as opposed to a normal,
  // deliberate logout, which shouldn't show that message).
  const handleSessionExpired = useCallback(() => {
    clearExpiryTimer();
    clearToken();
    setUser(null);
    router.push("/login?reason=expired");
  }, [clearExpiryTimer, router]);

  // Proactively log out the moment the token's `exp` claim passes, instead
  // of waiting for the next API call to fail. If the token is already
  // expired (e.g. the tab was left open overnight), this fires immediately.
  const scheduleExpiryLogout = useCallback(
    (token: string) => {
      clearExpiryTimer();
      const expiryMs = getTokenExpiryMs(token);
      if (expiryMs === null) return;

      const delay = expiryMs - Date.now();
      if (delay <= 0) {
        handleSessionExpired();
        return;
      }
      expiryTimerRef.current = setTimeout(handleSessionExpired, delay);
    },
    [clearExpiryTimer, handleSessionExpired]
  );

  const logout = useCallback(() => {
    clearExpiryTimer();
    clearToken();
    setUser(null);
    router.push("/login");
  }, [clearExpiryTimer, router]);

  // On first load, if a token is already stored, validate it against
  // /auth/me so a stale/expired token doesn't silently look "logged in".
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    scheduleExpiryLogout(token);

    authAPI
      .me()
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));

    // Only run once on mount — scheduleExpiryLogout/handleSessionExpired are
    // stable across renders via useCallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Any API call that comes back 401 (expired/invalid token) should drop the
  // person back to the login page instead of leaving them on a broken page.
  useEffect(() => {
    return onUnauthorized(handleSessionExpired);
  }, [handleSessionExpired]);

  useEffect(() => clearExpiryTimer, [clearExpiryTimer]);

  const login = useCallback(
    async (data: LoginData) => {
      const token = await authAPI.login(data);
      setToken(token.access_token);
      scheduleExpiryLogout(token.access_token);
      const me = await authAPI.me();
      setUser(me);
    },
    [scheduleExpiryLogout]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      await authAPI.register(data);
      await login({ email: data.email, password: data.password });
    },
    [login]
  );

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
