import React from 'react';
import { FavoriteSchemes } from './Api/service/favorite.tsx';
import { playAnimeClick } from './sound_effect.tsx';
import { getWeatherIcon } from '../Interface/Background.tsx';

interface FavoriteHistoryProps {
  isCelsius: boolean;
  isfarh: boolean;
  cloneCity: string | undefined;
  isOpen: boolean;
  onSearch: (city: string) => void;
  onClose: () => void;
  favList: FavoriteSchemes[];
  isDarkMode: boolean;
  onDelete: (fav_id: string) => void;
  onDeleteAll: () => void;
}

const FavoriteHistory: React.FC<FavoriteHistoryProps> = ({
  isCelsius,
  isfarh,
  isOpen,
  onClose,
  onSearch,
  favList,
  isDarkMode,
  onDelete,
  onDeleteAll,
}) => {
  if (!isOpen) return null;

  const handleClearAll = () => {
    playAnimeClick();
    onDeleteAll();
  };

  const handleClose = () => {
    playAnimeClick();
    onClose();
  };

  const handleDeleteByOne = (fav_id: string) => {
    playAnimeClick();
    onDelete(fav_id);
  };

  const handleResearch = (city: string) => {
    onSearch(city);
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 transition-opacity duration-300">
      {/* Expanded large container width: max-w-2xl */}
      <div
        className={`
          animate-modal-pop w-[95vw] max-w-2xl p-6 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] backdrop-blur-md ${
            !isDarkMode
              ? "bg-black/80 text-white"
              : "bg-white/80 text-black"
          }`}
      >
        <h2
          className={`text-2xl mx-auto text-nowrap flex font-bold mb-4 text-center border-b-2 pb-5 ${
            !isDarkMode ? "text-white" : "text-black"
          }`}
        >
          Favorite History
          <img
            src={
              !isDarkMode
                ? "/Icon/weather icon/feature/darkmode/history_white.svg"
                : "/Icon/weather icon/feature/daymode/history_black.svg"
            }
            className={`w-8 h-8 pb-0 relative mx-4 -top-0.5 active:scale-90 hover:scale-95`}
            alt="history icon"
          />
        </h2>
        <button className = "absolute right-8 max-[500px]:right-6 hover:scale-95 active:scale-90">
             <img 
              src = {isDarkMode? "/Icon/weather icon/feature/daymode/refresh_black.svg":"/Icon/weather icon/feature/darkmode/refresh_white.svg"}
              className = "w-10 h-10 max-[500px]:w-8 max-[500px]:h-8"/>
        </button>
       
        {/* Scrollable list container */}
        <div className="flex-1 overflow-y-auto hide-scrollbar h-full flex flex-col gap-3 mb-4 pr-1">
          {favList.length === 0 ? (
            <p className="text-center italic opacity-70 mt-4">No favorites yet.</p>
          ) : (
            favList.map((fav) => (
              <React.Fragment key={fav.fav_id}>
                <div
                  className={`relative flex justify-between items-center p-4 rounded-2xl border shadow-sm cursor-pointer active:scale-98 hover:scale-[0.99] transition-all duration-200 ${
                    isDarkMode
                      ? "border-white/10 shadow-lg/10 shadow-black bg-white/5"
                      : "bg-black/20 border-black/10 shadow-lg/20 shadow-white"
                  }`}
                >
                  {/* 1. Background Flag Layer (Fixed: covers entire card cleanly as texture) */}
                  {fav.country_code && (
                    <div
                      className="absolute inset-0 z-0 pointer-events-none  top-1 rounded-2xl max-[500px]:left-0 "
                      style={{
                        backgroundImage: `url(https://flagcdn.com/w320/${fav.country_code.toLowerCase()}.png)`,
                        backgroundSize: "40rem 15rem", 
                        backgroundPosition:"center",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                  )}

                  {/* 2. Opacity Overlay */}
                  {fav.country_code && (
                    <div
                      className={`absolute inset-0 z-0  pointer-events-none rounded-2xl h-full ${
                        !isDarkMode ? "bg-black/60 " : "bg-white/40"
                      }`}
                    />
                  )}

                  {/* 3. Content Layer */}
                  <div
                    className="relative z-10 w-full text-nowrap  flex items-center justify-between"
                    onClick={() => handleResearch(fav.city)}
                  >
                    <div className="flex flex-col  gap-1">
                       <h1 className="font-bold relative -top-9 flex items-center text-lg">
                              <img
                                src={`${
                                  isDarkMode
                                    ? "/Icon/weather icon/feature/daymode/location_black.svg"
                                    : "/Icon/weather icon/feature/darkmode/location_white.svg"
                                }`}
                                className={`w-5 h-5 block mr-2`}
                                alt="location icon"
                              />
                      
                            <span className = "relative top-1 text-wrap">{fav.city}</span>
                         </h1>
                        <span className="items-center flex ml-6.5 relative -top-9  text-base font-normal opacity-90">
                          {fav.country.toUpperCase() === "N/A"
                            ? ""
                            : `${fav.country.toUpperCase()}`}
                          <img
                            src={
                              fav.city.toLowerCase() !== "antarctica"
                                ? `https://flagcdn.com/w80/${fav.country_code.toLowerCase()}.png`
                                : "/Icon/weather icon/feature/antartica_flag.svg"
                            }
                            alt="Country Flag"
                            className="w-8 h-8 ml-2 object-contain rounded-sm"
                          />
                        </span>
                    
                      <h3 className="text-md opacity-80 relative top-8 pl-5">
                        <span className="mr-1 opacity-70">Added:</span>
                        {fav.full_date}, {fav.time}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 mr-12 max-[500px]:right-50 max-[500px]:top-7 relative">
                      <span className="relative text-2xl my-15 font-semibold flex items-center gap-2">
                        {isCelsius
                          ? fav.temp.celsius === undefined
                            ? "Loading..."
                            : `${fav.temp.celsius.toFixed(1)}°C`
                          : fav.temp.fahrenheit === undefined
                          ? "Loading..."
                          : isfarh
                          ? `${fav.temp.fahrenheit.toFixed(1)}°F`
                          : `${fav.temp.kelvin.toFixed(1)}K`}
                        <img
                          src={getWeatherIcon(fav.climate, fav.daytime)}
                          alt="weather response"
                          className="w-9 h-9 p-1"
                        />
                      </span>
                    </div>
                  </div>

                  {/* 4. Delete Button Layer */}
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20  max-[500px]:top-4.5 max-[500px]:right-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteByOne(fav.fav_id);
                    }}
                  >
                    <img
                      src="/Icon/weather icon/feature/trash.svg"
                      alt="trash delete"
                      className="w-7 h-7 hover:scale-110 drop-shadow-lg/30 active:scale-95 duration-200 transition-transform cursor-pointer"
                    />
                  </button>
                </div>
              </React.Fragment>
            ))
          )}
        </div>

        <div className="flex gap-4 pt-2">
          <button
            onClick={handleClearAll}
            disabled={favList.length === 0}
            className="flex-1 py-2.5 bg-red-800 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all active:scale-95"
          >
            Clear All
          </button>
          <button
            onClick={handleClose}
            className={`flex-1 py-2.5 font-bold rounded-xl transition-all active:scale-95 ${
              !isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-300 hover:bg-gray-400 text-black"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavoriteHistory;