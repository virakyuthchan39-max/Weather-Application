import { useState, useEffect } from "react";
import { fetchDefaultLocation } from "../Effect_Service/Api/service/default_city_location";
import { fetchWeather, type WeatherResponse } from "../Effect_Service/Api/service/open_weather";

export const useWeatherService = () => {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [daytime,setDaytime] = useState("");
  const fetchCityWeather = async (targetCity: string) => {
    if (!targetCity) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchWeather(targetCity);
      setWeather(res);
      setDaytime(res.weather.daytime)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDefault = async () => {
      try {
        const res = await fetchDefaultLocation();
        setCity(res.location.city);
        fetchCityWeather(res.location.city);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load default location"
        );
      }
    };
    loadDefault();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCityWeather(city);
  };

  return {
    weather,
    city,
    daytime,
    setCity,
    error,
    loading,
    handleSearch,
  };
};