import React from 'react';
import '../weather.css';
import { playAnimeClick } from '../../Effect_Service/sound_effect';
import { playButtonSound } from '../../Effect_Service/sound_effect';
const TRACKS = [
  { id: 1, name: "Calm Piano", path: "/Audio/Music/weather/relax/Calm_Panio.mp3" },
  { id: 2, name: "Ocean of Peace", path: "/Audio/Music/weather/relax/Ocrean_Of_Peace.mp3" },
  { id: 3, name: "Lofi", path: "/Audio/Music/weather/relax/Lofi.mp3" },
  { id: 4, name: "Good Weather", path: "/Audio/Music/weather/relax/Good_Weather.mp3" },
  
];

const Musician = [
  { id: 1, name: "Stay (Justin Bieber)", path: "/Audio/Music/weather/Stay_justin_bieber.mp3" },
  { id: 2, name: "See You Again (Wia Khalifa)", path: "/Audio/Music/weather/See_You_Again_Wiz_Khalifa.mp3" },
  { id: 3, name: "A Thousand Mile (Vanessa Carlton)", path: "/Audio/Music/weather/A_Thousand_Miles.mp3" },
  { id: 4, name: "Faded (Alan Walker)", path: "/Audio/Music/weather/Alan_Walker_Faded.mp3" },
  {id:5,   name:"As It Was (Harry Styles)",path:"/Audio/Music/weather/As It Was by Harry Styles .mp3"},
  {id:6, name:"Try to feel alive (Portor Robinson)",path:"/Audio/Music/weather/Trying to Feel Alive.mp3"}
  
];

const EDM = [
  { id: 1, name: "Joyful", path: "/Audio/Music/weather/edm/happy_edm.mp3" },
  { id: 2, name: "Reality", path: "/Audio/Music/weather/edm/edm_relax.mp3" },
  { id: 3, name: "Motion Chill", path: "/Audio/Music/weather/edm/motion-chill.mp3" },
  { id: 4, name: "Neon Sky", path: "/Audio/Music/weather/edm/neon_sky.mp3" },
];

const ORC = [
  {id: 1, name: "Epic Heart", path: "/Audio/Music/weather/orchestra/Epic_Heart.mp3" },
  {id:2, name: "Echoes of lumen emotional", path:"/Audio/Music/weather/orchestra/echoes_of_lumen_emotional.mp3"},
  {id:3, name: "Calming",path:"/Audio/Music/weather/orchestra/Calming.mp3"},
  {id:4, name:"Peace of love", path:"/Audio/Music/weather/orchestra/peace_and_love.mp3"}
];

interface MusicListProps {
  isOpen: boolean;
  isDarkMode: boolean;
  isMusicStart: boolean
  onClose: () => void;
  currentTrack: string;
  onSelect: (path: string) => void;
}

