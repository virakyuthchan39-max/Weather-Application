import React from 'react';
import Account from '../Interface/welcome/account';
<<<<<<< HEAD

export const App: React.FC = () => (
  <main className="flex min-h-screen w-full items-center justify-center bg-slate-950">
    <Account />
=======
import Weather from '../Interface/Weather';
type SetDashboard = "account" | "weather"

export const App: React.FC = () => (
  <main className="flex min-h-screen w-full items-center justify-cent">
    {/* <Account /> */}
   <Weather username= {"Yuth"}/>
>>>>>>> backend
  </main>
);

export default App;