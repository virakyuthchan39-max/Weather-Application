const BASE_URL = "http://127.0.0.1:8000";

const GITHUB_CLIENT_ID = "Ov23liBQknBp1XcqjPs9";


export interface GithubAuthResponse {
  detail: string;
  access_token: string;
  token_type: string;
  user_info: Record<string, unknown>;
}

/* ---------- បើកទំព័រ GitHub ឱ្យ user ជ្រើស account ---------- */
export function startGithubOAuth(): void {
  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${GITHUB_CLIENT_ID}` +
    `&scope=read:user user:email`;
  window.location.href = url;
}

/* ---------- អាន ?code= ពី URL ក្រោយ GitHub redirect ត្រឡប់មក ---------- */
export function getGithubCodeFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

/* ---------- សម្អាត ?code= ចេញពី URL ---------- */
export function clearGithubCodeFromUrl(): void {
  const clean = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, clean);
}

/* ---------- POST ទៅ backend ---------- */
async function postGithub(path: string, code: string): Promise<GithubAuthResponse> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: code }),   // backend ទទួល field "token"
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.detail ?? `Request failed (${res.status})`);
    return data as GithubAuthResponse;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Network error. Please try again.");
  }
}

export const githubSignIn = (code: string) =>
  postGithub("/auth/github/github_signin", code);

export const githubLogin = (code: string) =>
  postGithub("/auth/github/github_login", code);



