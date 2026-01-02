import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  customerId: string | null;
}

export interface AuthResponse {
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/login", { email, password });
  return response.json();
}

export async function register(data: {
  email: string;
  password: string;
  companyName?: string;
  customerType?: string;
}): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/register", data);
  return response.json();
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

export async function getCurrentUser(): Promise<AuthResponse | null> {
  try {
    const response = await fetch("/api/auth/me", { credentials: "include" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
