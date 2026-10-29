import { Temperature } from "./open_weather";

const BASE_URL = "http://127.0.0.1:8000";

/* ---------- Types ---------- */

export interface FavoriteAddRequest {
  user_id: number;
  account_type: string;
  email: string;
  city: string ;
  offset:number;
  temp: Temperature;
  daytime: string;
  climate: string;
  country: string;
  country_code: string;
  territory: string;
}

export interface FavoriteSchemes {
  fav_id: string;
  user_id: number;
  city: string;
  daytime: string;
  climate: string;
  country: string;
  country_code: string;
  offset: number;
  temp: Temperature;
  territory: string;
  time: string ;
  full_date: string;
}

export interface FavoriteResponse {
  detail: string;
  fav_list: FavoriteSchemes[];
}

export interface DeleteResponse {
  detail: string;
  fav_delete: FavoriteSchemes[];
}

export interface CredentialsPayload {
  user_id: number;
  email: string;
  account_type: string;
}

/* ---------- 1. Get Favorite List ---------- */
export async function getFavoriteAdd(
  input: FavoriteAddRequest
): Promise<FavoriteResponse> {
  try {
    const res = await fetch(`${BASE_URL}/favorite_add`, {
      method: "POST", // លុបចន្លោះចេញ
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input), // ផ្ញើជា JSON Body
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.detail ?? `Request failed (${res.status})`);
    }
    return data as FavoriteResponse;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Network error. Please try again.");
  }
}

export async function getFavoriteList(
  user_id: number,
  email: string,
  account_type: string
): Promise<FavoriteResponse> {
  try {
    const params = new URLSearchParams({
      user_id: user_id.toString(),
      email: email,
      account_type: account_type,
    });

    const res = await fetch(`${BASE_URL}/favorite_list?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.detail ?? `Request failed (${res.status})`);
    }
    return data as FavoriteResponse;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Network error. Please try again.");
  }
}

/* ---------- 2. Delete All Favorites ---------- */
export async function deleteAllFavorites(
  payload: CredentialsPayload
): Promise<DeleteResponse> {
  try {
    const params = new URLSearchParams({
      user_id: payload.user_id.toString(),
      email: payload.email,
      account_type: payload.account_type
    })
    const res = await fetch(`${BASE_URL}/favorite_delete_all?${params}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.detail ?? `Request failed (${res.status})`);
    }
    return data as DeleteResponse;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Network error. Please try again.");
  }
}

/* ---------- 3. Delete Specific Favorite by ID ---------- */
export async function deleteFavoriteById(
  fav_id: string,
  payload: CredentialsPayload
): Promise<DeleteResponse> {
  try {
      const params = new URLSearchParams({
      user_id: payload.user_id.toString(),
      email: payload.email,
      account_type: payload.account_type
    })
    const res = await fetch(`${BASE_URL}/favorite_delete/${fav_id}?${params}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.detail ?? `Request failed (${res.status})`);
    }
    return data as DeleteResponse;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Network error. Please try again.");
  }
}