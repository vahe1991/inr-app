import { userIdFromToken } from "@/helpers/authToken";
import { storage } from "@/libs/storage";
import { login as loginService, logout as logoutService } from "@/services/auth-user";
import type {
  AuthUserData,
  LoginPayload,
  Permission,
} from "@/types/auth-user-type";
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
  user: AuthUserData | null;
  permissions: Permission[] | null;
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
  const [user, setUser] = useState<AuthUserData | null>(null);
  const [permissions, setPermissions] = useState<Permission[] | null>(null);
  const [userId, setUserIdState] = useState<string | null>(null);

  const setUserId = useCallback((next: string | null) => {
    setUserIdState(next);
    if (next) void storage.setUserId(next);
  }, []);

  const refreshAuth = useCallback(async () => {
    const session = await storage.getSession();
    const token = session?.token ?? (await storage.getToken());
    const nextUser = session?.user ?? null;
    const nextPermissions = session?.permissions ?? null;
    const storedUserId =
      nextUser?.id != null
        ? String(nextUser.id)
        : (await storage.getUserId()) || userIdFromToken(token);

    setIsAuthenticated(Boolean(token));
    setUser(nextUser);
    setPermissions(nextPermissions);
    setUserIdState(storedUserId);
    if (storedUserId && !(await storage.getUserId())) {
      await storage.setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const logIn = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginService(payload);
      const session = response.data;
      await storage.setSession(session);
      await refreshAuth();
      router.replace("/(app)/patients");
    },
    [refreshAuth],
  );

  const logOut = useCallback(async () => {
    try {
      await logoutService();
    } catch {
      /* still clear local session */
    }
    await storage.clear();
    setIsAuthenticated(false);
    setUser(null);
    setPermissions(null);
    setUserIdState(null);
    router.replace("/sign-in");
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      permissions,
      userId,
      email: user?.email ?? null,
      name: user?.name ?? null,
      logIn,
      logOut,
      refreshAuth,
      setUserId,
    }),
    [isAuthenticated, user, permissions, userId, logIn, logOut, refreshAuth, setUserId],
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
