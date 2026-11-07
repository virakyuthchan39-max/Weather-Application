const BASE_URL = "https://weather-application-backend-5fb0.onrender.com";
const FACEBOOK_APP_ID = "1435360588551170";

declare global {
  interface Window {
    FB?: any;
  }
}

 
export interface FacebookUserInfo {

  id: number;
  full_name: string;
  gmail: string;
  role: string;
  is_active: boolean;
  profile: string;
  country:string
  account_type:string
  create_at: string;

}

export interface FacebookAuthResponse {
  detail: string;
  access_token: string;
  token_type: string; 
  refresh_token:string;
  user_info: FacebookUserInfo;
}

/* ---------- ចាប់ផ្តើម FB SDK ---------- */
function initFacebookSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error("Facebook SDK not loaded"));
      return;
    }
    window.FB.init({
      appId: FACEBOOK_APP_ID,
      cookie: true,
      xfbml: false,
      version: "v19.0",
    });
    resolve();
  });
}

/* ---------- បើក popup → user ជ្រើស account → ទាញ accessToken ---------- */
export async function requestFacebookToken(): Promise<string> {
  await initFacebookSdk();

  return new Promise((resolve, reject) => {
    window.FB.login(
      (response: any) => {
        const token = response?.authResponse?.accessToken;
        if (token) resolve(token);
        else reject(new Error("Facebook login cancelled or failed"));
      },
      { scope: "email,public_profile" }
    );
  });
}

/* ---------- POST ទៅ backend ---------- */
async function postFacebook(path: string, token: string): Promise<FacebookAuthResponse> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.detail ?? `Request failed (${res.status})`);
    return data as FacebookAuthResponse;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Network error. Please try again.");
  }
}

export const facebookSignIn = (token: string) =>
  postFacebook("/auth/Facebook/Facebook_signin", token);

export const facebookLogin = (token: string) =>
  postFacebook("/auth/Facebook/Facebook_login", token);


// delete account

// ...existing imports/exports...

export interface DeleteUserRequest {
  gmail: string;
  account_type: string;
}

export async function deleteFacebookAccount(data: DeleteUserRequest): Promise<any> {
  const res = await fetch(`${BASE_URL}/delete_facebook`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to delete facebook account");
  return res.json();
}