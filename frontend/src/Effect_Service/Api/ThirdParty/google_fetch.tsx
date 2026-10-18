const BASE_URL = "http://127.0.0.1:8000";

 
 
export interface GoogleUserInfo {
  id: number;
  username: string;
  gmail: string;
  role: string;
  is_active: boolean;
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
 

 
console.log(window.location.href)


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