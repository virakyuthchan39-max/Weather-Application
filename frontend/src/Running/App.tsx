import React, { useState } from 'react';
import Account from '../Interface/welcome/account';
import SignUp from '../Interface/welcome/signup';
import Login from '../Interface/welcome/login';

type AuthView = 'welcome' | 'signup' | 'login';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('welcome');

  const handleSignUp = () => setCurrentView('signup');
  const handleLogin = () => setCurrentView('login');
  const handleWelcome = () => setCurrentView("welcome")

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-950">
      {currentView === 'welcome' && (
        <Account onSignUp={handleSignUp} onLogin={handleLogin} />
      )}

      {currentView === 'signup' && (
        <SignUp onSwitchToLogin={handleLogin} onSwitchToHome={handleWelcome} />
      )}

      {currentView === 'login' && (
        <Login onSwitchToSignUp={handleSignUp} />
      )}
    </main>
  );
};

export default App;