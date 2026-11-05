import React ,{useState,useEffect} from 'react';
import '../weather.css';
import { playAnimeClick,playButtonSound, } from '../../Effect_Service/sound_effect';

const TRACKS = [
  { id: 1, name: "Calm Piano", path: "/Audio/Music/weather/relax/Calm_Panio.mp3",album:"/Background/feature/music/avif/relax/calm_piano.avif" },
  { id: 2, name: "Ocean of Peace", path: "/Audio/Music/weather/relax/Ocrean_Of_Peace.mp3",album:"/Background/feature/music/avif/relax/ocean_of_peace.avif" },
  { id: 3, name: "Lofi", path: "/Audio/Music/weather/relax/Lofi.mp3",album:"/Background/feature/music/avif/relax/lofi.avif" },
  { id: 4, name: "Good Weather", path: "/Audio/Music/weather/relax/Good_Weather.mp3",album:"/Background/feature/music/avif/relax/good_weather.avif" },
  
];

const Musician = [
  { id: 1, name: "Stay (Justin Bieber)", path: "/Audio/Music/weather/Stay_justin_bieber.mp3",album:"/Background/feature/music/avif/musician/justin_bieber.avif" },
  { id: 2, name: "See You Again (Wia Khalifa)", path: "/Audio/Music/weather/See_You_Again_Wiz_Khalifa.mp3",album:"/Background/feature/music/avif/musician/khalifa.avif" },
  { id: 3, name: "A Thousand Mile (Vanessa Carlton)", path: "/Audio/Music/weather/A_Thousand_Miles.mp3",album:"/Background/feature/music/avif/musician/vanessa_carlthon.avif" },
  { id: 4, name: "Faded (Alan Walker)", path: "/Audio/Music/weather/Alan_Walker_Faded.mp3",album:"/Background/feature/music/avif/musician/alan_walker.avif" },
  {id:5,   name:"As It Was (Harry Styles)",path:"/Audio/Music/weather/As It Was by Harry Styles .mp3",album:"/Background/feature/music/avif/musician/harry_style.avif"},
  {id:6, name:"Try to feel alive (Portor Robinson)",path:"/Audio/Music/weather/Trying to Feel Alive.mp3",album:"/Background/feature/music/avif/musician/porter_robinson.avif"}
  
];

const EDM = [
  { id: 1, name: "Joyful", path: "/Audio/Music/weather/edm/happy_edm.mp3",album:"/Background/feature/music/avif/edm/joyful.avif" },
  { id: 2, name: "Reality", path: "/Audio/Music/weather/edm/edm_relax.mp3",album:"/Background/feature/music/avif/edm/reality.avif" },
  { id: 3, name: "Motion Chill", path: "/Audio/Music/weather/edm/motion-chill.mp3",album:"/Background/feature/music/avif/edm/motion_chill.avif" },
  { id: 4, name: "Neon Sky", path: "/Audio/Music/weather/edm/neon_sky.mp3",album:"/Background/feature/music/avif/edm/neon_sky.avif" },
];

const ORC = [
  {id: 1, name: "Epic Heart", path: "/Audio/Music/weather/orchestra/Epic_Heart.mp3",album:"/Background/feature/music/avif/orchestra/epic_heart.avif" },
  {id:2, name: "Echoes of lumen emotional", path:"/Audio/Music/weather/orchestra/echoes_of_lumen_emotional.mp3",album:"/Background/feature/music/avif/orchestra/emotion.avif"},
  {id:3, name: "Calming",path:"/Audio/Music/weather/orchestra/Calming.mp3",album:"/Background/feature/music/avif/orchestra/calm.avif"},
  {id:4, name:"Peace of love", path:"/Audio/Music/weather/orchestra/peace_and_love.mp3",album:"/Background/feature/music/avif/orchestra/peace_of_love.avif"}
];
export const ALL_TRACKS = [...ORC, ...TRACKS, ...EDM, ...Musician];
interface MusicListProps {
  isOpen: boolean;
  loop: boolean;
  random: boolean;
  isDarkMode: boolean;
  volumeSlide: (e:React.ChangeEvent<HTMLInputElement>) => void;
  volume: number;
  randomSwitch: () => void;
  loopMusic: ()=> void;
  isMusicStart: boolean;
  onClose: () => void;
  currentTrack: string;
  onSelect: (path: string) => void;
   audioRef: React.MutableRefObject<HTMLAudioElement | null>; 
}

