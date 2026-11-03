import React from 'react';

import { WeatherResponse } from '../../Effect_Service/Api/service/open_weather';
import WeatherStats from '../WeatherState';

interface WeatherMapProps {
  isLocalHour:boolean
  isDarkMode: boolean
  isCelsius: boolean;
  isfarh: boolean;
  isWindySecond: boolean
  isKm: boolean;
  isMile: boolean;
  isKelvin: boolean;
  lat: number;
  lon: number;
  cityName: string;
  weather: WeatherResponse | null;
}

const WeatherMap: React.FC<WeatherMapProps> = ({isLocalHour,isDarkMode,lat, lon, cityName,weather,isCelsius,isWindySecond,isfarh,isKelvin,isMile,isKm }) => {
  // Construct the Google Maps embed URL directly on the frontend using lat & lon
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lon}&z=12&output=embed`;
  
  return (
    <>
    {
    (weather?.location.city !== undefined) ?
    <div className = "text-nowrap grid grid-cols-auto justify-items-end max-[700px]:justify-around max-[700px]:items-start">
        <span className ={`relative justify-start right-90 top-20 border-b-2 pb-0 items-start text-xl w-22 h-full text-shadow-lg/20
          max-[900px]:right-75
          max-[800px]:right-100
          max-[700px]:right-80
          max-[600px]:right-85
          max-[500px]:right-75
          max-[400px]:right-62 

           ${!isDarkMode? "text-white":"text-black"}`}>Location: </span>
        <div className="w-110 h-50  absolute right-6  top-35 opacity-80 rounded-2xl  overflow-hidden 
       
        max-[900px]:w-90 max-[900px]:h-60 
        max-[800px]:w-90 max-[800px]:h-50 max-[800px]:right-25
        max-[700px]:right-15 max-[700px]:w-100
        max-[600px]:w-100 max-[600px]:h-50 max-[600px]:right-10
       
        max-[500px]:w-95 max-[500px]:h-50 max-[500px]:right-8
        max-[400px]:w-80 max-[400px]:h-50 max-[400px]:left-0.5">
         
        <div className="absolute inset-0 overflow-hidden">
            <iframe
            title={`Map of ${cityName}`}
            width= "100%"
            height="100%"
            src={mapUrl}
            loading="lazy"
            className="w-[calc(100%+70px)] h-[calc(100%+200px)] -ml-14 -mt-12.5 border-0"
            />
         
        </div>
        
        </div>
        <div className="w-full h-auto relative top-85 right-3
        max-[500px]:top-70">
            <WeatherStats isLocalHour = { isLocalHour} isWindySecond={isWindySecond} isKm ={isKm} isMile ={isMile} isKelvin={isKelvin}  isfarh= {isfarh} weather={weather} isDarkMode={isDarkMode} />
        </div>
      
       <div className = "mr-10 relative \
       max-[500px]:left-10  \
       max-[600px]:top-10 \
       max-[800px]:-left-15 \
       max-[700px]:left-5 \
       max-[900px]:left-10">
            <span className = {`text-xl  relative text-shadow-lg/30 my-1   top-100 right-40  flex ${!isDarkMode ? "text-white":'text-black'}
             max-[600px]:text-xl max-[600px]:block
              max-[500px]:right-20

             `}>Weather Data Power By:</span> 
                   <span className ={`text-xl  relative text-shadow-lg/30  my-3 top-100 right-40  flex text-slate-200/80
                    max-[500px]:right-20`}>Open Weather
                      <img src ="/Icon/weather icon/feature/openweather-logo.svg" className = {`w-20  h-20 relative flex  -top-6 ml-3  ${!isDarkMode ? "drop-shadow-white drop-shadow-lg/30":"drop-shadow-black drop-shadow-lg/80"}
                      max-[600px]:w-18 max-[600px]:h-18 max-[600px]:left-0 max-[600px]:my-0
                      max-[400px]:left-0 max-[400px]:-top-6
                      `}  alt= "OpenWeather" />
                    </span>
            <span className = {`text-xl  relative text-shadow-lg/30   top-88 right-40  flex ${!isDarkMode ? "text-white":'text-black'}
             max-[600px]:text-xl max-[600px]:block
             max-[500px]:right-20
             `}>Location Data Power By:</span>
                  <span className = {`text-xl relative text-shadow-lg/30 mt-3 mb-100 flex top-88 right-40 text-slate-200/80
                    max-[500px]:right-20`}>Google Maps
                      <img src ="/Icon/weather icon/feature/google-maps.svg" className = {`w-6  h-6 relative flex top-0 ml-3  ${!isDarkMode ? "drop-shadow-white drop-shadow-lg/30":"drop-shadow-black drop-shadow-lg/80"}
                      
                      max-[600px]:w-7 max-[600px]:h-7 max-[600px]:left-0 max-[600px]:-my-1
                      max-[400px]:w-6 max-[400px]:h-6 max-[400px]:left-0 max-[400px]:top-0
                      `}  alt= "Google Maps" />
                  </span>      
        </div>       
      
    </div>
    :
    <span className = "px-50 py-80 rounded-md relative top-20  bg-white/10 max-[700px]:left-0 max-[700px]:">
       <span className =" animate-pulse durataion-400 transition-all bg-gray-300 rounded-md p-30 absolute  left-20 top-75 "></span>
           <span className =" animate-pulse durataion-400 transition-all bg-gray-300 rounded-md px-30 mb-50 py-5 absolute  left-20 top-145 "></span>
    </span>
}
    </>
    );

};

export default WeatherMap;