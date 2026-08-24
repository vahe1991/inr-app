import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  token: "token",
  userId: "userId",
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
  async setSession(data: {
    token: string;
    userId?: string | number | null;
    name?: string;
    email?: string;
    permissions?: unknown;
  }) {
    await AsyncStorage.multiSet([
      [KEYS.token, data.token],
      [KEYS.userId, data.userId != null ? String(data.userId) : ""],
      [KEYS.name, data.name ?? ""],
      [KEYS.email, data.email ?? ""],
      [KEYS.permissions, JSON.stringify(data.permissions ?? {})],
    ]);
  },
  async clear() {
    await AsyncStorage.multiRemove([
      KEYS.token,
      KEYS.userId,
      KEYS.name,
      KEYS.email,
      KEYS.permissions,
    ]);
  },
};
