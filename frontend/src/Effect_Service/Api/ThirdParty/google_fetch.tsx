const BASE_URL = "https://weather-application-backend-5fb0.onrender.com";


export interface GoogleUserInfo {
  id: number;
  full_name: string;
  gmail: string;
  role: string;
  is_active: boolean;
  account_type: string; 
  country:string
  profile: string;
  create_at: string;
}

export interface GoogleAuthResponse {
  detail: string;
  access_token: string;
  token_type: string;
  refresh_token:string;
  user_info: GoogleUserInfo;
}

async function postGoogle(path: string, token: string): Promise<GoogleAuthResponse> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
 
  const data = await res.json();
 
  if (!res.ok) throw new Error(data?.detail ?? `Request failed (${res.status})`);
  return data as GoogleAuthResponse;
}

export const googleSignIn = (token: string) =>
  postGoogle("/auth/google/google_signin", token);

export const googleLogin = (token: string) =>
  postGoogle("/auth/google/google_login", token);

/* ---------- Google Identity Services helper ---------- */
declare global {
  interface Window {
    google?: any;
  }
}


const GOOGLE_CLIENT_ID="861684131854-noibsnasaj1rsqlpqe7onma2t3af6po6.apps.googleusercontent.com";

export function requestGoogleIdToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      reject(new Error("Google Identity Services not loaded"));
      return;
    }
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        if (response?.credential) resolve(response.credential);
        else reject(new Error("No credential returned from Google"));
      },
    });
    window.google.accounts.id.prompt();
  });
}

// delete account
export interface DeleteUserRequest {
  gmail: string;
  account_type: string;
}

export async function deleteGoogleAccount(data: DeleteUserRequest): Promise<any> {
  const res = await fetch(`${BASE_URL}/delete_google`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to delete google account");
  return res.json();
}