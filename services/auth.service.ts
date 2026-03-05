import { api } from "@/lib/api";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: "CANDIDATE" | "COMPANY";
    profile: Record<string, unknown>;
  };
  token: string;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role: "CANDIDATE" | "COMPANY";
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", data);
  return res.data;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
}
