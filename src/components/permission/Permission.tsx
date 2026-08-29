import { useCan } from "@/hooks/usePermission.hook";
import type { HttpMethod } from "@/types/auth-user-type";
import type { ReactNode } from "react";

type PermissionProps = {
  method: HttpMethod;
  path: string;
  children: ReactNode;
};

export function Permission({ method, path, children }: PermissionProps) {
  const allowed = useCan(method, path);
  if (!allowed) return null;
  return <>{children}</>;
}
