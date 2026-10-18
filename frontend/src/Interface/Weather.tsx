import React, { useState, useEffect, useRef } from 'react';
import "./weather.css";
import "../Interface/welcome/account.css";

import Background from "./Background";
import { useWeatherService } from "./weather_service";


interface WeatherProps {
  username: string;
  onLogout?: () => void;
  onDetail?: () => void;
}

const Weather: React.FC<WeatherProps> = ({ username, onLogout, onDetail }) => {
  const {
    weather,
    daytime,
    city,
    setCity,
    error,
    loading,
    handleSearch,
  } = useWeatherService();

  const [open, setOpen] = useState(false);
  const [settingClick, setSettingClick] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setOpen((prev) => !prev);
  const closeSidebar = () => setOpen(false);

  const handleSettingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingClick((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
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
 
  const [isCelsius,setIsCelsius] = useState(false);
  const [islocalHour,setIsLocalHours]  = useState(false);
  const [isForecastOn, setIsForecastOn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFavoriteCity, setIsFavoriteCity] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  const handleStarClick = () => {
    setIsStarred((prev) => !prev);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) onLogout();
  };

  return (
    <div className= {`relative font-weather  min-h-screen w-full  font-welcome transition-colors duration-500 ${!isDarkMode ? "bg-black":"bg-white"}`}>      {/* ---------- Hamburger Button ---------- */}
      <Background climate={weather?.weather.climate || "clear_sky"} daytime={daytime} />
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
      <div
        onClick={closeSidebar}
        className={`fixed inset-0 z-30 transition-opacity duration-350 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ---------- Sidebar ---------- */}
      <aside
        className={`sidebar fixed top-0 left-0 z-40 h-full -backdrop-blur-[1px] w-72 ${!isDarkMode ? "bg-black/50 drop-shadow-lg/10 drop-shadow-gray-500":"bg-white/90  font-bold text-black  drop-shadow-lg/90"}  p-6  rounded-tr-[5%] rounded-br-[5%] ${
          open ? "translate-x-0" : "-translate-x-full"} 
          max-[400px]:w-60 max-[400px]:text-[0.8rem] max-[400px]:border
        `}
      >
        <div className= {`flex mb-10 mt-20 text-[1.4em] font-extrabold text-nowrap ${!isDarkMode ? "text-white":"text-black"} `}>
          <span className="animate-spin transition-all duration-400 -p-1">☀</span>
          <h2 className="ml-2 border-b-2  border-dashed text-linear-to-r from-cyan-400 to-blue-600">
            Weather Application
          </h2>
        </div>
        <div className="flex flex-col gap-1 text-lg overflow-y-auto no-scrollbar h-full">
          <span className = {` flex text-xl border-dashed  font-bold mb-5 border-b-5 pb-2 justify-center ${!isDarkMode ? "text-white":"text-black "} `}>Preference
             <img 
                src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/preference_white.svg":"/Icon/weather icon/feature/daymode/preference_black.svg"}
                className = "ml-1.5 w-7 h-7 animate-spin transition-all duration-800"
             />
          </span>
          <span className={` font-bold ${!isDarkMode ? "text-white":"text-black"} `}>Forecast 
            <div onClick={() => setIsForecastOn(!isForecastOn)} className= "relative flex  cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600  shadow-inner">
                  <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400 to-blue-500  shadow-md drop-shadow-lg/90 transition-transform duration-500 ease-in-out ${isForecastOn ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
                  <div className = {`relative left-3 z-10 flex w-0.5items-center justify-center py-2 font-bold transition-colors  ${isForecastOn ? "text-white":"text-gray-400 text-shadow-gray-900 text-shadow-lg/80"}`}>ON</div>
                  <div className={`relative left-3 z-10 flex w-1/2 items-center ml-5 justify-center py-2 font-bold transition-colors  ${!isForecastOn ? 'text-white' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80'}`}>OFF</div>
              </div>
          </span>
          <span className={` font-bold ${!isDarkMode ? "text-white":"text-black"} `}>Temperature 
              <div onClick={() => setIsCelsius(!isCelsius)} className= "relative flex cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600 shadow-inner">
               <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400 to-blue-500 drop-shadow-lg/90 shadow-md transition-transform duration-500 ease-in-out ${isCelsius ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
               <div className = {`relative left-3 z-10 flex w-0.5  items-center justify-center py-2 font-bold transition-colors ${isCelsius ? "text-white":"text-gray-400 text-shadow-lg/80"}`}>C°</div>
               <div className={`relative left-6 z-10 flex w-1/2 items-center ml-5 justify-center py-2 font-bold transition-colors  ${!isCelsius ? 'text-white' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80 '}`}>F°</div>
           </div>
          </span>
          <span className = {` font-bold ${!isDarkMode ? "text-white":"text-black"} `}>Mode
           <div onClick={() => setIsDarkMode(!isDarkMode)} className= "relative flex cursor-pointer w-35 my-5 p-3 items-center justify-center rounded-full bg-gray-600  shadow-inner">
                  <div className = {`absolute h-9 w-17 rounded-full  
                     shadow-md drop-shadow-lg/90 p-5 transition-transform duration-500 ease-in-out 
                     ${isDarkMode ? "-translate-x-8 bg-linear-to-r  from-cyan-400 to-blue-600":"translate-x-8 bg-linear-to-l  from-black/80 via-white/5 to-black/90"}`}
                     />           
                    <img src ={isDarkMode ? "/Icon/weather icon/feature/darkmode/light_white.svg":"/Icon/weather icon/feature/daymode/light_black.svg"} className = "w-7 h-7 z-20 mr-8"/>
                    <img src = {isDarkMode ? "/Icon/weather icon/feature/daymode/darkmoon.svg":"/Icon/weather icon/feature/darkmode/whitemoon.svg"} className = "w-7 h-7 z-20"/>
            </div>
          </span>  
          <span className = {` font-bold ${!isDarkMode ? "text-white":"text-black"} `}>Hours
              <div onClick={() => setIsLocalHours(!islocalHour)} className= "relative flex cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600  shadow-inner">
                  <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400
                    to-blue-500  shadow-md drop-shadow-lg/90 transition-transform duration-500 ease-in-out ${islocalHour ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
                  <div className = {`relative left-3 z-10 flex w-0.5  items-center justify-center py-2 font-bold transition-colors  ${islocalHour ? "text-white":"text-gray-400 text-shadow-gray-900 text-shadow-lg/80"}`}>24H</div>
                  <div className={`relative left-6 z-10 flex w-1/2 items-center ml-5 justify-center py-2 font-bold transition-colors  ${!islocalHour ? 'text-white' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80'}`}>12H</div>
              </div>
           </span>
     
          <span className ={` font-bold border-b-5 mb-5 border-dashed ${!isDarkMode ? "text-white":"text-black"} `}>Favorite
             <div onClick={() => setIsFavoriteCity(!isFavoriteCity)} className= "relative flex cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600 shadow-inner">
               <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400 to-blue-500 drop-shadow-lg/90 shadow-md transition-transform duration-500 ease-in-out ${isFavoriteCity ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
               <div className = {`relative left-3 z-10 flex w-0.5  items-center justify-center text-[0.95rem] py-2.5 font-bold transition-colors ${isFavoriteCity? "text-white":"text-gray-400 text-shadow-lg/80"}`}>City</div>
               <div className={`relative left-6 z-10 flex w-1/2 items-center ml-5 text-[0.95rem] justify-center py-2 font-bold transition-colors  ${!isFavoriteCity ? 'text-white' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80 '}`}>Country</div>
           </div>
          </span>

              <span className={`flex  justify-center font-bold text-xl text-center  ${!isDarkMode ? "text-white":"text-black"} `}>About
                    <img 
                    src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/about_white.svg":"/Icon/weather icon/feature/daymode/about_black.svg"}
                    className = "pl-1 w-7 h-7"
                    />              
              </span>
                <div className = "mt-5 mb-70  font-bold gap-4 flex justify-around max-[400px]:text-sm">
                        <button className = {`transition-all duration-400 text-center px-4 py-3  bg-linear-to-l rounded-[10px] border-b-8 \
                        ${!isDarkMode ? "bg-linear-to-tl  from-blue-400 via-cyan-300 to-blue-600 border-blue-900 shadow-lg/50 hover:shadow-blue-600 active:shadow-blue-600 text-black":"  bg-linear-to-tl from-black/90 via-gray-600 to-black  border-gray-900 shadow-lg/50 hover:shadow-blue-600 active:shadow-blue-600 text-white"} \
                        hover:border-b-7 hover:translate-y-1 \
                        active:border-b-0 active:text-blue-200 active:translate-y-2`}>Video</button>
                        <button className = {`transition-all duration-400  text-center px-4 py-3 rounded-[10px] border-b-8 \
                          ${!isDarkMode ? " bg-linear-to-tl from-blue-400 via-cyan-300 border-blue-900 to-blue-600  shadow-lg/50 hover:shadow-blue-600 active:shadow-blue-600 text-black":" shadow-lg/50 hover:shadow-blue-600 active:shadow-blue-600 bg-linear-to-tl from-black/90 via-gray-600 to-black border-gray-900 text-white"} \
                        hover:border-b-7 hover:translate-y-1  \
                        active:border-b-0 active:text-blue-200 active:translate-y-2`}>Summary</button>
                  </div>
        </div>
        
        {/* User Profile & Settings Container */}
        <div ref={settingsRef} className={`absolute drop-shadow-lg/60 z-100 block px-4 py-4  rounded-[15px] bottom-1.5 w-65 right-4 text-md ${isDarkMode ? "text-black bg-white":"text-white bg-gray-900"}
        max-[400px]:w-[90%] max-[400px]:bottom-0.5  `}>
          <div className="flex items-center">
            <img  src={
              (isDarkMode ? "/Icon/weather icon/feature/daymode/search_black.svg":"/Icon/weather icon/feature/darkmode/search_white.svg")
            }  
            className= " relative rounded-full top-0 object-contain w-5 h-5 mr-3 " alt="user" /> 
            <span className="font-bold">{username}</span>
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
                <img src= {(isDarkMode ? "/Icon/weather icon/feature/daymode/detail_black.svg":"/Icon/weather icon/feature/darkmode/detail_white.svg")} className="w-5 h-5 mr-2 " alt="detail" />
                <li className="list-none">Details</li>
              </div> 
            </ul>
          </div>
        </div>
      </aside>

      {/* ---------- Main Dashboard Content ---------- */}
    <main className="relative z-10 flex min-h-screen items-center justify-center p-8">
        <form onSubmit={handleSearch} className="flex h-auto w-full max-w-[80vw]">
          <input
            type="text"
            name="search"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search location..."
            className={`relative -top-87 m-4 left-4 drop-shadow-lg/50 bg-linear-to-r w-full shadow-lg py-2.5 z-1 text-lg focus:outline-none pl-4.5 pr-14 rounded-full
              ${isDarkMode ? "text-white from-black to-black/70 backdrop-blur-md font-bold placeholder-white" : "text-black bg-white/60 backdrop-blur-md placeholder-gray-800 font-bold"}
              max-[400px]:text-sm max-[400px]:-top-60 max-[400px]:left-7`}
          />
          <button type="submit" disabled={loading} className="relative right-11 -top-77 -translate-y-1/2 z-2">
            <img
              src={isDarkMode ? "/Icon/weather icon/feature/daymode/search_black.svg" : "/Icon/weather icon/feature/darkmode/search_white.svg"}
              className={`h-10 w-11 p-1.5 rounded-full drop-shadow-lg/60 bg-linear-to-bl
                ${!isDarkMode ? "from-gray-500 via-gray-600 to-gray-700" : "from-white to-gray-100"}
                hover:bg-gray-600 active:scale-90
                max-[400px]:w-8 max-[400px]:h-8 max-[400px]:-top-51.5 max-[400px]:right-6`}
            />
          </button>
        </form>

        {/* Display Weather Data (Left Side) */}
        <div className="absolute left-10 top-1/3 flex flex-col gap-2">
          <h1 className={`text-4xl font-bold ${isDarkMode ? "text-black" : "text-white"}`}>
            {weather?.location.city || "Loading..."}, {weather?.location.country || ""}
          </h1>
          <p className={`text-2xl ${isDarkMode ? "text-gray-700" : "text-gray-300"}`}>
            {weather?.weather.climate || ""}
          </p>
            <h1 className={`text-4xl font-bold ${isDarkMode ? "text-black" : "text-white"}`}>
            {weather?.datetime.full_date}
          </h1>
           <h1 className={`text-3xl font-bold ${isDarkMode ? "text-black" : "text-white"}`}>
            {weather?.datetime.current_time || "Loading..."}
          </h1>
          {error && <p className="text-red-500  text-xl font-bold">{error}</p>}
        </div>
       

        <button type = "button" onClick={handleStarClick}>
          <img 
            src={
              isDarkMode 
                ? (isStarred ? "/Icon/weather icon/feature/add_favorite.svg" : "/Icon/weather icon/feature/daymode/daymode_favorite.svg")
                : (isStarred ? "/Icon/weather icon/feature/add_favorite.svg" : "/Icon/weather icon/feature/darkmode/darkmode_favorite.svg")
            } 
            className="absolute top-4 right-10 w-12 h-12 cursor-pointer \
            max-[400px]:w-8 max-[400px]:h-8 max-[400px]:top-5 max-[400px]:right-4" 
            loading="lazy"
          />
        </button>
      </main>

      {/* ---------- Logout Modal ---------- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className={`p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 ${isDarkMode ? "bg-white text-black" : "bg-black text-white"} border border-white/10`}>
            <h3 className="text-xl font-bold mb-6 text-center">
              Are you sure you want to logout your own account?
            </h3>
            <div className="flex justify-center gap-6">
              <button 
                onClick={handleConfirmLogout}
                className=" px-8 py-2 rounded-xl bg-red-600 border-b-8 border-red-900   text-white font-bold transition-all duration-300 active:scale-95
                hover:bg-red-500 hover:border-b-7 hover:translate-y-1
                active:border-b-0 active:text-blue-500 active:translate-y-2"
              >
                Yes
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
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
    </div>
  );
};

export default Weather;