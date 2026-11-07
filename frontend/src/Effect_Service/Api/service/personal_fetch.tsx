
const BASE_URL = "https://weather-application-backend-5fb0.onrender.com";

export interface PersonalRequest {
  id: number;
  full_name: string;
  gmail: string;
  account_type: string;
  bio: string;
  profile: string;
}

export interface PersonalUserInfo {
  id: number;
  full_name: string;
  gmail: string;
  account_type: string;
  change_at: string;
  bio: string;
  profile: string;
}

export interface PersonalResponse {
  detail: string;
  user_info: PersonalUserInfo;
}

export async function savePersonalAccount(data: PersonalRequest): Promise<PersonalResponse> {
  const res = await fetch(`${BASE_URL}/PersonalAccount`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save personal account");
  return res.json();
}

export async function getPersonalAccount(
  gmail: string,
  account_type: string,
  user_id: number
): Promise<PersonalResponse> {
  const params = new URLSearchParams({
    gmail,
    account_type,
    user_id: String(user_id),
  });

  const res = await fetch(`${BASE_URL}/PersonalInfo?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch personal info");
  return res.json();
}