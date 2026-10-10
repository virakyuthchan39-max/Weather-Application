import React, { memo, useState, useEffect, useCallback } from 'react';
import BackgroundMusic from '../../Effect_Sevice/background_music.tsx';
import { playButtonSound, playAnimeClick } from '../../Effect_Sevice/sound_effect';
import AnimeThankful from "/public/Icon/Welcome/Kita.avif";
import SignUp from './signup';
import Login from './login';
import "./account.css";

type AuthView = 'welcome' | 'signup' | 'login';

const Account: React.FC = memo(() => {
  const [view, setView] = useState<AuthView>('welcome');
  const [showContent, setShowContent] = useState(false);
  const [animClass, setAnimClass] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

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
              <h1 className="mb-2 text-2xl font-extrabold tracking-tight animate-pulse transition-all duration-2500 text-cyan-400">
                ☀ Welcome to Weather Application
              </h1>

              <div className="mb-4 block items-center space-x-2 text-sm font-semibold tracking-wide text-sky-300">
             
                <p className="mb-1 flex ">
                  <p className= "animate-spin transition-all duration-2000 mr-2">★</p>
                  Introduction about Web Application</p>
                <ul className="pl-5 space-y-1">
                  <li>Publish: <strong><time dateTime="2026-10-15">15 October 2026</time></strong></li>
                  <li>Created by: <strong>Chan Virakyuth</strong></li>
                  <li>Assistant: <strong>AI (Gemini, DeepSeek)</strong></li>
                  <li>Hosted by: <strong>Chan Virakyuth</strong></li>
                </ul>

                <img
                  src={AnimeThankful}
                  onClick={playAnimeClick}
                  className="absolute top-20 left-70 animate-pulse transition-all duration-300 w-65 h-auto opacity-90 drop-shadow-red-900/90 drop-shadow-lg/100 hover:scale-95 cursor-pointer active:scale-90 max-[800px]:w-60 max-[800px]:left-80 max-[800px]:top-20 m-2 max-[600px]:w-50 max-[600px]:left-70 max-[500px]:relative max-[500px]:left-10 max-[500px]:top-0"
                  alt="Anime Thankful"
                />

                <p className="mt-3 mb-1 flex">
                    <p className= "animate-spin transition-all duration-2000 mr-2">★</p>
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

          {/* ---------- SIGNUP VIEW ---------- */}
          {view === 'signup' && (
            <SignUp
              onSwitchToLogin={() => transitionTo('login')}
              onSwitchToHome={() => transitionTo('welcome')}
            />
          )}

          {/* ---------- LOGIN VIEW ---------- */}
          {view === 'login' && (
            <Login
              onSwitchToSignUp={() => transitionTo('signup')}
              onSwitchToHome={() => transitionTo('welcome')}
            />
          )}
        </div>
      )}
    </div>
  );
});

Account.displayName = 'Account';
export default Account;