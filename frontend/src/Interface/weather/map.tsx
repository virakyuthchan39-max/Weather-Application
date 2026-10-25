import React from 'react';

interface WeatherMapProps {
  isDarkMode: boolean
  lat: number;
  lon: number;
  cityName: string;
}

const WeatherMap: React.FC<WeatherMapProps> = ({ isDarkMode,lat, lon, cityName }) => {
  // Construct the Google Maps embed URL directly on the frontend using lat & lon
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lon}&z=12&output=embed`;
  
  return (
    <>
    <div className = "grid grid-cols-auto justify-items-end">
        <span className ={`relative justify-start right-85 top-30 border-b-2 pb-0 items-start text-xl w-22 h-full text-shadow-lg/20 ${!isDarkMode? "text-white":"text-black"}`}>Location: </span>
        <div className="w-100 h-50  absolute right-8  top-45 opacity-80 rounded-2xl  overflow-hidden 
        max-[600px]:w-100 max-[600px]:h-50
        max-[400px]:w-50 max-[400px]:h-25">
            
        <div className="absolute inset-0  overflow-hidden">
          
            <iframe
            title={`Map of ${cityName}`}
            src={mapUrl}
            loading="lazy"
            className="w-[calc(100%+40px)] h-[calc(100%+130px)] -ml-5 -mt-12.5 border-0"
            />
         
        </div>
        
        </div>
        <span className = {`text-xl  relative text-shadow-lg/30 my-5   top-100 right-0  flex ${!isDarkMode ? "text-white":'text-black'} max-[600px]:text-sm max-[600px]:block max-[600px]:mb-25`}>Weather Data Power By: 
                 <span className = {isDarkMode ? "text-black":"text-white"}>Open Weather</span>
                <img src ="/Icon/weather icon/feature/openweather-logo.svg" className = {`w-20  h-20 relative block  -top-6 ml-3  ${!isDarkMode ? "drop-shadow-white drop-shadow-lg/30":"drop-shadow-black drop-shadow-lg/80"}
                max-[600px]:w-18 max-[600px]:h-18 max-[600px]:left-25 max-[600px]:my-4`}  alt= "OpenWeather" />
        </span> 
        <span className = {`text-xl  relative text-shadow-lg/30 mb-400  top-88 right-15  flex ${!isDarkMode ? "text-white":'text-black'} max-[600px]:text-sm max-[600px]:block max-[600px]:mb-25`}>Weather Data Power By: 
                <span className = {isDarkMode ? "text-black":"text-white"}>Google Maps</span>
                <img src ="/Icon/Google logo.avif" className = {`w-6  h-6 relative block top-0 ml-3  ${!isDarkMode ? "drop-shadow-white drop-shadow-lg/30":"drop-shadow-black drop-shadow-lg/80"}
                max-[600px]:w-18 max-[600px]:h-18 max-[600px]:left-25 max-[600px]:my-4`}  alt= "OpenWeather" />
        </span>
      
    </div>
    </>
    );
};

export default WeatherMap;