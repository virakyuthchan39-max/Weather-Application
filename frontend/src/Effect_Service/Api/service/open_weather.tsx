const BASE_URL = "https://weather-application-backend-5fb0.onrender.com";

export interface WindySchemes{
  gust: number;
  deg: number;
  speed: number;
  direction: string;
}
/* ---------- Types ---------- */
export interface WeatherInfo {
  daytime: string;
  climate: string;
  wind:WindySchemes;
}

export interface Temperature {
  celsius: number;
  kelvin: number;
  fahrenheit: number;
  feel_like_celsius:number;
  feel_like_kelvin: number;
  feel_like_farhrenheit: number;
  feel_like_level:string;
  humidity: number;
  visibility: number;
  pressure: number;
}

export interface LocationInfo {
  country: string;
  city: string;
  lat: number;
  lon: number;
  country_code: string;
  territory: string;
}

export interface DateTimeInfo {
  current_time: string;
  local_time: string;
  offset:number;
  full_date: string;
  dt: number;
}

export interface WeatherResponse {
  weather: WeatherInfo;
  temperature: Temperature;
  level: string;
  location: LocationInfo;
  datetime: DateTimeInfo;
}


/* ---------- Fetch weather by city ---------- */
export async function fetchWeather(city: string,country_code:string,lat:number,lon:number): Promise<WeatherResponse> {
  try {
    const url = `${BASE_URL}/weather?city=${encodeURIComponent(city)}&country_code=${encodeURIComponent(country_code)}&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
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


