import React, { useEffect, useRef } from 'react';
import { SimilarSchemes } from '../../Effect_Service/Api/service/similar_city_fetch'; 

interface SimilarCityProps {
  error: string;
  results: SimilarSchemes[];
  isDarkMode: boolean;
  onSelect: (item: SimilarSchemes) => void;
  onClose: () => void; // ✅ បន្ថែម Prop សម្រាប់បិទ Dropdown
}

const SimilarCity: React.FC<SimilarCityProps> = ({ results, isDarkMode, onSelect, error, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ ចាប់ Event ពេលចុចខាងក្រៅ ដើម្បីបិទ Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      event.stopPropagation();
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // បើគ្មានទាំង Error និង Results -> មិនបង្ហាញអ្វីទាំងអស់
  if (results.length === 0 && !error) return null;

  return (
    <div
      ref={dropdownRef} // ✅ ភ្ជាប់ Ref ទៅកាន់ Container
      className={`absolute top-full left-0 w-full z-50 mt-2 max-h-60 overflow-y-auto hide-scrollbar rounded-xl shadow-lg border animate-slide-down ${
        !isDarkMode
          ? "bg-black/80 border-white/20 text-white backdrop-blur-md"
          : "bg-white/90 border-black/20 text-black backdrop-blur-md"
      }`}
    >
      {/* ✅ បង្ហាញ Error ពេលគ្មាន Results ឬពេលមានបញ្ហា Connection */}
      {error && (
        <p className="text-center p-4 font-bold text-red-500">
          {error.toLowerCase().includes("weather service unreachable:") 
            ? "Failed the connection! Please check your network" 
            : (error.toLowerCase().includes("429") ? `Too much request! Please wait for a minute` :"")}
        </p>
      )} 
    
      {/* ✅ បង្ហាញ List ពេលមាន Results (ទោះមាន Error ឬអត់) */}
      {results.length > 0 && (
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
              
                  <span>{item.type.toUpperCase() === "N/A" ? "":`, ${item.type}` }</span>
                  
                  {item.lat !== undefined && item.lon !== undefined && (
                    <span className="absolute left-83 text-sm opacity-60">
                      {item.lat.toFixed(2)}, {item.lon.toFixed(2)}
                    </span>
                  )}
                  
                  <span className="text-sm flex w-full items-end">
                    ({item.country ? item.country.toLocaleUpperCase() : "UNKNOWN"})
                    
                    {item.country_code && (
                      <img 
                        src={item.country.toLowerCase() !== "antarctica" 
                          ? `https://flagcdn.com/w80/${item.country_code.toLowerCase()}.png`
                          : "/Icon/weather icon/feature/antartica_flag.png"} // កែពី .svg ទៅ .png បើចាំបាច់
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
      )}
    </div>
  );
};

export default SimilarCity;