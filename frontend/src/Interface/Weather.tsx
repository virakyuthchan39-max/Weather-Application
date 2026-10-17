
import React, { useState, useEffect, useRef } from 'react';
import "./weather.css";
import "../Interface/welcome/account.css";

interface WeatherProps {
  username: string;
  onLogout?: () => void;
  onDetail?: () => void;
}

const Weather: React.FC<WeatherProps> = ({ username, onLogout, onDetail }) => {
  const [open, setOpen] = useState(false);
  const [settingClick, setSettingClick] = useState(false);

  // Ref to track settings container and icon for outside-click detection
  const settingsRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setOpen((prev) => !prev);
  const closeSidebar = () => setOpen(false);

  // Toggle function for settings popup
  const handleSettingClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to window listener
    setSettingClick((prev) => !prev);
  };

  // Close popup when clicking outside
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



  return (
    <div className= {`relative min-h-screen w-full text-white font-welcome transition-colors duration-500 ${!isDarkMode ? "bg-black":"bg-white"}`}>      {/* ---------- Hamburger Button ---------- */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed top-5 left-5 z-50 flex h-12 w-12 cursor-pointer flex-col items-center justify-center rounded-lg bg-black/80 backdrop-blur-md shadow-lg hover:bg-gray-600"
        aria-label="Toggle menu"
      >
        <span className={`bar ${open ? "open-1" : ""}`} />
        <span className={`bar ${open ? "open-2" : ""}`} />
        <span className={`bar ${open ? "open-3" : ""}`} />
      </button>

      {/* ---------- Backdrop ---------- */}
      <div
        onClick={closeSidebar}
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-350 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ---------- Sidebar ---------- */}
      <aside
        className={`sidebar fixed top-0 left-0 z-40 h-full  w-72 bg-black/80 backdrop-blur-md shadow-2xl p-6 border-r rounded-tr-[5%] rounded-br-[5%] border-gray-800 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex mb-15 mt-20 text-[1.4em] font-extrabold text-nowrap text-cyan-400">
          <span>☀</span>
          <h2 className="ml-2 border-b-2 border-dashed text-linear-to-r from-cyan-400 to-blue-600">
            Weather Application
          </h2>
        </div>
        <div className="flex flex-col gap-8 text-lg">
          
          <span className="text-cyan-400 font-bold">Forecast 
            <div onClick={() => setIsForecastOn(!isForecastOn)} className= "relative flex  cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600  shadow-inner">
                  <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400
                    
                    to-blue-500  shadow-md drop-shadow-lg/90 transition-transform duration-500 ease-in-out ${isForecastOn ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
                  <div className = {`relative left-3 z-10 flex w-0.5items-center justify-center py-2 font-bold transition-colors  ${isForecastOn ? "text-black":"text-gray-400 text-shadow-gray-900 text-shadow-lg/80"}`}>ON</div>
                  <div className={`relative left-3 z-10 flex w-1/2 items-center ml-5 justify-center py-2 font-bold transition-colors  ${!isForecastOn ? 'text-black' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80'}`}>OFF</div>
              </div>
          </span>
          <span className="hover:text-cyan-300 transition-colors">Temperature 
              <div onClick={() => setIsCelsius(!isCelsius)} className= "relative flex cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600 shadow-inner">
               <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400 to-blue-500 drop-shadow-lg/90 shadow-md transition-transform duration-500 ease-in-out ${isCelsius ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
               <div className = {`relative left-3 z-10 flex w-0.5  items-center justify-center py-2 font-bold transition-colors ${isCelsius ? "text-black":"text-gray-400 text-shadow-lg/80"}`}>C°</div>
               <div className={`relative left-6 z-10 flex w-1/2 items-center ml-5 justify-center py-2 font-bold transition-colors  ${!isCelsius ? 'text-black' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80 '}`}>F°</div>
           </div>
          </span>
         
          <span>Hours
                  
              <div onClick={() => setIsLocalHours(!islocalHour)} className= "relative flex cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600  shadow-inner">
                  <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400
                    
                    to-blue-500  shadow-md drop-shadow-lg/90 transition-transform duration-500 ease-in-out ${islocalHour ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
                  <div className = {`relative left-3 z-10 flex w-0.5  items-center justify-center py-2 font-bold transition-colors  ${islocalHour ? "text-black":"text-gray-400 text-shadow-gray-900 text-shadow-lg/80"}`}>24H</div>
                  <div className={`relative left-6 z-10 flex w-1/2 items-center ml-5 justify-center py-2 font-bold transition-colors  ${!islocalHour ? 'text-black' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80'}`}>12H</div>
              </div>
           </span>
     
          <span className ="">Favorite
             <div onClick={() => setIsCelsius(!isCelsius)} className= "relative flex cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600 shadow-inner">
               <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400 to-blue-500 drop-shadow-lg/90 shadow-md transition-transform duration-500 ease-in-out ${isCelsius ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
               <div className = {`relative left-3 z-10 flex w-0.5  items-center justify-center py-2 font-bold transition-colors ${isCelsius ? "text-black":"text-gray-400 text-shadow-lg/80"}`}>C°</div>
               <div className={`relative left-6 z-10 flex w-1/2 items-center ml-5 justify-center py-2 font-bold transition-colors  ${!isCelsius ? 'text-black' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80 '}`}>F°</div>
           </div>
          </span>
          <span className="hover:text-cyan-300 transition-colors">About
              <div onClick={() => setIsLocalHours(!islocalHour)} className= "relative flex cursor-pointer w-35 my-5 items-center justify-center rounded-full bg-gray-600  shadow-inner">
                  <div className = {`absolute h-9 w-17 rounded-full  from-cyan-400
                    
                    to-blue-500  shadow-md drop-shadow-lg/90 transition-transform duration-500 ease-in-out ${islocalHour ? "-translate-x-8 bg-linear-to-r":"translate-x-8 bg-linear-to-l"}`}/>
                  <div className = {`relative left-3 z-10 flex w-0.5  items-center justify-center py-2 font-bold transition-colors  ${islocalHour ? "text-black":"text-gray-400 text-shadow-gray-900 text-shadow-lg/80"}`}>24H</div>
                  <div className={`relative left-6 z-10 flex w-1/2 items-center ml-5 justify-center py-2 font-bold transition-colors  ${!islocalHour ? 'text-black' : 'text-gray-400 text-shadow-gray-900 text-shadow-lg/80'}`}>12H</div>
              </div>
          </span>
        </div>

        {/* User Profile & Settings Container */}
        <div ref={settingsRef} className="sticky  z-100 block px-4 py-2 bg-gray-900 rounded-[15px] bottom-6 w-65 right-3 text-md">
          <div className="flex items-center">
            <img src="/Icon/weather icon/feature/day.svg" className="relative rounded-full top-0.5 object-contain w-5 h-5 mr-3" alt="user" /> 
            <span className="font-bold text-white">{username}</span>
            <img 
              onClick={handleSettingClick}
              src="/Icon/weather icon/feature/setting_white.svg"
              className="w-6 h-6 relative top-0.1 ml-auto transition-all duration-500 animate-spin cursor-pointer hover:scale-90 active:scale-80" 
              alt="settings"
            />
          </div>

          {/* ---------- Settings Popup Menu ---------- */}
          {settingClick && (
            <div className="absolute bottom-11 left-55 z-45 bg-gray-900 w-52 text-left p-3 text-lg font-bold rounded-[15px] border-2 border-gray-800 shadow-xl">
              <ul className="space-y-1">
                <div 
                  onClick={onLogout} 
                  className="flex items-center px-3 py-2 rounded-[10px] hover:bg-gray-700 cursor-pointer"
                >
                  <img src="/Icon/weather icon/feature/logout.svg" className="w-5 h-5 mr-2" alt="logout" />
                  <li className="text-red-500 list-none">Logout</li>
                </div>  
                <div 
                  onClick={onDetail} 
                  className="flex items-center px-3 py-2 rounded-[10px] hover:bg-gray-700 cursor-pointer"
                >
                  <img src="/Icon/weather icon/feature/detail.svg" className="w-5 h-5 mr-2" alt="detail" />
                  <li className="text-white list-none">Details</li>
                </div> 
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* ---------- Main Dashboard Content ---------- */}
      <main className="flex min-h-screen items-center justify-center p-8">
        <div onClick={() => setIsDarkMode(!isDarkMode)} className= "absolute flex top-1 right-2 cursor-pointer w-35 my-5 p-3 items-center justify-center rounded-full bg-gray-600  shadow-inner">
                  <div className = {`absolute  h-9 w-17 rounded-full  
                     shadow-md drop-shadow-lg/90 p-5 transition-transform duration-500 ease-in-out 
                     ${isDarkMode ? "-translate-x-8 bg-linear-to-r  from-cyan-400 to-blue-600":"translate-x-8 bg-linear-to-l  from-black/80 via-white/5 to-black/90"}`}
                     />           
                    <img src = "/Icon/weather icon/feature/day.svg" className = "w-7 h-7 z-20 mr-8"/>
                    <img src = "/Icon/weather icon/feature/dark.svg" className = "w-7 h-7 z-20"/>
            </div>
      </main>
    </div>
  );
};

export default Weather;

