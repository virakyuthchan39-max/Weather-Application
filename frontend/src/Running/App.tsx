import React, { Suspense, lazy } from 'react';

// Lazy load Account component for bundle optimization
const Account = lazy(() => import('../Interface/welcome/account.tsx'));

export const App: React.FC = () => {
  const handleSignUp = () => {
    // Implement Sign Up routing or modal trigger
  };

  const handleLogin = () => {
    // Implement Login routing or modal trigger
  };

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center text-3xl bg-slate-950 text-cyan-400">
          Loading...
        </div>
      }
    >
      <Account onSignUp={handleSignUp} onLogin={handleLogin} />
    </Suspense>
  );
};

export default App;