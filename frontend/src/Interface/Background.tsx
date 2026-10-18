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
     console.log(lower_daytime)
    if (lower.includes("rain") || lower.includes("drizzle")) {
      setVideoName("Rain");
    } else if (lower.includes("thunder") || lower.includes("storm")) {setVideoName("Storm")}
    else if (lower.includes("snow")) {
      setVideoName("Snow");
    } else if (lower.includes("mist") || lower.includes("fog") || lower.includes("haze")) {
      setVideoName("Mist");
    } else if (lower.includes("cloud") || lower.includes("overcast")) {
      setVideoName("Cloudy");
    } else if (lower.includes("wind") || lower.includes("breeze")) {
      setVideoName("Windy");
    } else if (lower.includes("sunny")){
        setVideoName("Sunny")
    }
    else if (lower.includes("clear") && lower_daytime === "day" ) {
      setVideoName("Clear");
    } else if (lower.includes("clear")  && lower_daytime === "night") {
      setVideoName("Clear_Night");
    }
  }, [climate]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <video
        key={videoName}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={`/Audio/Video/webm/${videoName}.webm`} type="video/webm" />
        <source src={`/Audio/Video/mp4/${videoName}.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
};

export default Background;