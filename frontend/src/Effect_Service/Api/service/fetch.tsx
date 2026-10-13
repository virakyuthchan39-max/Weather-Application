const BASE_URL = "http://127.0.0.1:8000";

/* ---------- Request / Response types ---------- */
export interface CreateUserRequest {
  first_name: string;   // 3–20
  last_name: string;    // 3–20
  gmail: string;
  password: string;     // 8–400
}

export interface LoginUserRequest {
  gmail: string;
  password: string;     // 8–400
}

export interface UserInfo {
  id: number;
  full_name: string;
  gmail: string;
  is_active: boolean;
  role: string;
  create_at?: string;
  login_at?: string;
}

export interface AuthResponse {
  detail: string;
  access_token: string;
  token_type: string;
  user_info: UserInfo;
}

/* ---------- Core request helper ---------- */
async function request<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      // FastAPI returns { detail: "..." } on errors
      throw new Error(data?.detail ?? `Request failed (${res.status})`);
    }
    return data as T;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Network error. Please try again.");
  }
}

/* ---------- API calls ---------- */
export const createAccount = (payload: CreateUserRequest): Promise<AuthResponse> =>
  request<AuthResponse>("/createAccount", payload);

export const loginAccount = (payload: LoginUserRequest): Promise<AuthResponse> =>
  request<AuthResponse>("/loginAccount", payload);

/* ---------- Token helpers ---------- */
export const saveToken = (token: string) => localStorage.setItem("access_token", token);
export const getToken = () => localStorage.getItem("access_token");
export const clearToken = () => localStorage.removeItem("access_token");

