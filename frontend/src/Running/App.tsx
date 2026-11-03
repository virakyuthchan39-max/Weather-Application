import React, { useState } from 'react';
import Account from '../Interface/welcome/account';
import { saveToken, saveUserInfo ,clearUserInfo,clearToken} from '../Effect_Service/Api/service/fetch';
import Weather from '../Interface/Weather';
import { fetchWelcomeSignIn,fetchWelcomeLogin,fetchNotificationUpdate } from '../Effect_Service/Api/service/notification_fetch';
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

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-black">
      <div className={`w-full h-full transition-opacity duration-1000 ease-in-out ${isLoggingOut ? "opacity-0" : "opacity-100"}`}>
        {user ? (
          <Weather user={user} onLogout={handleLogout} /> // ✅ បញ្ជូន Object ទាំងមូលទៅ Weather
        ) : (
          <Account onLoginSuccess={handleLoginSuccess} onRegisterSuccess={handleRegisterSuccess}/>
        )}
      </div>
    </main>
  );
};

export default App;