import React from 'react';
import { SimilarSchemes } from '../../Effect_Service/Api/service/similar_city_fetch'; 

interface SimilarCityProps {

  results: SimilarSchemes[];
  isDarkMode: boolean;
  onSelect: (item: SimilarSchemes) => void;
}

const SimilarCity: React.FC<SimilarCityProps> = ({ results, isDarkMode, onSelect }) => {
  if (results.length === 0) return null;

  return (
    <div
      className={`absolute top-full left-0 w-full z-50 mt-2 max-h-60 overflow-y-auto hide-scrollbar rounded-xl shadow-lg border animate-slide-down ${
        !isDarkMode
          ? "bg-black/80 border-white/20 text-white backdrop-blur-md"
          : "bg-white/90 border-black/20 text-black backdrop-blur-md"
      }`}
    >
      <ul className="flex flex-col py-2">
        {results.map((item, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className={`w-full text-left px-4 py-2 hover:bg-cyan-500/20 transition-colors ${
                !isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              <span className="font-bold">
                {item.city}
            
                <span>{item.type ? `, ${item.type}` : ""}</span>
                
                {/* ✅ ការពារករណី lat ឬ lon ទំនេរ */}
                {item.lat !== undefined && item.lon !== undefined && (
                  <span className="absolute left-83 text-sm opacity-60">
                    {item.lat.toFixed(2)}, {item.lon.toFixed(2)}
                  </span>
                )}
                
                <span className="text-sm flex w-full items-end">
                  {/* ✅ ការពារករណី country ទំនេរ */}
                  ({item.country ? item.country.toLocaleUpperCase() : "UNKNOWN"})
                  
                  {/* ✅ ការពារករណី country_code ទំនេរ */}
                  {item.country_code && (
                    <img 
                      src={item.country.toLowerCase() !== "antarctica" 
                        ? `https://flagcdn.com/w80/${item.country_code.toLowerCase()}.png`
                        : "/Icon/weather icon/feature/antartica_flag.svg"}
                      className="w-8 h-5 ml-3" 
                      alt="flag"
                    />
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SimilarCity;