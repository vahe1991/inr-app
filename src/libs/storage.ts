import type {
  AuthUserData,
  AuthUserResponseData,
  Permission,
} from "@/types/auth-user-type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

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

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function canUseSecureStore() {
  if (Platform.OS === "web") return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function readToken() {
  if (await canUseSecureStore()) {
    const secure = await SecureStore.getItemAsync(KEYS.token, SECURE_OPTIONS);
    if (secure) return secure;

    const legacy = await AsyncStorage.getItem(KEYS.token);
    if (legacy) {
      await SecureStore.setItemAsync(KEYS.token, legacy, SECURE_OPTIONS);
      await AsyncStorage.removeItem(KEYS.token);
    }
    return legacy;
  }

  return AsyncStorage.getItem(KEYS.token);
}

async function writeToken(token: string) {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(KEYS.token, token, SECURE_OPTIONS);
    await AsyncStorage.removeItem(KEYS.token);
    return;
  }

  await AsyncStorage.setItem(KEYS.token, token);
}

async function deleteToken() {
  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(KEYS.token);
  }
  await AsyncStorage.removeItem(KEYS.token);
}

async function wipeRememberPassword() {
  await AsyncStorage.removeItem(KEYS.rememberPassword);
}

export const storage = {
  async getToken() {
    return readToken();
  },
  async setToken(token: string) {
    await writeToken(token);
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
  async getRememberEmail() {
    await wipeRememberPassword();
    return AsyncStorage.getItem(KEYS.rememberEmail);
  },
  async setRememberEmail(email: string | null) {
    await wipeRememberPassword();
    if (email) {
      await AsyncStorage.setItem(KEYS.rememberEmail, email);
      return;
    }
    await AsyncStorage.removeItem(KEYS.rememberEmail);
  },
  async clearRememberedEmail() {
    await wipeRememberPassword();
    await AsyncStorage.removeItem(KEYS.rememberEmail);
  },
  async setSession(data: AuthUserResponseData) {
    await writeToken(data.token);
    await AsyncStorage.multiSet([
      [KEYS.user, JSON.stringify(data.user)],
      [KEYS.permissions, JSON.stringify(data.permissions)],
      [KEYS.userId, data.user?.id != null ? String(data.user.id) : ""],
      [KEYS.name, data.user?.name ?? ""],
      [KEYS.email, data.user?.email ?? ""],
    ]);
    await AsyncStorage.removeItem(KEYS.token);
  },
  async clear() {
    await deleteToken();
    await AsyncStorage.multiRemove([
      KEYS.token,
      KEYS.user,
      KEYS.userId,
      KEYS.name,
      KEYS.email,
      KEYS.permissions,
      KEYS.rememberPassword,
    ]);
  },
};
