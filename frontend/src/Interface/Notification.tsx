import React, { useEffect, useState } from 'react';
import { fetchWelcomeLogin, deleteNotificationById, deleteAllNotifications, NotificationData } from '../Effect_Service/Api/service/notification_fetch';
import { playAnimeClick } from '../Effect_Service/sound_effect';

interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  user: any;
  onUpdateStatus?: (hasUnread: boolean, color: string) => void; // ✅ បន្ថែម
}

export const Notification: React.FC<NotificationProps> = ({ isOpen, onClose, isDarkMode, user, onUpdateStatus }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  
  const token = localStorage.getItem("access_token") || "";

  // ✅ ទាញយកទិន្នន័យភ្លាមៗពេលមាន User (មិនរង់ចាំ isOpen ទេ)
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  // ✅ គណនា និងផ្ញើ Status ទៅ Weather.tsx រាល់ពេលមានការផ្លាស់ប្តូរ
  useEffect(() => {
    if (!onUpdateStatus) return;
    
    const unreadNotifs = notifications.filter(n => !readIds.has(n.notification_id));
    
    if (unreadNotifs.length === 0) {
      onUpdateStatus(false, "green"); // គ្មានអាន = បិទ Ping
      return;
    }
    
    // កំណត់អាទិភាពពណ៌៖ ក្រហម -> លឿង -> បៃតង
    let topColor = "green";
    if (unreadNotifs.some(n => n.color.toLowerCase() === 'red')) {
      topColor = "red";
    } else if (unreadNotifs.some(n => n.color.toLowerCase() === 'yellow')) {
      topColor = "yellow";
    }
    
    onUpdateStatus(true, topColor);
  }, [notifications, readIds, onUpdateStatus]);

  const getColorClasses = (color: string) => {
    const c = color.toLowerCase();
    if (c === "green") return { ping: "bg-emerald-500", outline: "bg-emerald-400" };
    if (c === "yellow") return { ping: "bg-yellow-500", outline: "bg-yellow-400" };
    return { ping: "bg-red-500", outline: "bg-red-400" };
  };

  const handleReadClick = (id: string) => {
    playAnimeClick();
    const newReadIds = new Set(readIds);
    newReadIds.add(id); 
    setReadIds(newReadIds);
  };

  const handleReadAll = () => {
    playAnimeClick();
    const allIds = notifications.map(n => n.notification_id);
    setReadIds(new Set(allIds));
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchWelcomeLogin(user.id, user.gmail, user.account_type);
      if (res && res.notifcation_info) {
        setNotifications([res.notifcation_info]);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    playAnimeClick();
    try {
      await deleteNotificationById(id, user.id, user.gmail, user.account_type,token);
      setNotifications((prev) => prev.filter(n => n.notification_id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAll = async () => {
    playAnimeClick();
    try {
      await deleteAllNotifications(user.id, user.gmail, user.account_type, token);
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 transition-opacity duration-300">
      <div className={`animate-modal-pop w-[90vw] max-w-2xl h-400  p-6 rounded-3xl shadow-2xl flex flex-col max-h-[80vh] backdrop-blur-md ${!isDarkMode ? "bg-black/20 text-white" : "bg-white/20 text-black"}`}>
        
        <div className="flex justify-between items-center border-b-2 pb-4 mb-4">
          <h2 className="text-2xl flex font-bold">
            Notifications
            <img 
            src ={!isDarkMode ? "/Icon/weather icon/feature/darkmode/notification_white.svg":"/Icon/weather icon/feature/daymode/notification_black.svg"} 
            className="w-8 h-8 ml-2"
            alt="Notification icon"
            />
          </h2>
          <button onClick={() => { playAnimeClick(); onClose(); }} className="text-2xl font-bold hover:text-red-500 active:scale-90 transition-transform">
              <img src="/Icon/weather icon/feature/red_cross.svg" className="w-8 h-8 ml-2" alt="Close icon" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4">
          {loading ? (
            <p className="text-center animate-pulse">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center italic opacity-70">No notifications yet.</p>
          ) : (
            notifications.map((notif) => {
              const colors = getColorClasses(notif.color);
              const isRead = readIds.has(notif.notification_id);
              
              return (
                <React.Fragment key={notif.notification_id}>
                  <div className={`absolute top-18 ${isRead ?"showForecast":"hideForecast"} `}>
                    <div className={`w-7 h-7 ${colors.outline} rounded-full absolute top-2.5 -left-1 animate-ping duration-400 transition-all`}/>
                    <div className={`w-5 h-5 ${colors.ping} absolute top-3 rounded-full`}/>
                  </div>
                
                  <div className={`relative p-4 rounded-xl shadow-lg/40 transition-opacity duration-300
                  ${isRead ? "opacity-50":"opacity-100"}
                    ${notif.color.toLowerCase() === "green" ? "bg-emerald-500/80" :
                      notif.color.toLowerCase() === "yellow" ? "bg-yellow-400/80" : "bg-red-500/80"
                    }`}>
                    
                    <button onClick={() => handleDelete(notif.notification_id)} className="absolute top-2 right-2 text-red-600 font-bold hover:scale-110 active:scale-90 transition-transform">
                      <img src="/Icon/weather icon/feature/trash.svg" className="w-8 h-8 ml-2" alt="Trash icon" />
                    </button>
                    
                    <button onClick={() => handleReadClick(notif.notification_id)} className="absolute top-2 right-20 text-red-600 font-bold hover:scale-110 active:scale-90 transition-transform">
                      <img 
                        src={
                          isRead 
                            ? "/Icon/weather icon/feature/read_green.svg" 
                            : (isDarkMode ? "/Icon/weather icon/feature/daymode/read_black.svg" : "/Icon/weather icon/feature/darkmode/read_white.svg")
                        }
                        className="w-8 h-8 ml-2"
                        alt="Read icon"
                      />
                    </button>
                  
                    <h3 className={`font-bold text-2xl mb-2 pr-6`}>{notif.title}</h3>
                    <p className="text-lg opacity-60 mb-3 absolute bottom-1.5 whitespace-pre-wrap">
                      ({notif.time_live <= 1 ? `${notif.time_live} day before delete` : `${notif.time_live} days before delete`})
                    </p>
                    <p className="text-lg opacity-90 mb-3 whitespace-pre-wrap pr-12">{notif.message}</p>
                    <p className="text-md text-right opacity-60 font-semibold">{notif.sended_at}</p>
                  </div>
                </React.Fragment>
              )
            })
          )}
        </div>

        <div className="mt-4 flex gap-4 pt-2">
          <button onClick={handleDeleteAll} disabled={notifications.length === 0} className="flex-1 py-2 bg-red-800 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all active:scale-95">
            Clear All
          </button>
          <button onClick={handleReadAll} disabled={notifications.length === 0} className={`flex-1 py-2 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 ${!isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"}`}>
            Read All
          </button>
        </div>

      </div>
    </div>
  );
};

export default Notification;