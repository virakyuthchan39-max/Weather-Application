import React from 'react';
import { FavoriteSchemes } from './Api/service/favorite.tsx';
import { playAnimeClick } from './sound_effect.tsx';

interface FavoriteHistoryProps {
  isCelsius:boolean
  isfarh: boolean
  cloneCity: string | undefined;
  isOpen: boolean;
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
  favList,
  isDarkMode,
  onDelete,
  onDeleteAll,
}) => {
  if (!isOpen) return null;
  const handleClearAll = () =>{
      playAnimeClick();
      onDeleteAll();
  }
  const handleClose = () =>{
    playAnimeClick()
    onClose();
  }
  const handleDeleteByOne = (fav_id:string)=>{
    playAnimeClick();
    onDelete(fav_id);
  }
    return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 transition-opacity duration-300">
      <div
        className={`animate-modal-pop w-[90vw] max-w-md p-6 rounded-3xl shadow-2xl flex flex-col max-h-[80vh] backdrop-blur-md ${
         
          !isDarkMode
            ? "bg-black/80 text-white"
            : "bg-white/80 text-black"
        }`}
      >
        <h2
          className={`text-2xl mx-18 text-nowrap flex font-bold mb-4 text-center border-b-3 pb-5 ${
            !isDarkMode ? "text-white" : "text-black"
          }
           max-[600px]:mx-10
           `}
        >
          Favorite History
             <img src = {!isDarkMode ?  "/Icon/weather icon/feature/darkmode/history_white.svg":"/Icon/weather icon/feature/daymode/history_black.svg"} 
                    className = {`w-8 h-8 pb-0  relative mx-4  -top-0.5          
                    active:scale-90 hover:scale-95
                    max-[600px]:-right-1 max-[600px]:mx-2`}/>
              
        </h2>

        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-3 mb-4">
          {favList.length === 0 ? (
            <p className="text-center italic opacity-70 mt-4">No favorites yet.</p>
          ) : (
            favList.map((fav) => (
              <div
                key={fav.fav_id}
                className={`relative flex justify-between items-center p-4 rounded-xl border shadow-sm ${
                  isDarkMode
                    ? "bg-white border-white/10 shadow-lg/10 shadow-black"
                    : "bg-black/50 border-black/10 shadow-lg/20 shadow-white"
                }`}
              >
                <div>
                  <h3 className="font-bold block text-lg"> 
                      <span className = "flex">
                            <img src = {`${isDarkMode ? "/Icon/weather icon/feature/daymode/location_black.svg":"/Icon/weather icon/feature/darkmode/location_white.svg"}`}
                                  className={` relative  flex ${ isDarkMode ? "w-7 h-7":"w-5 h-5"} mr-1 
                                  max-[600px]:w-6 max-[600px]:h-6 max-[600px]:-top-1
                                  `}/>
                          {fav.city}    
                      </span>  
                      <span className = "absolute flex left-60 mt-0 \
                      max-[600px]:relative max-[600px]:left-5  max-[600px]:my-5 max-[600px]:flex">
                          { isCelsius ? (fav.temp.celsius === undefined ? (<span className = "text-3xl m-8 py-15">Loading...</span>) 
                            :
                            fav.temp.celsius.toFixed(1) + " " + "C°")
                            :
                            fav.temp.fahrenheit === undefined ? (<span className = "text-3xl m-8 py-15">Loading...</span>):(isfarh ? fav.temp.fahrenheit.toFixed(1) + " " + "F°"
                            : 
                            fav.temp.kelvin.toFixed(1) + " K°")}
                  
                    <img src = "/Icon/weather icon/weather/cloudy.svg" alt = "weather response" className = "w-9 h-9 p-1 relative -top-1"/>
                      </span>
                        <span className="flex ml-5.5">{fav.country.toUpperCase() === "N/A" ? "":`${fav.country}`}
                        <img src={fav.city.toLowerCase() !== "antarctica" ? `https://flagcdn.com/w80/${fav.country_code.toLowerCase()}.png`:"/Icon/weather icon/feature/antartica_flag.svg"}
                          alt="Country Flag"
                          className="w-6 h-6 ml-2 relative top-0.5 object-contain rounded-[5px] " />
              
                    </span>
                  </h3>
                  <p className="text-sm block opacity-70 relative left-5 pt-4">{fav.time}</p>
                </div>
                <button
                  className = "max-[600px]:relative max-[600px]:-top-21 mt-2"
                  onClick={ () => handleDeleteByOne(fav.fav_id)}
                >
                 <img src = "/Icon/weather icon/feature/trash.svg" alt = "trash delete" className ="hover:scale-95 active:scale-90 duration-300 transition-transform cursor-pointer"/>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleClearAll}
            disabled={favList.length === 0}
            className="flex-1 py-2 bg-red-800 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all active:scale-95"
          >
            Clear All
          </button>
          <button
            onClick={handleClose}
            className={`flex-1 py-2 font-bold rounded-xl transition-all active:scale-95 ${
              !isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-300 hover:bg-gray-400 text-black"
            }`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavoriteHistory;