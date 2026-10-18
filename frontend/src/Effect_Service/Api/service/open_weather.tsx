const BASE_URL = "http://127.0.0.1:8000";

/* ---------- Types ---------- */
export interface WeatherInfo {
  daytime: string;
  climate: string;
}

export interface Temperature {
  celsius: number;
  kelvin: number;
  fahrenheit: number;
}

export interface LocationInfo {
  country: string;
  city: string;
  territory: string;
}

export interface DateTimeInfo {
  current_time: string;
  full_date: string;
}

export interface WeatherResponse {
  weather: WeatherInfo;
  temperature: Temperature;
  level: string;
  location: LocationInfo;
  datetime: DateTimeInfo;
}



/* ---------- Fetch weather by city ---------- */
export async function fetchWeather(city: string): Promise<WeatherResponse> {
  try {
    const url = `${BASE_URL}/weather?city=${encodeURIComponent(city)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.detail ?? `Request failed (${res.status})`);
    }
    return data as WeatherResponse;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Network error. Please try again.");
  }
}


