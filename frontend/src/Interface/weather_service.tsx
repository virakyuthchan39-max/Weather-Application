import { useState, useEffect } from "react";
import { fetchDefaultLocation } from "../Effect_Service/Api/service/default_city_location";
import { fetchWeather, type WeatherResponse } from "../Effect_Service/Api/service/open_weather";

export const useWeatherService = () => {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [daytime, setDaytime] = useState("");
  const [cloneCity, setClone] = useState("");
  const [Coord,setCoord] = useState({lat:0,lon:0})
  const [locationUser,SetUserLocation] = useState({city:"",country:""})
  
  // ១. កែឱ្យ country ក្លាយជា Optional (មាន ឬគ្មានក៏បាន)
    const fetchCityWeather = async (
    targetCity: string, 
    country: string = "", 
    lat: number = 0, 
    lon: number = 0,
    suggestionTerritory: string = "",
    suggestionCountry: string = "",    
    suggestionCountryCode: string = "" 
  ) => {
    if (!targetCity) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchWeather(targetCity, country, lat, lon);
      
      if (res && res.location) {
        let territory = res.location.territory; 
        
        // ✅ បើ API មិនបញ្ជូនខេត្តមក (ឬ N/A) តែយើងមានឈ្មោះខេត្តពី Suggestion យើងយកវាមកប្រើជំនួស
        if ((!territory || territory.toUpperCase() === "N/A" || territory.trim() === "") && suggestionTerritory) {
          territory = suggestionTerritory;
          res.location.territory = suggestionTerritory; // រក្សាទុកក្នុង Object ដើម្បីងាយស្រួលពេល Save Favorite
        }
      // if lat and lon aren't None
        if (res.location.lat !== undefined && res.location.lon !== undefined){setCoord({lat:res.location.lat,lon:res.location.lon})}
        // បញ្ចូលឈ្មោះខេត្តទៅក្នុងឈ្មោះទីក្រុង
        if (territory && territory.trim() !== "" && territory.toUpperCase() !== "N/A" && territory.toLowerCase() !== targetCity.toLowerCase()) {
          res.location.city = `${targetCity.toLowerCase().trim().split(/\s+/).map((word)=>word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}${territory.includes(targetCity) ? "" : `, ${territory}`}`;
        } else {
          res.location.city = targetCity.toLowerCase().trim().split(/\s+/).map((word)=>word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        }
        if (!res.location.country_code || res.location.country_code === "N/A" || res.location.country_code === "") {
          res.location.country_code = suggestionCountryCode;
        }
        if (!res.location.country || res.location.country === "N/A" || res.location.country === ""){res.location.country = suggestionCountry;}
        
        setClone(targetCity);
      }

      setWeather(res);
      setDaytime(res.weather.daytime);
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
        setCoord({lat:res.location.lat,lon:res.location.lon})
        SetUserLocation({city:res.location.city,country:res.location.country})
        fetchCityWeather(res.location.city, res.location.country || "");
        
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load default location"
        );
      }
    };
    loadDefault();
  }, []);


  const handleSearch = (e: React.SubmitEvent) => {
    e.preventDefault();
    const parts = city.split(",");
    const cityName = parts[0].trim();
    const countryOrTerritory = parts.length > 1 ? parts[1].trim() : "";
    

    fetchCityWeather(cityName, "", 0, 0, countryOrTerritory);
  };

  return {
    Coord,
    cloneCity,
    weather,
    city,
    daytime,
    setCity,
    setLoading,
    error,
    setError,
    locationUser,
    loading,
    handleSearch,
    fetchCityWeather, 
  };
};