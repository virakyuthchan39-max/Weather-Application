import React, { useEffect, useState } from 'react';
import { WeatherResponse } from '../Effect_Service/Api/service/open_weather';

interface WeatherStatsProps {
  isLocalHour: boolean;
  isfarh: boolean;
  isWindySecond: boolean;
  isKelvin: boolean;
  isKm: boolean;
  isMile: boolean;
  weather: WeatherResponse | null;
  isDarkMode: boolean;
}

const WeatherStats: React.FC<WeatherStatsProps> = ({ 
  isLocalHour, weather, isDarkMode, isfarh, isKelvin, isKm, isMile, isWindySecond 
}) => {
  // ១. ត្រូវដាក់ Hooks ទាំងអស់នៅខាងលើគេ (មុនពេល return)
  const [feelLikeIcon, setFeelLike] = useState("");

  useEffect(() => {
    if (!weather) return;
    
    // ចំណាំ៖ ត្រូវប្រាកដថា weather.temperature.feel_like_level មានពិត
    const level = weather.temperature.feel_like_level?.toLowerCase() || "";
    const modePath = isDarkMode ? "daymode" : "darkmode";
    
    if (level === "hot" || level === "extremely hot") {
      setFeelLike("/Icon/weather icon/feature/hot.svg");
    } else if (level === "cold" || level === "extremely cold") {
      setFeelLike("/Icon/weather icon/feature/cold.svg");
    } else if (level === "average") {
      setFeelLike(`/Icon/weather icon/feature/${modePath}/average_${isDarkMode ? "black" : "white"}.svg`);
    }
  }, [weather, isDarkMode]);

  // ២. បន្ទាប់ពី Hooks រួចហើយ ទើបយើងពិនិត្យ return null បាន
  if (!weather) return null;

  let feelLike = "";
  if (isfarh) {
    feelLike = `${weather.temperature.feel_like_farhrenheit} °F`;
  } else if (isKelvin) {
    feelLike = `${weather.temperature.feel_like_kelvin} °K`;
  } else {
    feelLike = `${weather.temperature.feel_like_celsius} °C`;
  }

  let windySpeed = "";
  if(isMile){ windySpeed = `${(weather.weather.wind.speed/1609.344).toFixed(4)} mi`; }
  else if (isKm){ windySpeed = `${(weather.weather.wind.speed/1000).toFixed(4)} km`; }
  else { windySpeed = `${weather.weather.wind.speed.toFixed(2)} m`; }
   
  let visibility = "";
  if(isMile){ visibility = `${(weather.temperature.visibility/1609.344).toFixed(2)} mile`; }
  else if (isKm){ visibility = `${(weather.temperature.visibility/1000)} km`; }
  else { visibility = `${weather.temperature.visibility} m`; }

  let windySpeedPeriod = "";
  if (!isWindySecond && isKm){ windySpeedPeriod = `${((weather.weather.wind.speed * 3600)/1000).toFixed(2)} km/h`; }
  else if (!isWindySecond && isMile){ windySpeedPeriod = `${((weather.weather.wind.speed * 3600)/1609.344).toFixed(2)} mi/h`; }
  else if (!isWindySecond){
     console.log(weather.weather.wind.speed * 3600)
     windySpeedPeriod = `${((weather.weather.wind.speed * 3600).toFixed(0))} m/h`; }
  else { windySpeedPeriod = `${windySpeed}/s`; }

  // ៣. កែ Format ម៉ោងឱ្យត្រូវចិត្ត
  const formatWeatherDataTime = (dt: number, timezoneOffset: number): string | undefined => {
    const cityTimestamp = (dt + timezoneOffset) * 1000;
    const dateObject = new Date(cityTimestamp);
    
    // បើ isLocalHour ជា true (មានន័យថាជ្រើសរើស 24H)
    if (isLocalHour) { 
      const hours = dateObject.getUTCHours().toString().padStart(2, '0');
      const minutes = dateObject.getUTCMinutes().toString().padStart(2, '0');

      return `${hours}:${minutes}`; // ✅ លុប AM/PM ចេញ ព្រោះជា 24H
    } 
    // បើ isLocalHour ជា false (មានន័យថាជ្រើសរើស 12H)
    else {
      return dateObject.toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true, // ✅ បង្ហាញ AM/PM
      });
    }
  };

  return (
    <div className={`p-4 rounded-xl mt-2 flex flex-col gap-2 w-full ${!isDarkMode ? "text-white":"text-black"}`}>
      <div className={`flex justify-between border-b ${!isDarkMode ? "border-gray-200":"border-gray-900"} pb-1`}>
        <span className="font-semibold flex text-sm">Wind Speed 
                <img src={!isDarkMode ? "/Icon/weather icon/feature/darkmode/wind_white.svg" : "/Icon/weather icon/feature/daymode/wind_black.svg"} 
                alt="wind icon" className="ml-2 w-5.5 h-5.5"/>
        </span>
        <span className="font-bold text-sm">{windySpeedPeriod}</span>
      </div>

      <div className={`flex justify-between border-b ${!isDarkMode ? "border-gray-200":"border-gray-900"} pb-1`}>
        <span className="font-semibold flex text-sm">Pressure
                <img src={!isDarkMode ? "/Icon/weather icon/feature/darkmode/pressure_white.svg" : "/Icon/weather icon/feature/daymode/pressure_black.svg"} 
                alt="pressure icon" className="ml-2 w-5.5 h-5.5"/>
        </span>
        <span className="font-bold text-sm">{weather.temperature.pressure} hPa</span>
      </div>

      <div className={`flex justify-between border-b ${!isDarkMode ? "border-gray-200":"border-gray-900"} pb-1`}>
        <span className="font-semibold flex text-sm">Visibility
               <img src={!isDarkMode ? "/Icon/weather icon/feature/darkmode/visible_white.svg" : "/Icon/weather icon/feature/daymode/visible_black.svg"} 
                alt="visibility icon" className="ml-2 w-5.5 h-5.5"/>
        </span>
        <span className="font-bold text-sm">{visibility}</span>
      </div>

      <div className={`flex justify-between border-b ${!isDarkMode ? "border-gray-200":"border-gray-900"} pb-1`}>
        <span className="font-semibold flex text-sm">Feels Like
            <img src={feelLikeIcon} alt="Feels Like icon" className="ml-2 w-5.5 h-5.5"/>
        </span>
        <span className="font-bold text-sm">{feelLike}</span>
      </div>

      <div className={`flex justify-between border-b ${!isDarkMode ? "border-gray-200":"border-gray-900"} pb-1`}>
        <span className="font-semibold flex text-sm">Humidity
            <img src={!isDarkMode ? "/Icon/weather icon/feature/darkmode/humidity_white.svg" : "/Icon/weather icon/feature/daymode/humidity_black.svg"} 
                alt="humidity icon" className="ml-2 w-5.5 h-5.5"/>
        </span>
        <span className="font-bold text-sm">{weather.temperature.humidity}%</span>
      </div>

       <div className={`flex justify-between border-b ${!isDarkMode ? "border-gray-200":"border-gray-900"} pb-1`}>
        <span className="font-semibold flex text-sm">Update Weather Time 
               <img src={!isDarkMode ? "/Icon/weather icon/feature/darkmode/time_white.svg" : "/Icon/weather icon/feature/daymode/time_black.svg"} 
                alt="visibility icon" className="ml-2 w-5.5 h-5.5"/>
        </span>

        <span className="font-bold text-sm"> 
          <span className="mx-10 relative -right-8">
            ({weather.location.country.toLowerCase() === "" ? "Antarctica" : weather.location.country}) 
          </span>
          {formatWeatherDataTime(weather.datetime.dt, weather.datetime.offset)}
        </span>
      </div>

        <div className={`flex justify-between border-b ${!isDarkMode ? "border-gray-200":"border-gray-900"} pb-1`}>
        <span className="font-semibold flex text-sm">Wind Direction from
            <img src={!isDarkMode ? "/Icon/weather icon/feature/darkmode/direction_white.svg":"/Icon/weather icon/feature/daymode/direction_black.svg"} alt="Feels Like icon" className="ml-2 w-5.5 h-5.5"/>
        </span>
        <span className="font-bold text-sm">({weather.weather.wind.direction}) {weather.weather.wind.deg}°</span>
      </div>

    </div>
  );
};

export default WeatherStats;