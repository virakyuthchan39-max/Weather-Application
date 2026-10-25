import React, { useState } from 'react';
import Account from '../Interface/welcome/account';
import Weather from '../Interface/Weather';

export const App: React.FC = () => {
  // ទាញយក Object ពី LocalStorage
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem("weather_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLoginSuccess = (userData: any) => {
    localStorage.setItem("weather_user", JSON.stringify(userData)); // ✅ រក្សាទុក Object
    setUser(userData);
  };
    const handleRegisterSuccess = (userData: any) => {
    localStorage.setItem("weather_user", JSON.stringify(userData)); // ✅ រក្សាទុក Object
    setUser(userData);
  };
  const handleLogout = () => {
    setIsLoggingOut(true); 
    setTimeout(() => {
      localStorage.removeItem("weather_user"); 
      setUser(null);
      setIsLoggingOut(false);
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