const MusicList: React.FC<MusicListProps> = ({ isOpen,isDarkMode, isMusicStart,onClose, currentTrack, onSelect }) => {
  if (!isOpen) return null;
  const handleCloseBanner = () =>{
    playButtonSound();
    onClose();
  }
  const handleSelect = (track:string) =>{
    playAnimeClick();
    onSelect(track);
  }
  return (
    <>    
    <div className={`fixed inset-0 z-200 h-full  flex items-center justify-center backdrop-blur-[2px] ${!isDarkMode ? "bg-black":"bg-white"} transition-opacity duration-300`}>
     <div className={` animate-modal-pop  w-full h-full rounded-3xl p-6  text-white  hide-scrollbar shadow-2xl`}>
      <div className = {` bg-[url('/Icon/Amano_Hina.avif')]  bg-cover  bg-center opacity-80  w-full h-full absolute blur-md drop-shadow-lg/90 drop-shadow-blue-400 -z-1
        max-[500px]:blur-sm max-[500px]:left-0`}/> 
        <button
          onClick={handleCloseBanner}
          className="flex justify-end cursor-pointer items-end w-full h-auto"
        >
          <img 
          src ="/Icon/weather icon/feature/red_cross.svg" 
          className = "w-8 h-8 drop-shadow-lg/90 hover:scale-90 active:scale-80  "
          alt = "exit button"/>
        </button>
        <div className = "block mx-15 text-nowrap border-b-2 -pb-1 ">
            <h2 className={`text-2xl flex font-bold mb-10  ${isDarkMode ? "text-black":"text-white"}  text-center tracking-wider
            `}>
              Music Playlist
              <img src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/music_white.svg":"/Icon/weather icon/feature/daymode/music_black.svg"} 
              className = "w-8 h-8 ml-3 drop-shadow-lg/50"/>
              :
            </h2>
        </div> 
     <div className = "flex gap-15 mt-5 w-full overflow-y-auto no-scrollbar h-full \
     max-[600px]:block  \
     max-[1800px]:grid max-[1800px]:grid-cols-3 max-[1800px]:justify-items-center max-[1800px]:content-normal \
     max-[1200px]:grid max-[1200px]:grid-cols-2 ">
        <ul className="flex flex-col gap-4  mb-10">
          <span className = {`text-center ${!isDarkMode ? "text-white drop-shadow-black":"text-black"} text-shadow-lg/20  text-2xl
          max-[500px]:mb-5`}
           >Relax Music:</span>
          {TRACKS.map((track) => (
            <li key={track.id}>
              <button
                onClick={() => {handleSelect(track.path)}}
                className={`w-85 relative flex text-left whitespace-break-spaces  text-[0.95rem] px-5 py-3 cursor-pointer rounded-xl transition-all duration-300 font-semibold border-b-4 
                  max-[800px]:w-70 
                  max-[500px]:w-62 
                  ${currentTrack === track.path 
                    ? 'bg-cyan-600 border-cyan-900 text-white shadow-lg/50' 
                    : `${isDarkMode ? "bg-gray-900/90 text-white  border-b-4 border-black \
                        hover:bg-gray-600 hover:border-gray-500 \
                        active:bg-gray-600"
                        :
                        "bg-white/90 text-black border-b-4 border-gray-400 \
                         hover:bg-gray-500 hover:border-gray-500 \
                         ative:bg-gray-500"}  `}
                  } active:border-b-0 active:translate-y-1`}
              >
                {track.name}
              {currentTrack === track.path && <img src = {isMusicStart ? "/Icon/weather icon/feature/darkmode/muted_white.svg":"/Icon/weather icon/feature/darkmode/unmuted_white.svg"}
                alt = "Volume Music" 
                className = {`w-9 h-9 absolute left-75 -m-1.5
                max-[800px]:left-60
                max-[500px]:left-52`}/>}
              </button>
            </li>
          ))}
        </ul>
         <ul className="flex flex-col gap-4  mb-20 ">
          <span className = {`text-center ${!isDarkMode ? "text-white":"text-black drop-shadow-whit"} text-shadow-lg/20 text-2xl 
          max-[500px]:my-5`
           }>Orchestra Music:</span>
          {ORC.map((track) => (
            <li key={track.id}>
              <button
                onClick={() => {handleSelect(track.path)}}
                className={`w-85 relative flex text-left px-5 py-3 cursor-pointer rounded-xl transition-all duration-300 font-semibold border-b-4 
                  max-[800px]:w-70 
                  max-[500px]:w-62
                  ${currentTrack === track.path 
                    ? 'bg-cyan-600 border-cyan-900 text-white shadow-lg/50' 
                    : `${isDarkMode ? "bg-gray-900/90 text-white  border-b-4 border-black \
                        hover:bg-gray-600 hover:border-gray-500 \
                        active:bg-gray-600"
                        :
                        "bg-white/90 text-black border-b-4 border-gray-400 \
                         hover:bg-gray-500 hover:border-gray-500 \
                         ative:bg-gray-500"}  `}
                  } active:border-b-0 active:translate-y-1`}
              >
                {track.name}
              {currentTrack === track.path && <img src = {isMusicStart ? "/Icon/weather icon/feature/darkmode/muted_white.svg":"/Icon/weather icon/feature/darkmode/unmuted_white.svg"}
                alt = "Volume Music" 
                className = {`w-9 h-9 absolute left-75 -m-1.5
                 max-[800px]:left-60
             
                 max-[500px]:left-52`}/>}
              </button>
            </li>
          ))}
        </ul>
         <ul className="flex flex-col gap-4 mb-20">
          <span className = {`text-center ${!isDarkMode ? "text-white":"text-black   drop-shadow-white"} text-shadow-lg/20 text-2xl
           
           max-[500px]:my-5`}>EDM Music:</span>
          {EDM.map((track) => (
            <li key={track.id}>
              <button
                onClick={() => {handleSelect(track.path)}}
                className={`w-85 relative flex text-left px-5 py-3 cursor-pointer rounded-xl transition-all duration-300 font-semibold border-b-4 
                 max-[800px]:w-70 
                  max-[500px]:w-62
                  ${currentTrack === track.path 
                    ? 'bg-cyan-600 border-cyan-900 text-white shadow-lg/50' 
                    : `${isDarkMode ? "bg-gray-900/90 text-white  border-b-4 border-black \
                        hover:bg-gray-600 hover:border-gray-500 \
                        active:bg-gray-600"
                        :
                        "bg-white/90 text-black border-b-4 border-gray-400 \
                         hover:bg-gray-500 hover:border-gray-500 \
                         ative:bg-gray-500"}  `}
                  } active:border-b-0 active:translate-y-1`}
              >
                {track.name}
              {currentTrack === track.path && <img src = {isMusicStart ? "/Icon/weather icon/feature/darkmode/muted_white.svg":"/Icon/weather icon/feature/darkmode/unmuted_white.svg"}
                 alt = "Volume Music"
                 className = {`w-9 h-9 absolute left-75 -m-1.5
                 max-[800px]:left-60
       
                 max-[500px]:left-52`}/>}
              </button>
            </li>
          ))}
        </ul>
           <ul className="flex flex-col gap-4 mb-50">
          <span className = {`text-center ${!isDarkMode ? "text-white":"text-black   drop-shadow-white"} text-shadow-lg/20 text-2xl   
       max-[500px]:my-5`}>Pop Music:</span>
          {Musician.map((track) => (
            <li key={track.id}>
              <button
                onClick={() => {handleSelect(track.path)}}
                className={`w-85 relative flex text-left px-5 py-3.5 cursor-pointer rounded-xl text-[0.75rem] transition-all duration-300 font-semibold border-b-4 
                 max-[800px]:w-70 
   
                  max-[500px]:w-62
                  ${currentTrack === track.path 
                    ? 'bg-cyan-600 border-cyan-900 text-white shadow-lg/50' 
                    : `${isDarkMode ? "bg-gray-900/90 text-white  border-b-4 border-black \
                        hover:bg-gray-600 hover:border-gray-500 \
                        active:bg-gray-600"
                        :
                        "bg-white/90 text-black border-b-4 border-gray-400 \
                         hover:bg-gray-500 hover:border-gray-500 \
                         ative:bg-gray-500"}  `}
                  } active:border-b-0 active:translate-y-1`}
              >
                {track.name}
              {currentTrack === track.path && <img src = {isMusicStart ? "/Icon/weather icon/feature/darkmode/muted_white.svg":"/Icon/weather icon/feature/darkmode/unmuted_white.svg"}
                 alt = "Volume Music"
                 className = {`w-9 h-9 top-2.5 absolute left-75 -m-1.5
                 max-[800px]:left-60
            
                 max-[500px]:left-52`}/>}
              </button>
            </li>
          ))}
        </ul>
     </div>
      </div>
    </div>
    </>
  );
};

export default MusicList;