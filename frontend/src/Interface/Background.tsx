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
    const lower = climate.toLowerCase();
    const lower_daytime = daytime.toLowerCase()


 
    if ((lower.includes("rain") || lower.includes("drizzle")) && lower_daytime.includes("day")) {setVideoName("Rain");("/Icon/weather icon/weather/rain.svg")}
    else if (lower.includes("thunder") || lower.includes("storm")) {
      setVideoName("Storm")}
    else if (lower.includes("snow") && lower_daytime.includes("night")) {setVideoName("Snow"); }
    else if (lower.includes("mist") || lower.includes("fog") || lower.includes("haze")) {setVideoName("Mist");}
    else if ((lower.includes("cloud") || lower.includes("overcast")) && lower_daytime.includes("day")) {setVideoName("Cloudy");}
    else if (lower.includes("wind") || lower.includes("breeze")) {setVideoName("Windy");}
    else if (lower.includes("sunny")){setVideoName("Sunny");}
    else if (lower.includes("rain") && lower_daytime.includes("night")){setVideoName("Rain_Night")}
    else if (lower.includes("clear") && lower_daytime.includes("day") ) {setVideoName("Clear")}
    else if (lower.includes("cloud") &&  lower_daytime.includes("night") ){setVideoName("Cloudy_Night")}
    else if (lower.includes("clear")  && lower_daytime.includes("night") ){setVideoName("Clear_Night")}
    else if (lower.includes("snow") && lower_daytime.includes("day")){setVideoName("Snow_Day")}
  }, [climate,daytime]);
    useEffect(() => {
    if (!isEffectOn || !climate || !daytime) {
      stopWeatherSound();
      return;
    }

    const climates = climate.toLowerCase();
    const isNight = daytime.toLowerCase().includes("night");
    if (climates.includes("rain")) {
      playWeatherSound("/Audio/Effect/feature/rain.mp3");
    } else if (climates.includes("cloud")) {
    
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
