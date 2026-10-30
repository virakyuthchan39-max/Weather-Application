import React, { useState, useEffect, useRef } from 'react';
import "./weather.css";
import "../Interface/welcome/account.css";
import Background,{getWeatherIcon} from "./Background";

import { fetchWeather } from '../Effect_Service/Api/service/open_weather.tsx';
import { useWeatherService} from "./weather_service";
import { playButtonSound,playAnimeClick,playSlideOn,playSlideOff} from '../Effect_Service/sound_effect';
import { WeatherMusicPlay } from '../Effect_Service/background_music';
import MusicList from '../Interface/weather/music_list';
// favorite_list called
import FavoriteHistory from '../Effect_Service/favorite_history.tsx';
import { FavoriteSchemes, getFavoriteList, deleteFavoriteById, deleteAllFavorites, getFavoriteAdd } from '../Effect_Service/Api/service/favorite.tsx';
// called the similar city API
import FetchSimilarCity, {SimilarSchemes} from '../Effect_Service/Api/service/similar_city_fetch';
import SimilarCity from './weather/similar_city.tsx';
// called google map
import WeatherMap from './weather/map.tsx';
// logout called
import { logoutAccount,   logoutGoogle, logoutGithub, logoutFacebook,  clearToken } from '../Effect_Service/Api/service/fetch';

interface WeatherProps {
  user: {
    id: number;
    gmail: string;
    account_type: string;
    username?: string;
    full_name?: string;
  };
  onLogout?: () => void;
  onDetail?: () => void;
}

