import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  token: "token",
  name: "name",
  email: "email",
  permissions: "permissions",
  rememberEmail: "remember_email",
} as const;

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
    name?: string;
    email?: string;
    permissions?: unknown;
  }) {
    await AsyncStorage.multiSet([
      [KEYS.token, data.token],
      [KEYS.name, data.name ?? ""],
      [KEYS.email, data.email ?? ""],
      [KEYS.permissions, JSON.stringify(data.permissions ?? {})],
    ]);
  },
  async clear() {
    await AsyncStorage.multiRemove([
      KEYS.token,
      KEYS.name,
      KEYS.email,
      KEYS.permissions,
    ]);
  },
};
