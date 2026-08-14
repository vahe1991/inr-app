import { storage } from "@/libs/storage";
import { login as loginService } from "@/services/auth-user";
import type { LoginPayload } from "@/types/auth-user-type";
import { router } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  isAuthenticated: boolean | null;
  email: string | null;
  name: string | null;
  logIn: (payload: LoginPayload) => Promise<void>;
  logOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  const refreshAuth = useCallback(async () => {
    const token = await storage.getToken();
    const storedEmail = await storage.getEmail();
    const storedName = await storage.getName();
    setIsAuthenticated(Boolean(token));
    setEmail(storedEmail);
    setName(storedName);
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const logIn = useCallback(
    async (payload: LoginPayload) => {
      const data = await loginService(payload);
      await storage.setSession({
        token: data.data.token,
        name: data.data.user?.name,
        email: data.data.user?.email,
        permissions: data.data.user?.permissions,
      });
      await refreshAuth();
      router.replace("/(app)/patients");
    },
    [refreshAuth],
  );

  const logOut = useCallback(async () => {
    await storage.clear();
    setIsAuthenticated(false);
    setEmail(null);
    setName(null);
    router.replace("/sign-in");
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      email,
      name,
      logIn,
      logOut,
      refreshAuth,
    }),
    [isAuthenticated, email, name, logIn, logOut, refreshAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
