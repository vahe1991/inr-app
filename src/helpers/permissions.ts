import { API_PATH_TEMPLATES } from "@/constants/apiPaths";
import { INRAppRoutes } from "@/constants/routes.constants";
import type {
  AuthUserData,
  HttpMethod,
  Permission,
} from "@/types/auth-user-type";

const PUBLIC_PATHS = new Set([
  "api/login",
  "api/forgot-password",
  "api/reset-password",
  "api/logout",
]);

const PATH_ALIASES: Record<string, string> = {
  "api/notification": "api/notifications",
  "api/notification/read": "api/notifications/read",
  "api/notification/read-all": "api/notifications/read-all",
  "api/notification/register-device": "api/devices/register",
  "api/notification/unregister-device": "api/devices/unregister",
  "api/notifications/unread-count": "api/notifications/unread-count",
};

export class PermissionDeniedError extends Error {
  readonly code = "PERMISSION_DENIED";
  readonly method: string;
  readonly path: string;

  constructor(method: string, path: string) {
    super(`Permission denied: ${method} ${path}`);
    this.name = "PermissionDeniedError";
    this.method = method;
    this.path = path;
  }
}

function isParam(segment: string) {
  return segment.startsWith("{") && segment.endsWith("}");
}

export function canonicalizePath(path: string) {
  const withoutQuery = path.split("?")[0]?.trim() ?? "";
  const stripped = withoutQuery.replace(/^\/+/, "").replace(/\/+$/, "");
  const withApi = stripped.startsWith("api/") ? stripped : `api/${stripped}`;
  return PATH_ALIASES[withApi] ?? withApi;
}

function segmentsMatch(permissionPath: string, requestPath: string) {
  const permission = canonicalizePath(permissionPath).split("/");
  const request = canonicalizePath(requestPath).split("/");
  if (permission.length !== request.length) return false;
  return permission.every(
    (segment, index) =>
      isParam(segment) || isParam(request[index]) || segment === request[index],
  );
}

function expandRequestPaths(method: string, path: string) {
  const canonical = canonicalizePath(path);
  if (method.toUpperCase() === "DELETE" && canonical === "api/notifications") {
    return [canonical, "api/notifications/{id}"];
  }
  return [canonical];
}

export function hasPermission(
  permissions: Permission[] | null | undefined,
  method: HttpMethod,
  path: string,
) {
  if (!permissions?.length) return false;
  const wanted = method.toUpperCase();
  return permissions.some(
    (item) =>
      item.method.toUpperCase() === wanted &&
      expandRequestPaths(wanted, path).some((candidate) =>
        segmentsMatch(item.path, candidate),
      ),
  );
}

export function isPermissionDeniedError(error: unknown) {
  return (
    error instanceof PermissionDeniedError ||
    (typeof error === "object" &&
      error != null &&
      "code" in error &&
      error.code === "PERMISSION_DENIED")
  );
}

export function isPublicApiPath(path: string) {
  return PUBLIC_PATHS.has(canonicalizePath(path));
}

export function isKnownApiPath(path: string) {
  return API_PATH_TEMPLATES.some((template) => segmentsMatch(template, path));
}

export function isRequestAllowed(
  permissions: Permission[] | null | undefined,
  method: string,
  path: string,
) {
  if (isPublicApiPath(path)) return true;
  if (!isKnownApiPath(path)) return true;
  return hasPermission(permissions, method.toUpperCase() as HttpMethod, path);
}

export function ownPatientId(user: AuthUserData | null | undefined) {
  const id = user?.patientId;
  if (id == null || id === "") return null;
  const value = String(id).trim();
  return value.length ? value : null;
}

export function shouldOpenOwnPatient(
  permissions: Permission[] | null | undefined,
  user: AuthUserData | null | undefined,
) {
  if (!ownPatientId(user)) return false;
  return (
    user?.role === "patient" ||
    !hasPermission(permissions, "GET", "api/patients")
  );
}

export function firstAllowedAppHref(
  permissions: Permission[] | null | undefined,
  user?: AuthUserData | null,
) {
  const patientId = ownPatientId(user);
  if (patientId && shouldOpenOwnPatient(permissions, user)) {
    return INRAppRoutes.patient(patientId);
  }
  if (hasPermission(permissions, "GET", "api/patients")) {
    return "/(app)/patients";
  }
  if (hasPermission(permissions, "GET", "api/inr")) {
    return "/(app)/investigations";
  }
  return "/(app)/profile";
}
