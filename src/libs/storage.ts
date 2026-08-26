import type {
  AuthUserData,
  AuthUserResponseData,
  Permission,
} from "@/types/auth-user-type";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  token: "token",
  userId: "userId",
  user: "auth_user",
  name: "name",
  email: "email",
  permissions: "permissions",
  rememberEmail: "remember_email",
  rememberPassword: "remember_password",
} as const;

export type RememberedCredentials = {
  email: string;
  password: string;
};

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const storage = {
  async getToken() {
    return AsyncStorage.getItem(KEYS.token);
  },
  async setToken(token: string) {
    await AsyncStorage.setItem(KEYS.token, token);
  },
  async getEmail() {
    return AsyncStorage.getItem(KEYS.email);
  },
  async getName() {
    return AsyncStorage.getItem(KEYS.name);
  },
  async getUserId() {
    const id = await AsyncStorage.getItem(KEYS.userId);
    return id?.trim() ? id : null;
  },
  async setUserId(userId: string) {
    await AsyncStorage.setItem(KEYS.userId, userId);
  },
  async getUser() {
    return parseJson<AuthUserData>(await AsyncStorage.getItem(KEYS.user));
  },
  async getPermissions() {
    const parsed = parseJson<unknown>(
      await AsyncStorage.getItem(KEYS.permissions),
    );
    return Array.isArray(parsed) ? (parsed as Permission[]) : [];
  },
  async getSession(): Promise<AuthUserResponseData | null> {
    const token = await this.getToken();
    if (!token) return null;

    const storedUser = await this.getUser();
    const permissions = (await this.getPermissions()) ?? [];

    if (storedUser) return { token, user: storedUser, permissions };

    const name = (await this.getName()) ?? "";
    const email = (await this.getEmail()) ?? "";
    const userId = await this.getUserId();
    if (!userId && !name && !email) return null;

    return {
      token,
      user: {
        id: Number(userId) || 0,
        name,
        email,
        role: "doctor",
        username: "",
        patientId: null,
        created_at: "",
        updated_at: "",
      },
      permissions,
    };
  },
  async getRememberCredentials(): Promise<RememberedCredentials | null> {
    const [email, password] = await Promise.all([
      AsyncStorage.getItem(KEYS.rememberEmail),
      AsyncStorage.getItem(KEYS.rememberPassword),
    ]);

    if (!email) return null;

    return { email, password: password ?? "" };
  },
  async setRememberCredentials(credentials: RememberedCredentials | null) {
    if (credentials?.email) {
      await AsyncStorage.multiSet([
        [KEYS.rememberEmail, credentials.email],
        [KEYS.rememberPassword, credentials.password],
      ]);
      return;
    }

    await AsyncStorage.multiRemove([
      KEYS.rememberEmail,
      KEYS.rememberPassword,
    ]);
  },
  async getRememberEmail() {
    return AsyncStorage.getItem(KEYS.rememberEmail);
  },
  async setRememberEmail(email: string | null) {
    if (email) {
      await AsyncStorage.setItem(KEYS.rememberEmail, email);
    } else {
      await AsyncStorage.removeItem(KEYS.rememberEmail);
    }
  },
  async setSession(data: AuthUserResponseData) {
    await AsyncStorage.multiSet([
      [KEYS.token, data.token],
      [KEYS.user, JSON.stringify(data.user)],
      [KEYS.permissions, JSON.stringify(data.permissions)],
      [KEYS.userId, data.user?.id != null ? String(data.user.id) : ""],
      [KEYS.name, data.user?.name ?? ""],
      [KEYS.email, data.user?.email ?? ""],
    ]);
  },
  async clear() {
    await AsyncStorage.multiRemove([
      KEYS.token,
      KEYS.user,
      KEYS.userId,
      KEYS.name,
      KEYS.email,
      KEYS.permissions,
    ]);
  },
};