const Weather: React.FC<WeatherProps> = ({ user, onLogout, onDetail }) => {
   const user_id = user.id;
  const email = user.gmail;
  const account_type = user.account_type;
  const username = user.full_name;
  const {
    Coord,
    cloneCity,
    weather,
    daytime,
    setError,
    city,
    setCity,
    error,
    handleSearch,
     fetchCityWeather,
  } = useWeatherService();

  const [open, setOpen] = useState(false);
  const [settingClick, setSettingClick] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logouting,setLogouting] = useState(false);
  const [LevelIcon, setLevelIcon] = useState("");

  const settingsRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {playAnimeClick(); setOpen((prev) => !prev)};
  const closeSidebar = () => {playAnimeClick();setOpen(false)};

  const handleSettingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playAnimeClick();
    setSettingClick((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        playAnimeClick();
        setSettingClick(false);
      }
    };
    if (settingClick) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [settingClick]);

 
  const [isCelsius,setIsCelsius] = useState(true);
  const [isKevin,setIsKevin] = useState(false);
  const [isfarh,setIsfarh] = useState(false);
  const [islocalHour,setIsLocalHours]  = useState(false);
  const [isForecastOn, setIsForecastOn] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFavoriteCity, setIsFavoriteCity] = useState(true);

  const [isMusicStart, setMusicStart] = useState(false);
  const [isEffectOn, setEffectOn] = useState(true);
  const [isKm,setKm] = useState(false)
  const [isMeter,setMeter] = useState(true);
  const [isMile,setMile] =useState(false)
  const [showHistory, setShowHistory] = useState(false);
  const [favList, setFavList] = useState<FavoriteSchemes[]>([]);
  const [mapCoord,setMapCoords] = useState({lat:0,lon:0});
  const [isWindySecond,setWindySecond] = useState(true);

  // play username overflow animation
  const textRef = useRef<HTMLSpanElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    if (textRef.current) {
      // គណនាចម្ងាយដែលលើសពីទទឹងប្រអប់ (បើលើស)
      const diff = textRef.current.scrollWidth - textRef.current.clientWidth;
      setScrollDistance(diff > 0 ? diff : 0);
    }
  }, [username])

  // create the continue timeclock
  const [liveClock,setLiveTime] = useState("")
    useEffect(() => {
    if (!weather?.datetime?.offset) return;

    const updateClock = () => {
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const cityTime = new Date(utcTime + (weather.datetime.offset * 1000));
      
      // ទាញយកម៉ោង នាទី និងវិនាទី
      let hours = cityTime.getHours();
      const minutes = cityTime.getMinutes().toString().padStart(2, '0');
      const seconds = cityTime.getSeconds().toString().padStart(2, '0');
      
 

      if (!islocalHour) {
        // បើជា 12H ធម្មតា (មាន AM/PM ស្រាប់)
        setLiveTime(cityTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }));
      } else {
        // ✅ បើជា 24H តែចង់បាន AM/PM ដែរ យើងត្រូវ Format ដោយខ្លួនឯង
        const formatted24H = `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
        setLiveTime(formatted24H);
      }
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, [weather, islocalHour]);



    // changing the icon level (average/cold/hot)
  useEffect(() =>{
    if (!weather) return;
    const level = weather.level.toLowerCase();
    const modePath = isDarkMode ? "daymode":"darkmode";
    if (level === "hot" || level === "extremely hot") {
      setLevelIcon("/Icon/weather icon/feature/hot.svg");
    } else if (level === "cold" || level === "extremely cold") {
      setLevelIcon("/Icon/weather icon/feature/cold.svg");
    } else if (level === "average") {
      setLevelIcon(`/Icon/weather icon/feature/${modePath}/average_${isDarkMode ? "black" : "white"}.svg`);
    }
  },[weather,isDarkMode])
  
  const handleWindySpeedClick = () => {
  
    if(isWindySecond)   playSlideOn()
      setWindySecond(!isWindySecond)
     playSlideOff()
  }



  const handleForecastClick =()=>{
       if(isForecastOn) playSlideOn();
  
       setIsForecastOn(!isForecastOn)
       playSlideOff()
  }

  const handleMusicClick = () =>{
    if(isMusicStart) playSlideOn()
    setMusicStart(!isMusicStart);
  }

  const handleTemperatureClick = () => {
    playSlideOn();
    if (isCelsius) {
      setIsCelsius(false);
      setIsfarh(true);
      setIsKevin(false);
    } else if (isfarh) {
      setIsCelsius(false);
      setIsfarh(false);
      setIsKevin(true);
    } else if (isKevin) {
      setIsCelsius(true);
      setIsfarh(false);
      setIsKevin(false);
    }
  };

  const handleMeassureClick = () =>{
      playSlideOn();
    if (isKm) {
      setKm(false);
      setMeter(true);
      setMile(false);
    } else if (isMeter) {
      setKm(false);
      setMeter(false);
      setMile(true);
    } else if (isMile) {
      setKm(true);
      setMeter(false);
      setMile(false);
    }
  }

  const handleEffectClick = () =>{
    if(!isEffectOn) playSlideOff();
    setEffectOn((prev) => !prev)
    playSlideOn()

}
  const handleFavoriteClick = () =>{
    if(isFavoriteCity) playSlideOn()
    setIsFavoriteCity(!isFavoriteCity);
    playSlideOff()
  }
  const handleModeClick = () =>{
    if(isDarkMode) playSlideOn()
    setIsDarkMode(!isDarkMode);
    playSlideOff()
  }
  const handleHourClick = () =>{
    if(islocalHour) playSlideOn()
    setIsLocalHours(!islocalHour);
    playSlideOff()
  }
  

  useEffect(() => {
    fetchFavorites();
  }, []);

  // ២. គណនា isStarred ដោយផ្ទាល់
  const isStarred = favList.some(
    (fav) => fav.city === weather?.location.city 
    && fav.country_code === weather?.location.country_code 


  );

 const handleStarClick = async () => {
   playAnimeClick();
  
  if (favList.length >= 20) return  setError("Your limit favorite city is only 20 at below !")
 ;
  if (!isStarred ) {
    const current_city = weather?.location.city;
    const current_country = weather?.location.country;
    const current_country_code= weather?.location.country_code;
    const isAntarctica = current_city?.toLowerCase().includes("antarctica");

   if (!current_city || (!isAntarctica && (!current_country || !current_country_code))) return;
    const tempFav: FavoriteSchemes = {
        fav_id: "temp-" + Date.now(),
        user_id: user_id,
        city: current_city,
        country: current_country || (isAntarctica ? "N/A":""),
        country_code: current_country_code || "",
        daytime:weather.weather.daytime,
        climate: weather.weather.climate,
        offset: weather.datetime.offset,
        lon: weather.location.lon,
        lat: weather.location.lat,
        wind_speed: weather.weather.wind.speed,
        temp:{
          kelvin: weather.temperature.kelvin,
          celsius: weather.temperature.celsius,
          fahrenheit: weather.temperature.fahrenheit,
          feel_like_celsius: weather.temperature.feel_like_celsius,
          feel_like_level: weather.temperature.feel_like_level,
          feel_like_farhrenheit: weather.temperature.feel_like_farhrenheit,
          feel_like_kelvin: weather.temperature.feel_like_kelvin,
          pressure: weather.temperature.pressure,
          visibility: weather.temperature.visibility,
          humidity:weather.temperature.humidity
        },
        territory: weather.location.territory,
        time: "Adding...",
        full_date: "Adding..."
      };
    setFavList((prev) => [...prev, tempFav]);
    await fetchFavoritesAdd();

  } else {
    
    const target = favList.find(
      (fav) =>
        fav.city === weather?.location.city 
        && fav.country_code === weather?.location.country_code
  
    );

    if (target) {
      try {
        await deleteFavoriteById(target.fav_id, {
          user_id,
          email,
          account_type,
        });
        await fetchFavorites(); // Refresh List ក្រោយលុប

      } catch (err) {
        console.error(err);
      }
    }
  }
};

  const handleConfirmLogout = async () => {
    playButtonSound();
    setLogouting(true);
    try {
      // ពិនិត្យមើល Account Type ដើម្បីហៅ API ឱ្យត្រូវ
      if (account_type === "Google") {
        await logoutGoogle({ gmail: email });
      } else if (account_type === "Github") {
        await logoutGithub({ gmail: email });
      } else if (account_type === "Facebook") {
        await logoutFacebook({ gmail: email });
      } else {
        // Regular Account
        await logoutAccount({ gmail: email });
      }

      // បើជោគជ័យ -> លុប Token និងបិទ Modal
      clearToken();
      setLogouting(false)
      setShowLogoutModal(false);
      if (onLogout) {
        onLogout(); 
      }
    } catch (err) {
      console.error("Logout failed:", err);
      // ទោះបី API Error ក៏ដោយ ក៏ត្រូវលុប Token ក្នុងម៉ាស៊ីនអ្នកប្រើចោលដែរ
      clearToken();
      setLogouting(false)
      setShowLogoutModal(false);
      if (onLogout) {
        onLogout(); 
      }
    }
  };
  const handleAboutClick = ()=>{
     playButtonSound()
  }
 
  const handleSummaryClick = () =>{
    playButtonSound()
  }

  const handleDeclineButton = () =>{
    playButtonSound();
    setShowLogoutModal(false)
  }

  //play the music switching
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [currentMusic, setCurrentMusic] = useState("/Audio/Music/weather/Stay_justin_bieber.mp3");
   const handleChangeMusic = () =>{
    playButtonSound();
    setShowMusicModal(true);
  }


   const fetchFavoritesAdd = async () => {
     const current_city = weather?.location.city;
    const current_country = weather?.location.country;
    const current_country_code = weather?.location.country_code;
    const isAntarctica = current_city?.toLowerCase().includes("antarctica");
    const FavLengthList = await getFavoriteList(user_id, email, account_type);
    if (FavLengthList.fav_list.length >=20) return setError("Your limit favorite city is only 20 at below !")

    if (!current_city || (!isAntarctica && (!current_country || !current_country_code))) return
    
    try {
      const res = await getFavoriteAdd({
        user_id: user_id,
        account_type: account_type,
        email: email,
        city: weather.location.city,
        country: weather.location.country || "N/A",
        country_code:weather.location.country_code || "",
        daytime:weather.weather.daytime,
        climate: weather.weather.climate,
        lon: weather.location.lon,
        lat: weather.location.lat,
        offset: weather.datetime.offset,
        wind_speed: weather.weather.wind.speed,
        temp:{
          kelvin: weather.temperature.kelvin,
          celsius: weather.temperature.celsius,
          fahrenheit: weather.temperature.fahrenheit,
          feel_like_celsius: weather.temperature.feel_like_celsius,
          feel_like_level: weather.temperature.feel_like_level,
          feel_like_farhrenheit: weather.temperature.feel_like_farhrenheit,
          feel_like_kelvin: weather.temperature.feel_like_kelvin,
          pressure: weather.temperature.pressure,
          visibility: weather.temperature.visibility,
          humidity:weather.temperature.humidity
        },
        territory: weather.location.territory
      }); 
     
      setFavList(res.fav_list);
    } catch (err) {
      console.error("Failed to fetch favorites", err);
    }
  };



  const fetchFavorites = async () => {
    try {
      const res = await getFavoriteList(user_id, email, account_type);
      setFavList(res.fav_list)
      
    } catch (err) {
      console.error("Failed to fetch favorites", err);
    }
  };

  const handleOpenHistory = () => {
    playButtonSound();
    setShowHistory(true);
    fetchFavorites();
  };

 const handleDeleteFavorite = async (fav_id: string) => {
    try {
      // លុបចេញពី UI ភ្លាមៗ
      setFavList((prev) => prev.filter((f) => f.fav_id !== fav_id));
      
      // ហៅ API
      await deleteFavoriteById(fav_id, { user_id, email, account_type });
      await fetchFavorites();
    } catch (err) {
      console.error(err);
      fetchFavorites();
    }
  };

  const handleDeleteAllFavorites = async () => {
    try {
      await deleteAllFavorites({ user_id, email, account_type });
      fetchFavorites();
    } catch (err) {
      console.error(err);
    }
  };
  
  // Similar city fetch
  // const [allSimilarCities, setAllSimilarCities] = useState<SimilarSchemes[]>([]);

  const [suggestions, setSuggestions] = useState<SimilarSchemes[]>([]);
  const handleSearchFromHistory = (selectCity:string,country_code:string,lat:number,lon:number) =>{
    if(error.includes("429")) return
    setShowHistory(false);
    if (selectCity.includes(",")){
        const CityName = selectCity.split(",")[0].trim();
         setCity(CityName);
        fetchCityWeather(CityName,country_code,lat,lon)
    }
    else {
    setCity(selectCity)
    fetchCityWeather(selectCity,country_code,lat,lon)
   
    }
  }
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if(error.includes("429")) return
    const val = e.target.value;
    setCity(val);

    if (val.length >= 2) { 
      try {
        // ✅ ហៅ API ពិតប្រាកដទៅកាន់ Backend រាល់ពេលវាយអក្សរ
        const data = await FetchSimilarCity(val);
        setSuggestions(data.city_list_info);
      } catch (err) {
        console.error(err);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]); 
    }
  };

  // ពេលចុចជ្រើសរើសពី Suggestion
  const handleSelectSuggestion = (item: SimilarSchemes) => {
    setCity(item.city);
    setSuggestions([]);
    setMapCoords({ lat: item.lat, lon: item.lon }); 
    // ✅ បញ្ជូន item.type ជា Argument ទី ៥ ទៅឱ្យ fetchCityWeather
    fetchCityWeather(item.city, item.country_code, item.lat, item.lon, item.type, item.country, item.country_code);
  
  };
    const handleFormSubmit = async (e: React.SubmitEvent) => {
      e.preventDefault();
      if(error.includes("429")) return
      if (suggestions.length > 0) {
        const targetCity = city.toLowerCase().trim();

        if (targetCity === "antarctica") {
        setCity("Antarctica");
        setSuggestions([]);
        fetchCityWeather("Antarctica", "");
        return; // Stop here, don't look for suggestions
        }

        let currentSuggestions = suggestions;
        if (currentSuggestions.length === 0 && city.trim().length >= 2) {
            try {
              const data = await FetchSimilarCity(city.trim());
              currentSuggestions = data.city_list_info || [];
              setSuggestions(currentSuggestions); // Update UI just in case
            } catch (err) {
              console.error("Failed to fetch suggestions on submit:", err);
            }
          }
        // 1. Find exact match
        const exactMatch = suggestions.find(s =>
          s.city.toLowerCase() === targetCity ||
          `${s.city}, ${s.country}`.toLowerCase() === targetCity ||
          (s.type && `${s.city}, ${s.type}`.toLowerCase() === targetCity
        )
        );
        
        // 2. Fallback to the first suggestion if no exact match is found
        const bestMatch = exactMatch || suggestions[0];

        if (!bestMatch) return handleSearch(e as any);
        
        handleSelectSuggestion(bestMatch);
        setSuggestions([]);
      } else {
        // If the user pressed Enter before the fetch finished, do a normal search
        handleSearch(e as any);
      }
    };
    const [refresh,setRefresh] = useState(false);
    const refreshTimeoutRef = useRef<number|null>(null)
    const handleRefresh = async () => {
    playAnimeClick();
    if(error.includes("429")) return
    setRefresh(true);
    
    const currentCity = weather?.location.city;
    const currentCountry = weather?.location.country_code || "";
    
    // 1. Refresh main dashboard weather
    if (currentCity) {
      fetchCityWeather(currentCity, currentCountry);
    }

    // 2. Refresh ALL favorite cities in the modal
    try {
      const updatedFavs = await Promise.all(
        favList.map(async (fav) => {
          // Remove territory (e.g., "Phnom Penh, Cambodia" -> "Phnom Penh")
          const cityName = fav.city.split(",")[0].trim();
          
          const res = await fetchWeather(cityName, fav.country_code || "", fav.lat, fav.lon);
          
          if (res && res.weather) {
             // Update with fresh data from API
             return {
               ...fav,
               temp: res.temperature,
               wind_speed: res.weather.wind.speed,
               climate: res.weather.climate,
               daytime: res.weather.daytime,
               offset: res.datetime.offset,
             };
          }
          return fav;
        })
      );
      
      // Update the UI with the new data
      setFavList(updatedFavs);
    } catch (error) {
      console.error("Failed to refresh favorites", error);
    }

    // 3. Hide "Updated" text after 1.5s
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = window.setTimeout(() => {
      setRefresh(false);
    }, 1500);
  };

  // handle countdown the limited request
    const [count, setCount] = useState(60);
    const targetTimeRef = useRef<number | null>(null);

   useEffect(() => {
      if (!error || !error.includes("429")) {
        targetTimeRef.current = null; // Reset if error is gone
        return;
      }

      // Only set a new target time if there isn't an active one
      if (!targetTimeRef.current || Date.now() > targetTimeRef.current) {
        targetTimeRef.current = Date.now() + 60000;
      }

      const updateCountdown = () => {
        const remaining = Math.max(0, Math.ceil
          
        ((targetTimeRef.current! - Date.now()) / 1000));
        setCount(remaining);

        if (remaining === 0) {
          targetTimeRef.current = null;
        }
      };

      updateCountdown(); // Run immediately
      const timer = setInterval(updateCountdown, 1000);

      return () => clearInterval(timer);
    }, [error]);














  return (
    <div className= {`relative font-weather  overflow-y-auto min-h-screen w-full  font-welcome transition-colors duration-500 ${!isDarkMode ? "bg-black":"bg-white"}`}>      {/* ---------- Hamburger Button ---------- */}
      <Background climate={weather?.weather.climate || "clear_sky"} daytime={daytime} isEffectOn={isEffectOn} />
       <div className={`fixed inset-0   ${!isDarkMode ? "bg-black/15":"bg-white/20"}`} />

      <button
        type="button"
      
        onClick={toggleSidebar}
        className={`fixed top-5 left-5 z-50 flex h-12 w-12 cursor-pointer flex-col items-center justify-center rounded-lg  
          max-[400px]:h-10 max-[400px]:w-10 max-[400px]:top-4
           ${!isDarkMode ? "bg-white hover:bg-gray-400":"bg-black hover:bg-gray-500"} backdrop-blur-md shadow-lg`}
        aria-label="Toggle menu"
      >
          <span className={`bar  ${isDarkMode ? "darkmode":""} ${open ? "open-1": ""}`} />
          <span className={`bar  ${isDarkMode ? "darkmode":""} ${open ? "open-2" : ""}`} />
          <span className={`bar  ${isDarkMode ? "darkmode":""} ${open ? "open-3" : ""}`} />
      </button>

      {/* ---------- Backdrop ---------- */}
      <button
        type="button"

        onClick={closeSidebar}
        className={`fixed inset-0 z-30 transition-opacity duration-350 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ---------- Sidebar ---------- */}
      <aside
        className={`sidebar fixed top-0 left-0 z-40  h-full -backdrop-blur-[1px] w-72 ${!isDarkMode ? "bg-black/50 drop-shadow-lg/20 drop-shadow-gray-500":"bg-white/30 backdrop-blur-[2px]  font-bold text-black  drop-shadow-lg/90"}  p-6  rounded-tr-[5%] rounded-br-[5%] ${
          open ? "translate-x-0" : "-translate-x-full"} 
          max-[400px]:w-60 max-[400px]:text-[0.8rem] max-[400px]:border
        `}
      >
        <div className= {`flex mb-10 mt-20 text-[1.4em] font-extrabold text-nowrap ${!isDarkMode ? "text-white":"text-black"} max-[400px]:mt-15 max-[400px]:text-[1.1rem] relative max-[400px]:right-2 `}>
          <span className="animate-spin transition-all duration-400 -p-1">☀</span>
          <h2 className="ml-2 border-b-2  border-dashed text-linear-to-r from-cyan-400 to-blue-600">
            Weather Application
          </h2>
        </div>
        <div className="flex flex-col gap-1 text-lg overflow-y-auto  no-scrollbar h-full">
          <span className = {` flex text-xl border-dashed  font-bold mb-5 border-b-5 pb-2 justify-center ${!isDarkMode ? "text-white":"text-black "} `}>Preference
             <img 
               alt = "preference settings"
                src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/preference_white.svg":"/Icon/weather icon/feature/daymode/preference_black.svg"}
                className = "ml-1.5 w-7 h-7 animate-spin transition-all duration-800"
             />
          </span>
          <span className={` font-bold flex ${!isDarkMode ? "text-white":"text-black"} `}>Forecast <span className={`${isDarkMode ? "text-slate-900":"text-slate-400"} text-3xl relative -top-0.5`}>/</span>Map
               <img 
               alt = "forecast icon"
               src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/forecast_white.svg":"/Icon/weather icon/feature/daymode/forecast_black.svg"}
              className = {`${isDarkMode ? "w-10 h-10 pb-2.5 ml-0.5":"w-7 h-7 ml-2"}  `}/>
          </span> 
          <div onClick={handleForecastClick} className= "relative flex  cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600  shadow-inner">
                  <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400 to-blue-500  shadow-md drop-shadow-lg/90 transition-transform duration-500 ease-in-out ${isForecastOn ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
                  <div className = {`relative left-3 z-10 flex w-0.5items-center justify-center py-2 font-bold transition-colors  ${isForecastOn ? "text-white":"text-gray-400 text-shadow-gray-900 text-shadow-lg/80"}`}>ON</div>
                  <div className={`relative left-3 z-10 flex w-1/2 items-center ml-5 justify-center py-2 font-bold transition-colors  ${!isForecastOn ? 'text-white' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80'}`}>OFF</div>
            </div>
          
          <span className={` font-bold flex ${!isDarkMode ? "text-white":"text-black"} `}>Temperature 
               <img 
               alt= "temperature icon"
               src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/temperature_white.svg":"/Icon/weather icon/feature/daymode/temperature_black.svg"}
              className = {`${isDarkMode ? "w-10 h-10 pb-3 ml-1.5":"w-7 h-7 pb-1 ml-3"}  `}/>
          </span>
         <div onClick={handleTemperatureClick} className="relative flex py-3 cursor-pointer w-40 my-5 items-center justify-between px-2 rounded-full bg-gray-600 shadow-inner">

              <div className={`absolute h-9 w-11 rounded-full from-cyan-400 to-blue-500 drop-shadow-lg/90 shadow-md transition-transform duration-500 ease-in-out 
                ${isCelsius ? "translate-x-0 bg-linear-to-r" : isfarh ? "translate-x-12 bg-linear-to-r" : "translate-x-25 bg-linear-to-r"}`} 
              />
              
              {/* អក្សរ C° */}
              <div className={`relative z-10 w-10 text-center font-bold transition-colors ${isCelsius ? "text-white" : "text-gray-400 text-shadow-lg/80"}`}>°C</div>
              
              {/* អក្សរ F° */}
              <div className={`relative z-10 w-10 text-center font-bold transition-colors ${isfarh ? "text-white" : "text-gray-400 text-shadow-lg/80"}`}>°F</div>
              
              {/* អក្សរ K */}
              <div className={`relative z-10 w-10 text-center font-bold transition-colors ${isKevin ? "text-white" : "text-gray-400 text-shadow-lg/80"}`}>°K</div>
            </div>
                <span className={` font-bold flex ${!isDarkMode ? "text-white":"text-black"} `}>Meassure
                  <img src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/meassure_white.svg":"/Icon/weather icon/feature/daymode/meassure_black.svg"}
                  className = {`${isDarkMode ? "w-10 h-10 pb-3 ml-1.5":"w-8.5 h-8.5 pb-1.5 ml-2"}  `}/>
              </span>
         <button onClick={handleMeassureClick} className="relative flex py-3 cursor-pointer w-40 my-5 items-center justify-between px-2 rounded-full bg-gray-600 shadow-inner
         ">

              <div className={`absolute h-9 w-11 rounded-full from-cyan-400 to-blue-500 drop-shadow-lg/90 shadow-md transition-transform duration-500 ease-in-out 
                ${isKm ? "translate-x-0 bg-linear-to-r" : isMeter ? "translate-x-12 bg-linear-to-r" : "translate-x-25 bg-linear-to-r"}`} 
              />
              
              {/* អក្សរ C° */}
              <div className={`relative z-10 w-10 text-center font-bold transition-colors ml-0.5 ${isKm ? "text-white" : "text-gray-400 text-shadow-lg/80"}`}>Km</div>
              
              {/* អក្សរ F° */}
              <div className={`relative z-10 w-10 text-center font-bold transition-colors ${isMeter ? "text-white" : "text-gray-400 text-shadow-lg/80"}`}>M</div>
              
              {/* អក្សរ K */}
              <div className={`relative z-10 w-10 text-center font-bold transition-colors ${isMile ? "text-white" : "text-gray-400 text-shadow-lg/80"}`}>Mi</div>
          </button>
             <span className = {` font-bold flex ${!isDarkMode ? "text-white":"text-black"} `}>Windy Speed
              <img src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/wind_white.svg":"/Icon/weather icon/feature/daymode/wind_black.svg"}
              className = "w-8 h-8 ml-2 pb-1"/>
            </span>

             <button  onClick={handleWindySpeedClick} className= "relative flex cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600  shadow-inner">
                  <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400
                    to-blue-500  shadow-md drop-shadow-lg/90 transition-transform duration-500 ease-in-out ${isWindySecond ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
                  <div className = {`relative left-3 z-10 flex w-0.5  items-center justify-center py-2 font-bold transition-colors  ${isWindySecond ? "text-white":"text-gray-400 text-shadow-gray-900 text-shadow-lg/80"}`}>Second</div>
                  <div className={`relative left-6 z-10 flex w-1/2 items-center ml-5 justify-center py-2 font-bold transition-colors  ${!isWindySecond ? 'text-white' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80'}`}>Hour</div>
             </button>
          
            <span className = {` font-bold flex ${!isDarkMode ? "text-white":"text-black"} `}>Hours
              <img src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/time_white.svg":"/Icon/weather icon/feature/daymode/time_black.svg"}
              className = "w-8 h-8 ml-2 pb-1"/>
            </span>


             <div onClick={handleHourClick} className= "relative flex cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600  shadow-inner">
                  <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400
                    to-blue-500  shadow-md drop-shadow-lg/90 transition-transform duration-500 ease-in-out ${islocalHour ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
                  <div className = {`relative left-3 z-10 flex w-0.5  items-center justify-center py-2 font-bold transition-colors  ${islocalHour ? "text-white":"text-gray-400 text-shadow-gray-900 text-shadow-lg/80"}`}>24H</div>
                  <div className={`relative left-6 z-10 flex w-1/2 items-center ml-5 justify-center py-2 font-bold transition-colors  ${!islocalHour ? 'text-white' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80'}`}>12H</div>
             </div>
           
         
        
          <span className = {` font-bold flex ${!isDarkMode ? "text-white":"text-black"} `}>Mode
               <img
               alt = "Sunlight icon"
               src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/light_white.svg":"/Icon/weather icon/feature/daymode/light_black.svg"}
              className = {`${isDarkMode ? "w-10 h-10 pb-3 ml-1":"w-7 h-7 ml-2"}  `}/>
          </span>
          
           <div onClick={handleModeClick} className= "relative flex cursor-pointer w-35 my-5 p-3 items-center justify-center rounded-full bg-gray-600  shadow-inner">
                  <div className = {`absolute h-9 w-17 rounded-full  
                     shadow-md drop-shadow-lg/90 p-5 transition-transform duration-500 ease-in-out 
                     ${isDarkMode ? "-translate-x-8 bg-linear-to-r  from-cyan-400 to-blue-600":"translate-x-8 bg-linear-to-l  from-black/80 via-white/5 to-black/90"}`}
                     />           
                    <img src ={isDarkMode ? "/Icon/weather icon/feature/darkmode/light_white.svg":"/Icon/weather icon/feature/daymode/light_black.svg"} className = "w-7 h-7 z-20 mr-8"/>
                    <img src = {isDarkMode ? "/Icon/weather icon/feature/daymode/darkmoon.svg":"/Icon/weather icon/feature/darkmode/whitemoon.svg"} className = "w-7 h-7 z-20"/>
            </div>
          
        

          <span className ={` font-bold flex  my-10 ${!isDarkMode ? "text-white":"text-black"} `}>Favorite
               <img
               alt= "Yellow Star"
               src = "/Icon/weather icon/feature/add_favorite.svg"
              className = "w-10 h-10 pb-3 ml-1" />
               <button  className = "cursor-pointer transition-all duration-300" onClick={handleOpenHistory}  type = "button">
                    <img src = {!isDarkMode ?  "/Icon/weather icon/feature/darkmode/history_white.svg":"/Icon/weather icon/feature/daymode/history_black.svg"} 
                    className = {`w-8 h-8 pb-0  relative left-25 -top-0.5 
                    
                    active:scale-90 hover:scale-95
                    max-[400px]:left-10`}/>
                </button>
          </span>
    
           
             <span className ={` font-bold flex ${!isDarkMode ? "text-white":"text-black"} `}>Music
                  <img
                  alt = "Music icon"
                   src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/music_white.svg":"/Icon/weather icon/feature/daymode/music_black.svg"}
                  className = "w-8 h-8 ml-2  pb-1"/>
            
                  <button  className = "cursor-pointer transition-all duration-300" onClick={handleChangeMusic} type = "button">
                    <img 
                    alt = "Switch icon"
                    src = {!isDarkMode ?  "/Icon/weather icon/feature/darkmode/change_music_white.svg":"/Icon/weather icon/feature/daymode/change_music_black.svg"} 
                    className = {`w-8 h-8 pb-0  relative left-30 -top-0.5
                    active:scale-90 hover:scale-95
                    max-[400px]:left-16`}/>
                  </button>
             </span>     
                  <div onClick={handleMusicClick} className= "relative flex cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600 shadow-inner">
                    <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400 to-blue-500 drop-shadow-lg/90 shadow-md transition-transform duration-500 ease-in-out ${isMusicStart ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
                    <div className = {`relative left-3 z-10 flex w-0.5  items-center justify-center text-[0.95rem] py-2.5 font-bold transition-colors ${isMusicStart? "text-white":"text-gray-400 text-shadow-lg/80"}`}>ON</div>
                    <div className={`relative left-6 z-10 flex w-1/2  items-center ml-5 text-[0.95rem] justify-center py-2 font-bold transition-colors  ${!isMusicStart ? 'text-white' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80 '}`}>OFF</div>
                    <WeatherMusicPlay play={isMusicStart} track={currentMusic} />
                </div>
            <span className = {` font-bold flex ${!isDarkMode ? "text-white":"text-black"} `}>Sound Effects
                    <img 
                    alt = "Volume icon"
                    src = { isEffectOn ? 
                      (isDarkMode ? "/Icon/weather icon/feature/daymode/muted_black.svg":"/Icon/weather icon/feature/darkmode/muted_white.svg")
                      :
                      (!isDarkMode ? "/Icon/weather icon/feature/darkmode/unmuted_white.svg":"/Icon/weather icon/feature/daymode/unmuted_black.svg")
                    }
                    className = {` ${isEffectOn && !isDarkMode ? "w-10 h-10 -top-0.5":"w-10 h-10 -top-0.5"} relative pl-1 ml-1 w-9 pb-1.5 h-9`}
                    />              
            </span>
             <div onClick={handleEffectClick} className= "relative flex cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600  shadow-inner">
                  <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400
                    to-blue-500  shadow-md drop-shadow-lg/90 transition-transform duration-500 ease-in-out ${isEffectOn ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
                  <div className = {`relative left-3 z-10 flex w-0.5  items-center justify-center py-2 font-bold transition-colors  ${isEffectOn ? "text-white":"text-gray-400 text-shadow-gray-900 text-shadow-lg/80"}`}>ON</div>
                  <div className={`relative left-6 z-10 flex w-1/2 items-center ml-5 justify-center py-2 font-bold transition-colors  ${!isEffectOn ? 'text-white' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80'}`}>OFF</div>
             </div>   
         

              <span className={`flex  justify-center border-t-5 border-dashed pt-5 font-bold text-xl text-center  ${!isDarkMode ? "text-white":"text-black"} `}>About
                    <img 
                    alt = "Book icon"
                    src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/about_white.svg":"/Icon/weather icon/feature/daymode/about_black.svg"}
                    className = "pl-1 w-7 h-7"
                    />              
              </span>
                <div className = "mt-5 mb-70   font-bold gap-4 flex justify-around max-[400px]:text-sm">
                        <button 
                        onClick={handleAboutClick} 
                        className = {`transition-all duration-400 text-center px-4 py-3  bg-linear-to-l rounded-[10px] border-b-8 \
                        ${!isDarkMode ? "bg-linear-to-tl  from-blue-400 via-cyan-300 to-blue-600 border-blue-900 shadow-lg/50 hover:shadow-blue-600 active:shadow-blue-600 text-black":"  bg-linear-to-tl from-black/90 via-gray-600 to-black  border-gray-900 shadow-lg/50 hover:shadow-blue-600 active:shadow-blue-600 text-white"} \
                        hover:border-b-7 hover:translate-y-1 \
                        active:border-b-0 active:text-blue-200 active:translate-y-2`}>Video</button>
                        <button 
                        onClick = {handleSummaryClick}
                        className = {`transition-all duration-400  text-center px-4 py-3 rounded-[10px] border-b-8 \
                          ${!isDarkMode ? " bg-linear-to-tl from-blue-400 via-cyan-300 border-blue-900 to-blue-600  shadow-lg/50 hover:shadow-blue-600 active:shadow-blue-600 text-black":" shadow-lg/50 hover:shadow-blue-600 active:shadow-blue-600 bg-linear-to-tl from-black/90 via-gray-600 to-black border-gray-900 text-white"} \
                        hover:border-b-7 hover:translate-y-1  \
                        active:border-b-0 active:text-blue-200 active:translate-y-2`}>Summary</button>
                  </div>
        </div>
        
        {/* User Profile & Settings Container */}
        <div ref={settingsRef} className={`absolute drop-shadow-lg/60 z-100 block px-4 py-4  rounded-[15px] bottom-0 w-65 right-4 text-md ${isDarkMode ? "text-black bg-white":"text-white bg-gray-900"}
        max-[400px]:w-[90%] `}>
          <div className="flex items-center">
            <img
            
              src={
              (isDarkMode ? "/Icon/weather icon/feature/daymode/search_black.svg":"/Icon/weather icon/feature/darkmode/search_white.svg")
            }  
            className= " relative rounded-full top-0 object-contain w-5 h-5 mr-3 "
            alt="User profile" /> 
           <p className="w-full overflow-hidden whitespace-nowrap">
                <span 
                  ref={textRef}
                  className="font-bold inline-block"
                  style={
                    scrollDistance > 0 
                      ? ({ 
                          animation: "scroll-pingpong 2s ease-in-out infinite alternate",
                          "--scroll-amount": `-${scrollDistance}px` 
                        } as React.CSSProperties) 
                      : {}
                  }
                >
                  {username}
                </span>
              </p>    
            <img 
              onClick={handleSettingClick}
              src={isDarkMode ? "/Icon/weather icon/feature/daymode/setting_black.svg":"/Icon/weather icon/feature/darkmode/setting_white.svg"}
              className="w-6 h-6 relative top-0.1 ml-auto transition-all duration-500 animate-spin cursor-pointer hover:scale-90 active:scale-80" 
              alt="settings"
            />
          </div>

          {/* ---------- Settings Popup Menu ---------- */}
          <div className={`settings-popup absolute bottom-11 left-55 z-45 ${!isDarkMode ? "bg-black text-white border-gray-800":"bg-white text-black border-gray-200"} w-52 text-left p-3 text-lg font-bold rounded-[15px] border-2 drop-shadow-lg/10 ${settingClick ? "open" : ""}
          max-[400px]:left-45 max-[400px]:w-40`}>
            <ul className="space-y-1">
              <div 
                onClick={(e) => { e.stopPropagation(); setSettingClick(false); setShowLogoutModal(true); }} 
                className= {`flex items-center px-3 py-2 rounded-[10px] ${isDarkMode ? "hover:bg-gray-400 active:bg-gray-400 ":"hover:bg-gray-700 active:bg-gray-700" } cursor-pointer`}
              >
                <img src="/Icon/weather icon/feature/logout.svg" className="w-5 h-5 mr-2" alt="logout" />
                <li className="text-red-500 list-none">Logout</li>
              </div>  
              <div 
                onClick={onDetail} 
                className={`flex items-center px-3 py-2 rounded-[10px] ${isDarkMode ? "hover:bg-gray-400 active:bg-gray-400 ":"hover:bg-gray-700 active:bg-gray-700" } cursor-pointer`}
              >
                <img 
                src= {(isDarkMode ? "/Icon/weather icon/feature/daymode/detail_black.svg":"/Icon/weather icon/feature/darkmode/detail_white.svg")} className="w-5 h-5 mr-2 " alt="detail" />
                <li className="list-none">Details</li>
              </div> 
            </ul>
          </div>
        </div>
      </aside>

      {/* ---------- Main Dashboard Content ---------- */}
    <main className="relative z-10 font-welcome flex min-h-screen items-center justify-center p-8">
      
        <form onSubmit={handleFormSubmit} className="pointer-events-auto fixed top-5 right-20 z-10 w-full max-w-md  mx-2
        max-[600px]:right-20 max-[600px]:w-80
        max-[500px]:w-65
        max-[400px]:w-50 max-[400px]:right-15
        ">
          <input
            type="text"
            name="search"
            value={city}
            onChange={handleInputChange}
            placeholder="Search location..."
            className={`w-full py-2.5 pl-4.5 pr-14 rounded-full drop-shadow-lg/50 bg-linear-to-r shadow-lg text-lg focus:outline-none
              
              ${!isDarkMode 
                ? "text-white from-black/40 to-black/10 backdrop-blur-md font-bold placeholder-white" 
                : "text-black bg-white/30 backdrop-blur-md placeholder-gray-800 font-bold"
              }
              max-[600px]:text-sm`}
          />
          <div
            className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center z-10"
          >
            <img
              onClick={playAnimeClick}
              src={isDarkMode ? "/Icon/weather icon/feature/daymode/search_black.svg" : "/Icon/weather icon/feature/darkmode/search_white.svg"}
              alt="search icon"
              className={`h-11 w-11 p-1.5 rounded-full drop-shadow-lg/60 bg-linear-to-bl`}
            />
          </div>
           <SimilarCity 
             count={count}
            error={error}
            onClose={() => setSuggestions([])}
            results={suggestions} 
            isDarkMode={isDarkMode} 
            onSelect={handleSelectSuggestion} 
          />
        </form>
        <button 
             onClick = {playAnimeClick}
             className = "transition-transform duration-200 fixed drop-shadow-lg/20  top-20 right-4 cursor-pointer hover:scale-95 active:scale-90 \
             max-[600px]:right-5.5 \
             max-[500px]:right-4.5 \
             max-[400px]:right-1">
             <img src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/notification_white.svg":"/Icon/weather icon/feature/daymode/notification_black.svg"}
             alt = "Notification button"
             className = {` ${isDarkMode ? "w-13 h-13  max-[600px]:w-11 max-[600px]:h-11 max-[400px]:w-9 max-[400px]:h-9":"w-14 h-14 max-[600px]:w-12 max-[600px]:h-12  max-[400px]:w-9 max-[400px]:h-9"} `}/>
             <div className = "animate-ping bg-red-500 w-4 h-4 rounded-full absolute right-0 drop-shadow-lg/50 bottom-2"></div>
             <div className ="bg-red-500 w-4 h-4 rounded-full absolute right-0 drop-shadow-lg/50 bottom-2"></div>
        </button>

  
        {/* Display Weather Data (Left Side) */}
        <div className={`absolute left-10 -mt-10  top-1/5 flex flex-col gap-1 font-semibold  text-shadow-lg/20 ${isDarkMode ? "text-slate-900/80 text-shadow-black" : "text-slate-100/80 text-shadow-black"}`}>
      

          <h1 className={`text-4xl flex ${isDarkMode ? "text-black" : "text-white"}
          max-[500px]:text-2xl
          max-[600px]: text-3xl
          max-[400px]:text-[1.4rem] max-[400px]:relative  max-[400px]:right-5.5`}>
             <img 
             alt = "Location icon"
             src = {`${isDarkMode ? "/Icon/weather icon/feature/daymode/location_black.svg":"/Icon/weather icon/feature/darkmode/location_white.svg"}`}
              className={` relative ${ isDarkMode ? "w-13 h-13":"w-11 h-11"} mr-3
              max-[800px]:-top-2

              max-[400px]:w-6 max-[400px]:h-6 max-[400px]:-top-0.5
              `}/>
            <span className = "relative top-3 ">
               {weather?.location.country_code === "" ? "Antarctica": weather?.location.city || <span className = "px-50 py-1 rounded-sm animate-pulse durataion-400 transition-all bg-white max-[500px]:px-30"></span>}
                    <span className = {` text-4xl py-4.5 flex text-shadow-lg/20 mt-4 ${isDarkMode ? "text-slate-300":"text-slate-300"} font-country \
                max-[800px]:py-2.5 max-[800px]:text-[1.6rem]
                max-[600px]:text-[1.15rem] max-[600px]:p-[0.28rem]  max-[600px]:mx-1`}>
                  {(weather?.location.country.toLocaleUpperCase() === "N/A"? "": (weather?.location.country_code === "" ? "ANTARCTICA":weather?.location.country.toLocaleUpperCase()))
                   ||
                    <span className = "px-20 mx-4.5  my-2 relative bottom-2.5 right-3 max-[600px]:right-6 rounded-sm animate-pulse durataion-400 transition-all bg-white"></span>}
                    { weather?.location.country !== undefined ?
                      <img src={weather?.location.country_code !== "" ? `https://flagcdn.com/w80/${weather?.location.country_code.toLowerCase()}.png`:"/Icon/weather icon/feature/antartica_flag.svg"}
                     alt="Country Flag" 
                     className="w-14 h-14 ml-5 relative -top-2.5 object-contain rounded-[15px] \
                        max-[800px]:-top-4
                        max-[600px]:w-12 max-[600px]:h-12
                        max-[400px]:w-10 max-[400px]:h-10 max-[400px]:-top-2.5" 
                      /> 
                      :
                       <span className = "px-8 py-5 mb-5 rounded-sm animate-pulse durataion-400 transition-all bg-white"></span>
                    }
                  </span>
            </span>

          </h1>
              <p className={`text-3xl pl-15.5 flex ${isDarkMode  ? "text-slate-900" : "text-gray-50"}
               max-[800px]:text-[1.6rem]
              max-[400px]:mb-3 max-[400px]:text-xl  max-[400px]:relative max-[400px]:right-5.5 text-shadow-lg/20  max-[400px]:pl-9.5`}>
                It's <span className = {`font-bold ml-3 flex ${isDarkMode ? "text-slate-300":"text-slate-300 "}`}>{weather?.weather.climate || <span className = "px-25 py-1 max-[500px]:px-15 rounded-sm animate-pulse durataion-400 transition-all bg-white"></span>}
                 {weather?.weather.climate !==  undefined ?
                  <img 
                  src = {getWeatherIcon(weather?.weather.climate || "",weather?.weather.daytime || "")} 
                  className = "w-8 h-8 ml-3 drop-shadow-lg/20 "
                   alt = "Weather Icon"/> 
                 :
                  <span className = "px-10 mx-3 py-2 rounded-sm animate-pulse durataion-400 transition-all bg-white"></span>}
                  </span>
              </p>  
              <span className = {`text-3xl pl-15.5  font-bold flex py-5 ${isDarkMode ? "text-slate-300":"text-slate-300 "}
              max-[800px]:text-[1.6rem]
              max-[400px]:mb-3 max-[400px]:text-xl  max-[400px]:relative max-[400px]:right-5.5 text-shadow-lg/20  max-[400px]:pl-9.5`}>
                  <span className ={` mr-2 ${isDarkMode ? "text-black":"text-white"}`}>Level: </span>
                  { weather?.level || <span className = "px-20 py-1 rounded-sm animate-pulse durataion-400 transition-all bg-white"></span>}
                {LevelIcon &&  (<img src={LevelIcon}  alt = "level status icon" className = "ml-2.5  w-8 h-8 drop-shadow-lg/40 max-[400px]:pb-1 "/>)}
                
                </span>
            
              
        
          <h1 className={`text-[9rem] px-5 relative -top-15 mx-7 mb-15 mt-10 flex text-nowrap 
            max-[1000px]:text-[6rem]
            max-[800px]:text-[5rem]
            max-[400px]:text-[4.2rem] max-[400px]:m-2 max-[400px]:-top-8 max-[400px]:right-5`}>
               { isCelsius ? (weather?.temperature.celsius === undefined ? (<span className = "px-30 py-15 m-5 rounded-sm animate-pulse durataion-400 transition-all bg-white"></span>):weather?.temperature.celsius.toFixed(1) + " " + "°C")
               :
               weather?.temperature.fahrenheit === undefined ? (<span className = "p-10 rounded-sm animate-pulse durataion-400 transition-all bg-white"></span>):(isfarh ? weather?.temperature.fahrenheit.toFixed(1) + " " + "°F"
               : 
               weather?.temperature.kelvin.toFixed(1) + " °K")}
          </h1>
         <div className= "block px-15 relative text-3xl -top-30 \
         max-[400px]:px-0 max-[400px]:-top-10">
              <h1 className={`text-4 mb-3 text-nowrap ${isDarkMode ? "text-black" : "text-white"}\
              max-[1000px]:text-[1.2rem]
              max-[400px]:text-xl`}>
                {weather?.datetime.full_date}
              </h1>
              <h1 className={`text-3xl flex  ${isDarkMode ? "text-black" : "text-white"}
              max-[1000px]:text-[1.2rem]
              max-[400px]:text-xl`}>
                {liveClock || <span className = "px-20 py-1 rounded-sm animate-pulse durataion-400 transition-all bg-white"></span>}
                <p className = {`text-3xl ml-8 ${isDarkMode  ? "text-black" : "text-gray-50"}
              max-[1000px]:text-[1.2rem]
               max-[400px]:mb-3 max-[400px]:text-xl  text-shadow-lg/20  max-[400px]:pl-1.5`}>{weather?.weather.daytime}
                </p>
                {
               weather?.weather.daytime !== undefined ?
              <img
               src = {!isDarkMode ? (weather?.weather.daytime.toLowerCase().includes("night") ? "/Icon/weather icon/feature/darkmode/whitemoon.svg":"/Icon/weather icon/feature/darkmode/light_white.svg") 
                :
                (weather?.weather.daytime.toLowerCase().includes("day") ? "/Icon/weather icon/feature/daymode/light_black.svg" : "/Icon/weather icon/feature/daymode/darkmoon.svg" )} 

                className = "w-9 h-9 ml-2 drop-shadow-lg/20 relative max-[400px]:pb-2 max-[1000px]:bottom-2"
                alt = "Mode icon"/>
                : 
                <span className = "px-10 py-4 rounded-sm animate-pulse durataion-400 transition-all bg-white"></span>
               }
              </h1>
          </div>  
        </div>
     
      <button type = "button" onClick={handleStarClick}>
          <img 
          alt = "Favorite Star icon"
            src={
              isDarkMode 
                ? (isStarred ? "/Icon/weather icon/feature/add_favorite.svg" : "/Icon/weather icon/feature/daymode/daymode_favorite.svg")
                : (isStarred ? "/Icon/weather icon/feature/add_favorite.svg" : "/Icon/weather icon/feature/darkmode/darkmode_favorite.svg")
            } 
            className={`fixed top-4 right-5  cursor-pointer ${isDarkMode ? "w-12 h-12" : "w-13 h-13"} \
            max-[400px]:w-8 max-[400px]:h-8 max-[400px]:top-5.5 max-[400px]:right-2`}
        
          />
        </button>
       <div className ={`fixed right-2 cursor-move rounded-2xl bottom-20  -z-20 w-120 h-100 ${!isDarkMode ? "bg-black/20":"bg-white/20"}  backdrop-blur-sm
        max-[1200px]:w-120
        max-[900px]:w-100
        max-[800px]:h-70 max-[800px]:w-130 max-[800px]:relative max-[800px]:top-90
        ${!isForecastOn ? "showForecast":"hideForecast"}
      `}>
            <div className = "relative no-scrollbar overflow-y-auto top-0 left-2  pl-5 h-full">
                      <WeatherMap 
                    isLocalHour = {islocalHour}
                    isWindySecond={isWindySecond}
                    isKelvin={isKevin}
                    isCelsius={isCelsius}
                    isfarh= {isfarh} 
                    isKm={isKm}
                    isMile={isMile}
                    weather={weather}
                    isDarkMode={isDarkMode}
                    lat={mapCoord.lat || Coord.lat}
                    lon={mapCoord.lon || Coord.lon}
                    cityName={city}
                    />         
          </div>
        </div>
      </main>

      {/* ---------- Logout Modal ---------- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className={`p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 ${isDarkMode ? "bg-white text-black" : "bg-black text-white"} border border-white/10`}>
            <h3 className="text-xl block font-bold mb-6 text-center">
              Are you sure you want to logout your own account?
              <span className = "block text-red-500 my-2 text-sm">
              Your data might be vanishing during  account execution
              </span>
            </h3>
            
            <div className="flex justify-center cursor-pointer gap-6">
              <button 
                disabled={logouting}
                onClick={handleConfirmLogout}
                className=" px-8 py-2 rounded-xl bg-red-600 border-b-8 border-red-900   text-white font-bold transition-all duration-300 active:scale-95
                hover:bg-red-500 hover:border-b-7 hover:translate-y-1
                active:border-b-0 active:text-blue-500 active:translate-y-2
                disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {logouting ? "Working...":"Yes"}
              </button>
              <button 
                onClick={handleDeclineButton}
                className={`px-8 py-2 rounded-xl font-bold transition-all duration-200 active:scale-95
                   ${isDarkMode ? "bg-gray-900 border-b-8 border-black  hover:bg-gray-600 text-white \
                    hover:border-b-7 hover:translate-y-1 \
                    active:border-b-0 active:text-blue-500 active:translate-y-2" 
                    : 
                    "bg-gray-50 border-b-8 border-gray-500 hover:bg-gray-400 text-black  \
                    hover:border-b-7 hover:translate-y-1 \
                    active:border-b-0 active:text-blue-500 active:translate-y-2"}`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
          <MusicList 
            isOpen={showMusicModal} 
            isDarkMode={isDarkMode}
   
            isMusicStart={isMusicStart}
            onClose={() => setShowMusicModal(false)} 
            currentTrack={currentMusic}
            onSelect={(path) => setCurrentMusic(path)}
          />
          <FavoriteHistory
        error={error}
        count={count}
        isKm={isKm}
        isWindySecond={isWindySecond}
        isKelvin={isKevin}
        isMile= {isMile}
        refresh={refresh}
        islocalHour={islocalHour}
        weather={weather}
        onRefresh={handleRefresh}
        onSearch={handleSearchFromHistory}
        isCelsius ={isCelsius}
        isfarh={isfarh}
        cloneCity={cloneCity}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        favList={favList}
        isDarkMode={isDarkMode}
        onDelete={handleDeleteFavorite}
        onDeleteAll={handleDeleteAllFavorites}
      />
    </div>
  );
};

export default Weather;