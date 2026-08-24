import { userIdFromToken } from "@/helpers/authToken";
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
  userId: string | null;
  email: string | null;
  name: string | null;
  logIn: (payload: LoginPayload) => Promise<void>;
  logOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setUserId: (userId: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserIdState] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  const setUserId = useCallback((next: string | null) => {
    setUserIdState(next);
    if (next) void storage.setUserId(next);
  }, []);

  const refreshAuth = useCallback(async () => {
    const token = await storage.getToken();
    const storedEmail = await storage.getEmail();
    const storedName = await storage.getName();
    const storedUserId =
      (await storage.getUserId()) || userIdFromToken(token);
    setIsAuthenticated(Boolean(token));
    setUserIdState(storedUserId);
    setEmail(storedEmail);
    setName(storedName);
    if (storedUserId && !(await storage.getUserId())) {
      await storage.setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const logIn = useCallback(
    async (payload: LoginPayload) => {
      const data = await loginService(payload);
      const nextUserId =
        data.data.user?.id != null
          ? String(data.data.user.id)
          : userIdFromToken(data.data.token);
      await storage.setSession({
        token: data.data.token,
        userId: nextUserId,
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
    setUserIdState(null);
    setEmail(null);
    setName(null);
    router.replace("/sign-in");
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      userId,
      email,
      name,
      logIn,
      logOut,
      refreshAuth,
      setUserId,
    }),
    [isAuthenticated, userId, email, name, logIn, logOut, refreshAuth, setUserId],
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
