import React from 'react';
import Account from '../Interface/welcome/account';
import Weather from '../Interface/Weather';
type SetDashboard = "account" | "weather"

export const App: React.FC = () => (
  <main className="flex min-h-screen w-full items-center justify-cent">
    {/* <Account /> */}
   <Weather username= {"Yuth"}/>
  </main>
);

export default App;