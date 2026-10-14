import React, { memo, useState, useEffect, useCallback, useRef} from 'react';
import BackgroundMusic from '../../Effect_Service/background_music.tsx';
import { playButtonSound, playAnimeClick } from '../../Effect_Service/sound_effect';
import AnimeThankful from "/Icon/Welcome/Kita.avif";
import AnimeShock from "/Icon/Welcome/kita_shock.avif"
import AnimeMad from "/Icon/Welcome/Kita_mad.avif"
import AnimeSign from "/Icon/Welcome/Kita_sign.avif"
import SignUp from './signup';
import Login from './login';
import "./account.css";

// import the data streaming
import DataStreaming from '../../Effect_Service/Api/service/data_streaming';


type AuthView = 'welcome' | 'signup' | 'login' | 'streaming';

const Account: React.FC = memo(() => {
  const [view, setView] = useState<AuthView>('welcome');
  const [showContent, setShowContent] = useState(false);
  const [animClass, setAnimClass] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [animeCount, setAnimeCount] = useState(0);
  const [animeImg, setAnimeImg] = useState(AnimeThankful);
  const signTimerRef = useRef<number | null>(null);
  
  const [username, setUsername] = useState(''); //add the username in data_streaming

  const handleAnimeClick = () => {
  playAnimeClick();
  setAnimeCount((prev) => {
    const next = prev + 1;
    if (next >= 5)      setAnimeImg(AnimeMad);
    else if (next >= 1) setAnimeImg(AnimeShock);
    return next;
  });
  };

  // idle 1s → (mad path: sign → 1s → thankful) | (shock path: thankful)
  useEffect(() => {
  if (animeCount === 0) return;

  const t = setTimeout(() => {
    if (animeCount >= 5) {
      // was mad → show sign for 1s, then reset
      setAnimeImg(AnimeSign);
      signTimerRef.current = window.setTimeout(() => {
        setAnimeCount(0);
        setAnimeImg(AnimeThankful);
        signTimerRef.current = null;
      }, 1000);
    } else {
      // was shock (or less) → reset immediately
      setAnimeCount(0);
      setAnimeImg(AnimeThankful);
    }
  }, 1000);

  return () => {
    clearTimeout(t);
    if (signTimerRef.current !== null) {
      clearTimeout(signTimerRef.current);
      signTimerRef.current = null;
    }
  };
  }, [animeCount]);

  // initial 1s delay before welcome card appears
  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 1000);
    return () => clearTimeout(t);
  }, []);

  // central fade-out → swap → fade-in driver
  const transitionTo = useCallback(
    (next: AuthView) => {
      if (isTransitioning || next === view) return;
      setIsTransitioning(true);

      const leavingWelcome = view === 'welcome';
      const outDuration = leavingWelcome ? 1000 : 700; // must match CSS

      setAnimClass(leavingWelcome ? 'anim-out-welcome' : 'anim-out-form');

      window.setTimeout(() => {
        setView(next);
        setAnimClass('anim-in-view');
        window.setTimeout(() => {
          setAnimClass('');
          setIsTransitioning(false);
        }, 1000);
      }, outDuration);
    },
    [view, isTransitioning]
  );

  const reuse_color_hover = "hover:text-purple-500 text-cyan-200";

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black font-welcome">
      {/* Background Music */}
      <BackgroundMusic />

      {/* Background Video — STAYS MOUNTED across all views */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/Audio/Video/welcome.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay Filter — also stays mounted */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Inner card container: only this swaps + animates */}
      {showContent && (
        <div
          className={`relative z-10 flex w-full items-center justify-center ${animClass}`}
          style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }}
        >
          {/* ---------- WELCOME VIEW ---------- */}
          {view === 'welcome' && (
            <div className="relative mx-4 w-full max-w-xl rounded-2xl border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-[-1px] md:p-10 animate-account">
              <h1 className="mb-2 text-nowrap text-2xl font-extrabold tracking-tight animate-pulse transition-all duration-2500 text-cyan-400
              max-[500px]:text-xl">
                ☀ Welcome to Weather Application
              </h1>

              <div className="mb-4 block items-center  space-x-2 text-sm font-semibold tracking-wide text-sky-300">
             
                <p className="mt-3 mb-1 max-[400px]:text-nowrap flex">
                  <span className= "animate-spin transition-all duration-2000 mr-2 hover:text-3xl hover:relative hover:-top-2 hover:-py-4 hover:border-0  hover:outline-none cursor-pointer">★</span>
                  Introduction about Web Application</p>
                <ul className="pl-5 space-y-1">
                  <li>Publish: <strong><time dateTime="2026-10-15">15 October 2026</time></strong></li>
                  <li>Created by: <strong>Chan Virakyuth</strong></li>
                  <li>Assistant: <strong>AI (Gemini, DeepSeek)</strong></li>
                  <li>Hosted by: <strong>Chan Virakyuth</strong></li>
                </ul>

                <img
                      src={animeImg}
                      onClick={handleAnimeClick}
                      className={`absolute top-20 left-70 h-auto opacity-90 drop-shadow-red-900/90 drop-shadow-lg/100  cursor-pointer active:scale-99
                        max-[800px]:top-20 m-2
                        max-[500px]:relative max-[500px]:top-0 max-[500px]:left-10

                        ${
                          animeImg === AnimeShock
                            ? "w-30 max-[1200px]:w-45 max-[1200px]:left-80 max-[1200px]:top-23 max-[1200px]:scale-90 \
                            max-[800px]:active:scale-89 max-[800px]:top-20.5 max-[800px]:w-45 max-[800px]:left-77.5 \
                            max-[600px]:w-37 max-[600px]:top-22 max-[600px]:left-76.5 \
                            max-[500px]:w-37 max-[500px]:left-13 max-[500px]:m-5 "
                            : animeImg === AnimeMad
                            ? "w-30 max-[1200px]:w-46 max-[1200px]:left-79 max-[1200px]:top-18 \
                            max-[800px]:w-40 max-[800px]:left-79 \
                            max-[600px]:w-33 max-[600px]:top-22.5 max-[600px]:left-77.5 \
                            max-[500px]:w-33 max-[500px]:-top-2 max-[500px]:left-12 max-[500px]:m-6 "
                            : animeImg === AnimeSign
                            ? "w-30 max-[1200px]:w-46 max[1200px]:h-auto max-[1200px]:scale-110 max-[1200px]:left-80 max-[1200px]:top-36 \
                            max-[800px]:scale-90 max-[800px]:w-50 max-[800px]:top-33 max-[800px]:left-75 \
                            max-[600px]:w-42 max-[600px]:left-75 max-[600px]:top-31 \
                            max-[500px]:w-40 max-[500px]:my-10.5 max-[500px]:mx-5 max-[500px]:top-3 max-[500px]:right-30 "
                            : "w-65 max-[800px]:w-60 max-[600px]:w-50 max-[500px]:w-50 "
                        }
                      `}
                      alt="Anime"
                    />
                <p className="mt-3 mb-1 flex">
                    <span className= "animate-spin transition-all duration-2000 hover:text-3xl hover:relative hover:-top-2 hover:-py-4 hover:border-0  hover:outline-none cursor-pointer mr-2">★</span>
                    Click the links to learn more</p>

                <nav className="border-b-2 pb-5 pl-5">
                  <div className="mb-2"><span className="border-b-2">Contact:</span></div>
                  <ul className="pl-5 space-y-1">
                    <li><strong><a className={reuse_color_hover} href="https://t.me/virakyuthchan" target="_blank" rel="noreferrer" onClick={playButtonSound}>✫ Telegram</a></strong></li>
                    <li><strong><a className={reuse_color_hover} href="https://github.com/virakyuthchan39-max" target="_blank" rel="noreferrer" onClick={playButtonSound}>✫ Github</a></strong></li>
                    <li><strong><a className={reuse_color_hover} href="mailto:virakyutchan39@gmail.com" onClick={playButtonSound}>✫ Google (Gmail)</a></strong></li>
                  </ul>

                  <ul className="mt-3 space-y-1">
                    <li>
                      <span className="border-b-2">Development tools:</span>{" "}
                      <strong>
                        <a className={reuse_color_hover} href="https://www.docker.com" target="_blank" rel="noreferrer" onClick={playButtonSound}>Docker</a>,{" "}
                        <a className={reuse_color_hover} href="https://git-scm.com" target="_blank" rel="noreferrer" onClick={playButtonSound}>Git</a>,{" "}
                        <a className={reuse_color_hover} href="https://github.com" target="_blank" rel="noreferrer" onClick={playButtonSound}>GitHub</a>,{" "}
                        <a className={reuse_color_hover} href="https://squoosh.app" target="_blank" rel="noreferrer" onClick={playButtonSound}>Squoosh (Google)</a>
                      </strong>
                    </li>
                    <li>
                      <span className="border-b-2">AI:</span>{" "}
                      <strong>
                        <a className={reuse_color_hover} href="https://gemini.google.com" target="_blank" rel="noreferrer" onClick={playButtonSound}>Gemini</a>,{" "}
                        <a className={reuse_color_hover} href="https://chatgpt.com" target="_blank" rel="noreferrer" onClick={playButtonSound}>ChatGPT</a>,{" "}
                        <a className={reuse_color_hover} href="https://www.deepseek.com" target="_blank" rel="noreferrer" onClick={playButtonSound}>DeepSeek</a>,{" "}
                        <a className={reuse_color_hover} href="https://manus.im" target="_blank" rel="noreferrer" onClick={playButtonSound}>Manus AI</a>
                      </strong>
                    </li>
                    <li>
                      <span className="border-b-2">Platforms/Servers:</span>{" "}
                      <strong><a className={reuse_color_hover} href="https://render.com" target="_blank" rel="noreferrer" onClick={playButtonSound}>Render.com</a></strong>
                    </li>
                  </ul>
                </nav>
              </div>

              <p className="mb-8 text-lg px-2 leading-relaxed text-white/90">
                Here, this is a self-project to practice real-world development (Frontend + Backend).
                Create your account, or if you already have a Google account or email, click
                <span className="font-semibold text-green-400 animate-pulse transition-all duration-200 italic"> "Continue to Sign Up"</span>.
                Otherwise, click
                <span className="font-semibold text-red-400 animate-pulse transition-all duration-200 italic"> "Continue to Login"</span>.
              </p>

              <div className="flex text-nowrap flex-col gap-8 sm:flex-row items-center">
                <button
                  type="button"
                  onClick={() => { playButtonSound(); transitionTo('signup'); }}
                  className="w-[50%] rounded-xl bg-green-800 px-6 py-3 font-semibold text-white shadow-lg/40 transition-all duration-300 border-b-6 border-green-900 
                  hover:bg-green-400 hover:shadow-green-400 hover:translate-y-2 hover:border-b-5
                   active:scale-[0.98] active:border-b-0 active:duration-150 active:-delay-100 active:text-blue-300 max-[500px]:w-[70%]"
                >
                  Continue to Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => { playButtonSound(); transitionTo('login'); }}
                  className="w-[50%] rounded-xl bg-red-800 px-6 py-3 font-semibold text-white shadow-lg/40 transition-all duration-300 border-b-6 border-red-900
                   hover:bg-red-400 hover:shadow-red-400 hover:translate-y-2 hover:border-b-5 
                   active:scale-[0.98] active:border-b-0 active:duration-150 active:-delay-100 max-[500px]:w-[70%]"
                >
                  Continue to Login
                </button>
              </div>
            </div>
          )}
           {view === 'streaming' && (
                  <DataStreaming
                    username={username}
                    onContinue={() => transitionTo('welcome')}
                  />
                )}

          {/* ---------- SIGNUP VIEW ---------- */}
          {view === 'signup' && (
            <SignUp
              onSwitchToLogin={() => transitionTo('login')}
              onSwitchToHome={() => transitionTo('welcome')}
              onSuccess={(name) => {
                                  setUsername(name);
                                   transitionTo("streaming");
                                  }}
            />
          )}

          {/* ---------- LOGIN VIEW ---------- */}
         {view === 'login' && (
            <Login
              onSwitchToSignUp={() => transitionTo('signup')}
              onSwitchToHome={() => transitionTo('welcome')}
              onSuccess={(name) => {              // ← បន្ថែម
                setUsername(name);
                transitionTo('streaming');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
});

Account.displayName = 'Account';
export default Account;