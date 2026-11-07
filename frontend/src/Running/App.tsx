import React, { useState ,useEffect} from 'react';
import Account from '../Interface/welcome/account';
import { saveToken, saveUserInfo ,clearUserInfo,clearToken} from '../Effect_Service/Api/service/fetch';
import Weather from '../Interface/Weather';
import { fetchWelcomeSignIn,fetchWelcomeLogin,fetchNotificationUpdate } from '../Effect_Service/Api/service/notification_fetch';
import { getPersonalAccount } from '../Effect_Service/Api/service/personal_fetch';

export const App: React.FC = () => {
  // ទាញយក Object ពី LocalStorage
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem("weather_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLoginSuccess = async (userData: any,token:string) => {
    localStorage.setItem("weather_user", JSON.stringify(userData)); // ✅ រក្សាទុក Object
    setUser(userData);
     saveToken(token);
    saveUserInfo(userData);
    await mergePersonalInfo(userData);

    // ✅ ហៅ API ទាញយក Notification តែម្តងគត់នៅទីនេះ
    try {
       const test = await fetchNotificationUpdate(userData.id,userData.gmail,userData.account_type)
        const notifRes = await fetchWelcomeLogin(userData.id, userData.gmail, userData.account_type);
        if (notifRes && notifRes.notifcation_info) {
            localStorage.setItem("user_notification", JSON.stringify(notifRes.notifcation_info));
        
        }
        localStorage.setItem("user_notification",JSON.stringify(test.notifcation_info))
    } catch (err) {
        console.error("No welcome notification", err);
    }

  };
    const handleRegisterSuccess = async (userData: any,token:string) => {
    localStorage.setItem("weather_user", JSON.stringify(userData));
    setUser(userData);
    saveToken(token);
    saveUserInfo(userData);
    await mergePersonalInfo(userData);

    try {
        await fetchNotificationUpdate(userData.id,userData.gmail,userData.account_type)
        const notifRes = await fetchWelcomeSignIn(userData.id, userData.gmail, userData.account_type);
        if (notifRes && notifRes.notifcation_info) {
            localStorage.setItem("user_notification", JSON.stringify(notifRes.notifcation_info));
        }
    } catch (err) {
        console.error("No welcome notification", err);
    }
  };
  
    const handleLogout = () => {
      setIsLoggingOut(true); 
      setTimeout(() => {
        localStorage.removeItem("weather_user"); 
        localStorage.removeItem("user_notification")
        setUser(null);
        setIsLoggingOut(false);
        clearToken();
        clearUserInfo();
      }, 1000); 
    };
    
  const handleUserUpdate = (updated: Partial<typeof user>) => {
    setUser((prev: any) => {
      const next = { ...prev, ...updated };
      localStorage.setItem("weather_user", JSON.stringify(next));
      return next;
    });
  };

  const mergePersonalInfo = async (userData: any) => {
    try {
      const personal = await getPersonalAccount(
        userData.gmail,
        userData.account_type,
        userData.id
      );
      if (personal && personal.user_info) {
        const merged = {
          ...userData,
          profile:   personal.user_info.profile   || userData.profile   || "",
          bio:       personal.user_info.bio       || "",
          full_name: personal.user_info.full_name || userData.full_name || userData.username || "",
        };
        localStorage.setItem("weather_user", JSON.stringify(merged));
        setUser(merged);
        return merged;
      }
    } catch (err) {
      // មិនទាន់មាន PersonalInfo row → ប្រើ userData ដើម
    }
    return userData;
  };


  useEffect(() => {
  if (!user) return;
  (async () => {
    try {
      const personal = await getPersonalAccount(user.gmail, user.account_type, user.id);
      if (personal && personal.user_info) {
        const merged = {
          ...user,
          profile:   personal.user_info.profile   || user.profile   || "",
          bio:       personal.user_info.bio       || "",
          full_name: personal.user_info.full_name || user.full_name || user.username || "",
        };
        localStorage.setItem("weather_user", JSON.stringify(merged));
        setUser(merged);
      }
    } catch (err) {
      // មិនទាន់មាន PersonalInfo → ទុកដើម
    }
  })();
}, []); // រត់តែម្ដងពេល App mount

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-black">
      <div className={`w-full h-full transition-opacity duration-1000 ease-in-out ${isLoggingOut ? "opacity-0" : "opacity-100"}`}>
        {user ? (
          <Weather user={user} onLogout={handleLogout}  onUserUpdate={handleUserUpdate}  /> 
        ) : (
          <Account onLoginSuccess={handleLoginSuccess} onRegisterSuccess={handleRegisterSuccess}/>
        )}
      </div>
    </main>
  );
};

export default App;