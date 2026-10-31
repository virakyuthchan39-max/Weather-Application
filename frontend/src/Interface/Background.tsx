import React, { useEffect, useState } from "react";
import { stopWeatherSound,playWeatherSound } from "../Effect_Service/sound_effect";
interface BackgroundProps {
  isEffectOn: boolean;
  climate: string;
  daytime: string;
}

const Background: React.FC<BackgroundProps> = ({ isEffectOn, climate,daytime }) => {
  const [videoName, setVideoName] = useState("");
 
 useEffect(() => {
    if (!climate || !daytime) return;

    const lower = climate.toLowerCase();
    const lower_daytime = daytime.toLowerCase();
    const isDay = lower_daytime.includes("day");

    // 1. Check specific storms/thunder FIRST
    if (lower.includes("thunder") || lower.includes("storm")) {
      setVideoName("Storm");
    } 
    
    else if (lower.includes("heavy") && lower.includes("rain")) {
      setVideoName("Heavy_Rain");
    } 
    else if (lower.includes("light rain")) {
      setVideoName(isDay ? "Light_Rain" : "Light_Rain_Night");
    } 
    else if (lower.includes("rain") || lower.includes("drizzle")) {
      setVideoName(isDay ? "Rain" : "Rain_Night");
    } 
    // 3. Snow
    else if (lower.includes("snow")) {
      setVideoName(isDay ? "Snow_Day" : "Snow");
    } 
    // 4. Mist, Fog, Wind
    else if (lower.includes("mist") || lower.includes("fog") || lower.includes("haze")) {
      setVideoName("Mist");
    } 
    else if (lower.includes("wind") || lower.includes("breeze")) {
      setVideoName("Windy");
    } 
    // 5. Clouds
    else if (lower.includes("broken")) {
      setVideoName(isDay ? "Broken_Cloud" : "Cloudy_Night");
    } 
    else if (lower.includes("few")) {
      setVideoName(isDay ? "Few_Cloud" : "Cloudy_Night");
    } 
   else if (lower.includes("scatter")) {
      setVideoName(isDay ? "Scatter_Cloud" : "Cloudy_Night");
    } 
    else if (lower.includes("overcast")) {
      setVideoName(isDay ? "Overcast_Cloudy" : "Overcast_Cloud_Night");
    } 
    else if (lower.includes("cloud")) {
      setVideoName(isDay ? "Cloudy" : "Cloudy_Night");
    } 
    // 6. Clear / Sunny (Always last)
    else if (lower.includes("sunny")) {
      setVideoName("Sunny");
    } 
    else if (lower.includes("clear")) {
      setVideoName(isDay ? "Clear" : "Clear_Night");
    } 
    // 7. Fallback if unmapped
    else {
      setVideoName(isDay ? "Clear" : "Clear_Night");
    }
  }, [climate, daytime]);


    useEffect(() => {
    if (!isEffectOn || !climate || !daytime) {
      stopWeatherSound();
      return;
    }

    const climates = climate.toLowerCase();
    const isNight = daytime.toLowerCase().includes("night");
    if (climates.includes("rain") && !climates.includes("light rain")) {
      playWeatherSound("/Audio/Effect/feature/rain.mp3");
    } 
    else if (climates.includes("light rain")){playWeatherSound("/Audio/Effect/feature/light_rain.mp3")}
    else if (climates.includes("cloud")) {
    
      playWeatherSound("/Audio/Effect/feature/cloudy.mp3");
    } else if (climates.includes("snow")) {
      playWeatherSound("/Audio/Effect/feature/snow.mp3");
    } else if (climates.includes("clear") && !isNight) {
      playWeatherSound("/Audio/Effect/feature/clear_sky.mp3");
    }  else if (climates.includes("clear") && isNight) {
      playWeatherSound("/Audio/Effect/feature/night_clear.mp3");
     } else {
      stopWeatherSound();
    }

    return () => {
      stopWeatherSound();
    };
  }, [climate,daytime, isEffectOn]);

  
  return (
    <>
    <div className="absolute inset-0 z-0 pointer-events-none">
      <video
        key={videoName}
        autoPlay
        loop
        muted
        playsInline
        className="fixed h-full w-full inset-0 object-cover"
      >
        <source src={`/Audio/Video/webm/${videoName}.webm`} type="video/webm" />
        <source src={`/Audio/Video/mp4/${videoName}.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
   
    </div>
    </>
  );
};

export default Background;


export const getWeatherIcon = (climate: string, daytime: string) => {
  const lower = climate.toLowerCase();
  const lower_daytime = daytime.toLowerCase();

  if ((lower.includes("rain") || lower.includes("drizzle")) && lower_daytime.includes("day")) {
    return "/Icon/weather icon/weather/rainy_day.svg";
  } else if (lower.includes("thunder") || lower.includes("storm")) {
    return "/Icon/weather icon/weather/storm.svg";
  } else if (lower.includes("snow") && lower_daytime.includes("night")) {
    return "/Icon/weather icon/weather/snow.svg";
  } else if (lower.includes("mist") || lower.includes("fog") || lower.includes("haze")) {
    return "/Icon/weather icon/weather/mist.svg";
  } else if ((lower.includes("cloud") || lower.includes("overcast")) && lower_daytime.includes("day")) {
    return "/Icon/weather icon/weather/cloudy.svg";
  } else if (lower.includes("wind") || lower.includes("breeze")) {
    return "/Icon/weather icon/weather/wind.svg";
  } else if (lower.includes("rain") && lower_daytime.includes("night")) {
    return "/Icon/weather icon/weather/rainy_night.svg";
  } else if (lower.includes("clear") && lower_daytime.includes("day")) {
    return "/Icon/weather icon/weather/clear.svg";
  } else if (lower.includes("cloud") && lower_daytime.includes("night")) {
    return "/Icon/weather icon/weather/night_cloudy.svg";
  } else if (lower.includes("clear") && lower_daytime.includes("night")) {
    return "/Icon/weather icon/weather/night_clear.svg";
  } else if (lower.includes("snow") && lower_daytime.includes("day")) {
    return "/Icon/weather icon/weather/snow_day.svg";
  }
  
  // Default Icon បើគ្មានអ្វីត្រូវគ្នា
  return "/Icon/weather icon/weather/clear_sky.svg"; 
};
