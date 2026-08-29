import { hasPermission } from "@/helpers/permissions";
import { useAuth } from "@/contexts/AuthContext";
import type { HttpMethod } from "@/types/auth-user-type";
import { useCallback } from "react";

export function useHasPermission() {
  const { permissions } = useAuth();
  return useCallback(
    (method: HttpMethod, path: string) =>
      hasPermission(permissions, method, path),
    [permissions],
  );
}

export function useCan(method: HttpMethod, path: string) {
  const { permissions } = useAuth();
  return hasPermission(permissions, method, path);
}
