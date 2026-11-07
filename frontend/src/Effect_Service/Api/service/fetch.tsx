const BASE_URL = "https://weather-application-backend-5fb0.onrender.com";

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
  account_type: string;
  country:string;
  login_at?: string;
}

export interface AuthResponse {
  detail: string;
  access_token: string;
  token_type: string;
 
 
  refresh_token:string;

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

// logout
export interface LogoutUserRequest {
  gmail: string;

}

export interface LogoutSchema {
  id: number;
  full_name: string;
  gmail: string;
  logout_at: string;
  is_active: boolean;
  role: string;
}

export interface LogoutResponse {
  detail: string;
  user_info: LogoutSchema;
}

export async function logoutAccount(payload: LogoutUserRequest): Promise<LogoutResponse> {
  try {
    const token = getToken();
    
    const res = await fetch(`${BASE_URL}/logoutAccount`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // ✅ ត្រូវការ Token តាម Backend
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.detail ?? `Request failed (${res.status})`);
    }
    return data as LogoutResponse;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Network error. Please try again.");
  }
}


/* ---------- Token helpers ---------- */
export const saveToken = (token: string) => localStorage.setItem("access_token", token);
export const getToken = () => localStorage.getItem("access_token");
export const clearToken = () => localStorage.removeItem("access_token");



export async function logoutGoogle(payload: LogoutUserRequest): Promise<LogoutResponse> {
  try {
    const token = getToken()
    const res = await fetch(`${BASE_URL}/logout_google`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // ✅ ត្រូវការ Token តាម Backend
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.detail ?? `Request failed (${res.status})`);
    return data as LogoutResponse;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Network error. Please try again.");
  }
}

export async function logoutGithub(payload: LogoutUserRequest): Promise<LogoutResponse> {
  try {
   const token = getToken()
    const res = await fetch(`${BASE_URL}/logout_github`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.detail ?? `Request failed (${res.status})`);
    return data as LogoutResponse;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Network error. Please try again.");
  }
}

export async function logoutFacebook(payload: LogoutUserRequest): Promise<LogoutResponse> {
  try {
   const token = getToken()
    const res = await fetch(`${BASE_URL}/logout_facebook`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // ✅ ត្រូវការ Token តាម Backend
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.detail ?? `Request failed (${res.status})`);
    return data as LogoutResponse;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Network error. Please try again.");
  }
}
export const saveUserInfo = (user: UserInfo) => localStorage.setItem("user_info", JSON.stringify(user));
export const getUserInfo = (): UserInfo | null => {
  const data = localStorage.getItem("user_info");
  return data ? JSON.parse(data) : null;
};
export const clearUserInfo = () => localStorage.removeItem("user_info");


// delete account
// ...existing imports/exports...

export interface DeleteAccountRequest {
  gmail: string;
  account_type: string;
}

export async function deleteAccount(data: DeleteAccountRequest): Promise<any> {
  const res = await fetch(`${BASE_URL}/deleteAccount`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to delete account");
  return res.json();
}