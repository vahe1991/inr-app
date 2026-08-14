export type LoginPayload = {
  email: string;
  password: string;
};

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  username: string;
  created_at: string;
  updated_at: string;
  permissions: unknown[];
}

export type LoginResponse = {
  data: {
    token: string;
    user?: User;
  };
};

export type LogoutResponse = { data?: unknown };
