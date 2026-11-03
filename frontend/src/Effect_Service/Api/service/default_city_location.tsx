const BASE_URL="http://127.0.0.1:8000"

export interface DefaultLocationResponse {
  location: {
    lat:number;
    lon:number;
    city: string;
    country: string;
  };
}

/* ---------- Fetch default location ---------- */
export async function fetchDefaultLocation(): Promise<DefaultLocationResponse> {
  try {
    const res = await fetch(`${BASE_URL}/default_location`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.detail ?? `Request failed (${res.status})`);
    }
    return data as DefaultLocationResponse;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Network error. Please try again.");
  }
}