const MusicList: React.FC<MusicListProps> = ({ isOpen,isDarkMode,volume,volumeSlide, audioRef,random,loop,loopMusic,randomSwitch,isMusicStart,onClose, currentTrack, onSelect }) => {
  if (!isOpen) return null;
  const handleCloseBanner = () =>{
    playButtonSound();
    onClose();
  }
  const handleSelect = (track:string) =>{
    playAnimeClick();
    onSelect(track);
  }
  const [currentTime,setCurrentTime] = useState(0)
  const [duration,setDuration] = useState(0)
  const [seeking,setSeeking] = useState(false)
  useEffect(() =>{
    if(!isOpen) return;
    const id = window.setInterval(() =>{
    const a = audioRef.current;
    if (!a || seeking) return ;
    setCurrentTime(a.currentTime);
    setDuration(Number.isFinite(a.duration) ? a.duration:0)
    },250)
    return () => window.clearInterval(id);
  },[isOpen,audioRef,seeking])
  const formatTimeMusic = (s:number)=>{
    if(!Number.isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s/60)
    const sec = Math.floor(s % 60).toString().padStart(2,"0");
    return `${m}:${sec}`
  }

  return (
    <>    
    <div 
    onClick={(e) => e.stopPropagation()}
    className={`fixed inset-0 z-200 h-full  flex items-center justify-center backdrop-blur-[2px] ${!isDarkMode ? "bg-black":"bg-white"} transition-opacity duration-300`}>
     <div className={` animate-modal-pop  w-full h-full rounded-3xl p-6  text-white  hide-scrollbar shadow-2xl`}>
      <video 
          autoPlay 
          loop 
          playsInline 
          muted 
          preload="auto" 
          className="bg-cover bg-center opacity-80 w-full h-full absolute top-0 right-0 left-0 blur-[2px] drop-shadow-lg/95 drop-shadow-blue-400 -z-1 max-[500px]:blur-[1px] max-[500px]:left-0 object-cover"
        >
          <source src="/Audio/Video/webm/amano_hina.webm" type="video/webm" />
          <source src="/Audio/Video/mp4/amano_hina.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div
          className={`absolute inset-0 -z-1 pointer-events-none rounded-2xl h-full ${
            !isDarkMode ? "bg-black/60 " : "bg-white/40"
          }`}
        />
       <button
          onClick={handleCloseBanner}
          className="flex cursor-pointer relative left-[95%] "
        >
          <img 
          src ="/Icon/weather icon/feature/red_cross.svg" 
          className = "w-8 h-8 drop-shadow-lg/90 hover:scale-90 active:scale-80  "
          alt = "exit button"/>
        </button>

        <div className = "flex mx-15 text-nowrap mb-3 relative \
        max-[700px]:mt-10 \
        max-[500px]:block">
            <h2 className={`text-2xl flex font-bold  ${isDarkMode ? "text-black":"text-white"}  text-center tracking-wider
            `}>
              Music Playlist
              <img src = {!isDarkMode ? "/Icon/weather icon/feature/darkmode/music_white.svg":"/Icon/weather icon/feature/daymode/music_black.svg"} 
              className = "w-8 h-8 ml-3 drop-shadow-lg/50"/>
              :
            </h2>
            <div className="gap-15 flex  relative 
            max-[500px]:gap-10 max-[500px]:top-8 max-[500px]:right-20
            max-[600px]:gap-5 max-[600px]:right-8">
              <button onClick = {loopMusic}
               className= {`w-20 h-10 border-b-6 rounded-xl relative bottom-0 left-20 
              transition-all duration-500 
              hover:scale-95 hover:translate-y-1 hover:border-b-4
              active:border-b-transparent active:text-blue-600 active:scale-90
                 ${loop ? "text-white bg-cyan-400 border-cyan-700":"text-black bg-white/80 hover:bg-gray-700 hover:border-gray-800 border-gray-400"}`}>Loop</button>
              <button  onClick = {randomSwitch}
               className= {`w-20 h-10 rounded-xl relative bottom-0 left-20 border-b-6
              transition-all duration-500
              hover:scale-95 hover:translate-y-1 hover:border-b-4
              active:border-b-transparent active:text-blue-600 active:scale-90
              ${random ? "text-white bg-cyan-400 border-cyan-700":"text-black bg-white/80 hover:bg-gray-700 hover:border-gray-800 border-gray-400"}`}>Random</button>
           </div>
           
      </div>
       
        
         <div className = " mb-10 w-sm  mt-10 flex relative left-15 \
         max-[500px]:left-15 max-[500px]:w-92.5 max-[500px]:mt-15 \
         max-[400px]:left-0 max-[400px]:w-85 \
         ">
          <img src = {volume !== 0  ? (!isDarkMode ? "/Icon/weather icon/feature/darkmode/muted_white.svg":"/Icon/weather icon/feature/daymode/muted_black.svg")
          :
        (isDarkMode ? "/Icon/weather icon/feature/daymode/muted_black.svg":"/Icon/weather icon/feature/darkmode/unmuted_white.svg"
      )}
          className = "w-15 h-15"/>
           <input type = "range" min="0" max="100" value={volume} onChange={volumeSlide}
            className = "flex-1 mr-2 ml-5 relative top-0.5 cursor-pointer focus:outline-none accent-blue-400 max-[400px]:left-5"/>
           <span className = "text-cyan-400 text-md relative top-1 font-welcome font-bold max-[400px]:absolute max-[450px]:right-10 max-[450px]:-top-3 max-[400px]:right-0">{volume}%</span>
        </div>  
        <div className = " mb-10 w-sm  mt-10 flex relative left-15 \
        max-[400px]:left-5 max-[400px]:w-95 ">
          {ALL_TRACKS.map((track) =>
            currentTrack === track.path ? (
              <React.Fragment key ={track.id}>
                  <img
                    key={track.id}
                    src={track.album}                                     
                    className="w-20 h-20 rounded-full object-cover opacity-90 relative right-5
                              border-4 border-sky-400/40 drop-shadow-2xl drop-shadow-blue-500
                              animate-[spin_10s_linear_infinite]"
                    style={{
                      animationPlayState: isMusicStart ? 'running' : 'paused', 
                    }}
                  />
                  <div className = "bg-transparent animate-[spin_2s_linear_infinite] border-b-4 absolute right-81.5 shadow-lg/80 backdrop-brightness-90 shadow-blue-500 border-blue-400 border-solid rounded-full w-20 h-20"/>
              </React.Fragment>
            ) : undefined
          )}
           <span className="text-cyan-400 text-md font-welcome font-bold -mr-6.5 text-right ">
              {formatTimeMusic(currentTime)}
            </span>

            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              disabled={!duration}
              onMouseDown={() => setSeeking(true)}
              onTouchStart={() => setSeeking(true)}
              onChange={(e) => {
                const t = Number(e.target.value);
                if (audioRef.current) audioRef.current.currentTime = t;
                setCurrentTime(t);
              }}
              onMouseUp={() => setSeeking(false)}
              onTouchEnd={() => setSeeking(false)}
              className="flex-1 cursor-pointer focus:outline-none accent-blue-400 disabled:opacity-50"
            />

            <span className="text-cyan-400 text-md font-welcome font-bold w-12 relative max-[450px]:right-10">
              {formatTimeMusic(duration)}
            </span>
            {ALL_TRACKS.map((track)=>
              currentTrack === track.path ? <span  
              className ="text-nowrap text-lg text-cyan-400 absolute top-15 left-22" 
              key ={track.id}>{track.name}</span>
              :
              undefined
            )}
        </div> 
     <div className = "flex gap-15 border-t-3 pt-4 mt-5  w-full overflow-y-auto no-scrollbar h-full \
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
           <ul className="flex flex-col gap-4 mb-100">
          <span className = {`text-center  ${!isDarkMode ? "text-white":"text-black   drop-shadow-white"} text-shadow-lg/20 text-2xl   
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