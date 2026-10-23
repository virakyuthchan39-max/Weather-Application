import React, { useEffect, useState } from "react";

interface BackgroundProps {
  climate: string;
  daytime: string;
}

const Background: React.FC<BackgroundProps> = ({ climate,daytime }) => {
  const [videoName, setVideoName] = useState("Clear_Night");
  
  useEffect(() => {
    const lower = climate.toLowerCase();
    const lower_daytime = daytime.toLowerCase()
   
 
    if ((lower.includes("rain") || lower.includes("drizzle")) && lower_daytime.includes("day")) {setVideoName("Rain");}
    else if (lower.includes("thunder") || lower.includes("storm")) {setVideoName("Storm")}
    else if (lower.includes("snow") && lower_daytime.includes("night")) {setVideoName("Snow"); }
    else if (lower.includes("mist") || lower.includes("fog") || lower.includes("haze")) {setVideoName("Mist");}
    else if ((lower.includes("cloud") || lower.includes("overcast")) && lower_daytime.includes("day")) {setVideoName("Cloudy");}
    else if (lower.includes("wind") || lower.includes("breeze")) {setVideoName("Windy");}
    else if (lower.includes("sunny")){setVideoName("Sunny");}
    else if (lower.includes("rain") && lower_daytime.includes("night")){setVideoName("Rain_Night")}
    else if (lower.includes("clear") && lower_daytime.includes("day") ) {setVideoName("Clear");}
    else if (lower.includes("cloud") &&  lower_daytime.includes("night") ){setVideoName("Cloudy_Night");}
    else if (lower.includes("clear")  && lower_daytime.includes("night") ){setVideoName("Clear_Night");}
    else if (lower.includes("snow") && lower_daytime.includes("day")){setVideoName("Snow_Day")}
  }, [climate,daytime]);



  return (
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
  );
};

export default Background;