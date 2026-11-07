import React, {type ChangeEvent, useEffect, useRef,useState } from 'react';
import { playButtonSound } from '../../Effect_Service/sound_effect';
import ProfileChange from './profile_change';
import { savePersonalAccount } from '../../Effect_Service/Api/service/personal_fetch';
interface PersonalInfoProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  user: {
    id: number;
    gmail: string;
    account_type: string;
    username?: string;
    full_name?: string;
    profile: string;
    create_at:string
    bio?: string; 
    country:string
  };

  location:{
    country:string
    city: string
  }
  onEdit?: () => void;
  isDelete: boolean;
  showDelete: boolean
  onDelete:() => void;
  onDeleteShow: () => void;
  onUserUpdate?: (updated: { profile: string; bio: string }) => void;

}

const PersonalInfo: React.FC<PersonalInfoProps> = ({
  isOpen,location, onClose, isDarkMode, user, isDelete,onUserUpdate, onEdit,onDelete, showDelete,onDeleteShow
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [localProfile, setLocalProfile] = useState(user.profile || "");
  const [showProfileChange, setShowProfileChange] = useState(false);
  const [localBio, setLocalBio] = useState(""); 
  const [isBioEdite, setBioEdite] = useState(false)
  const handleSavePersonal = async () => {
  playButtonSound();
  try {
    const res = await savePersonalAccount({
      id: user.id,
      full_name: user.full_name || user.username || "",
      gmail: user.gmail,
      account_type: user.account_type,
      bio:  localBio,
      profile: localProfile || user.profile || "",
    });
    setLocalProfile(res.user_info.profile);
    setLocalBio(res.user_info.bio);
    if (onUserUpdate) {
      onUserUpdate({
        profile: res.user_info.profile,
        bio: res.user_info.bio,
      });
    }

    onClose();
  } catch (err) {
    console.error("Save personal failed:", err);
  }
};
   useEffect(() =>{
    if(isOpen) {
      setLocalBio( user.bio || "")
      setLocalProfile( user.profile || "")
    }
   }, [isOpen, user])
  
  useEffect(() => {
    if (!isOpen || showProfileChange) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose,showProfileChange]);

  

  const handleClose = () => { playButtonSound(); onClose(); };
  const handleEditBio = (e: ChangeEvent<HTMLTextAreaElement>) => {
     setLocalBio(e.target.value)
     
  }
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div
          ref={boxRef}
          className={`animate-modal-pop relative p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-white/10
            ${isDarkMode ? "bg-white/50 text-black" : "bg-black/50 text-white"}`}
        >
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 cursor-pointer hover:scale-90 active:scale-80 transition-transform"
          >
            <img src="/Icon/weather icon/feature/red_cross.svg" className="w-8 h-8" alt="close" />
          </button>

          <h2 className="text-2xl font-bold text-center mb-6 border-b-2 border-dashed pb-3">
            Personal Information
          </h2>

          <div className="flex flex-col items-center mb-6">
            <img
              src={
                localProfile ||
                user.profile ||
                (isDarkMode
                  ? "/Icon/weather icon/feature/daymode/profile_black.svg"
                  : "/Icon/weather icon/feature/darkmode/profile_white.svg")
              }
              alt="User profile"
              className="w-24 h-24 rounded-full object-contain border-4 border-cyan-400 drop shadow-cyan-500 shadow-lg/70 mb-3"
            />
              
            <h3 className="text-xl font-bold">{user.full_name || user.username || "User"}</h3>
            <p className="text-sm opacity-70">{user.gmail}</p>
          </div>
          <button
                onClick={() => { playButtonSound(); setShowProfileChange(true); }}
                className={`cursor-pointer`}>
                <img
                  src={ !isDarkMode ? "/Icon/weather icon/feature/daymode/edite_black.svg": "/Icon/weather icon/feature/darkmode/edite_white.svg"
                  }
                  className = {`w-8 h-8 p-0.5 object-contain fixed right-42.5 top-40 rounded-full
                  max-[500px]:right-42
                  max-[450px]:right-35
                  max-[400px]:right-30
                  ${!isDarkMode ? " bg-white text-black border-gray-400":"bg-black text-white border-gray-900"}
                  active:scale-95 transition-all duration-300`}
                  alt="Edite icon"/>
          </button>

          <div className={`rounded-xl p-4 mb-4 ${isDarkMode ? "bg-gray-200" : "bg-gray-800"}`}>
                  <div className="mb-3">
                      <span className="text-sm font-bold opacity-70">User ID</span>
                      <p className="text-lg">#{user.id}</p>
                  </div>
                  <div className = "mb-3 ">
                      <span className="text-sm block font-bold opacity-70">Bio</span>
                      <textarea
                          value={localBio}
                          disabled={isBioEdite}
                          onChange={handleEditBio}
                          maxLength={255}
                          placeholder="Write your bio..."
                          className={`w-full text-md italic pr-5 bg-transparent resize-none focus:outline-none
                            ${isDarkMode ? "text-black" : "text-white"}`}
                          rows={2} />
                      <img
                          onClick={()=>setBioEdite(!isBioEdite)}
                          src={ !isDarkMode ? "/Icon/weather icon/feature/daymode/edite_black.svg": "/Icon/weather icon/feature/darkmode/edite_white.svg"
                          }
                          className = {`w-6 h-6 p-0.5 object-contain absolute right-10 top-105 bottom-0 rounded-full
                      ${(!isDarkMode && isBioEdite? " bg-white text-black border-gray-400":"bg-black text-white border-gray-900")}
                      ${!isBioEdite ? "bg-emerald-400":""}
                        active:scale-95 transition-all duration-300`}
                          alt="Edite icon"/>
                      
                  </div>
                  <div className = "mb-3">
                      <span className="text-sm font-bold opacity-70">Joined at:</span>
                      <p className="text-md italic opacity-90">
                      - {user.create_at}
                      </p>
                  </div>
                  <div className = "mb-3">
                      <span className="text-sm font-bold opacity-70">Location:</span>
                      <p className="text-md italic opacity-90">
                      { (location.city !== undefined || location.country !== undefined )? `${location.city}, ${location.country}`:"Unknown"}
                      </p>
                  </div>
                  <div>
            </div>

          </div>

          <div className="flex justify-center gap-15 mt-6">
            <button
              onClick={handleSavePersonal}
              className={`px-6 py-2 rounded-xl  border-b-6 font-bold
                hover:opacity-80 hover:translate-y-1 hover:border-b-4
                ${!isDarkMode ? "bg-white text-black border-gray-400":"bg-black text-white border-gray-900"}
                active:border-b-0 active:translate-y-2 active:scale-95 transition-all duration-300`}
            >
              Save
            </button>
            <button
              onClick={() => {playButtonSound(),onDeleteShow()}}
              className="px-6 py-2 rounded-xl bg-red-700 border-b-6 border-red-900 text-white font-bold
                hover:bg-red-500 hover:translate-y-1 hover:border-b-4
                active:border-b-0 active:translate-y-2 active:scale-95 transition-all duration-300"
            >
              Delete Account
            </button>
          </div>
        </div>
      
      </div>
        <ProfileChange
              isOpen={showProfileChange}
              onClose={() => setShowProfileChange(false)}
              isDarkMode={isDarkMode}
              currentProfile={localProfile || user.profile}
              onSave={(dataUrl) => {
                  setLocalProfile(dataUrl);
                  setShowProfileChange(false);
              }}
              />
          {showDelete && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className={`p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 ${isDarkMode ? "bg-white text-black" : "bg-black text-white"} border border-white/10`}>
            <h3 className="text-xl block font-bold mb-6 text-center">
              Are you sure you want to delete your own account?
              <span className = "block text-red-500 my-2 text-sm">
              Your data might be vanishing during  account execution
              </span>
            </h3>
            
            <div className="flex justify-center cursor-pointer gap-6">
              <button 
                disabled={isDelete}
                onClick={() => {playButtonSound(),onDelete()}}
                className=" px-8 py-2 rounded-xl bg-red-600 border-b-8 border-red-900   text-white font-bold transition-all duration-300 active:scale-95
                hover:bg-red-500 hover:border-b-7 hover:translate-y-1
                active:border-b-0 active:text-blue-500 active:translate-y-2
                disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDelete ? "Working...":"Yes"}
              </button>
              <button 
                onClick={() => { playButtonSound(); onDeleteShow(); }}
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
      </>      
  );
};

export default PersonalInfo;