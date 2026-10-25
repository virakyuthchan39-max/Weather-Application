import React, { useState, useEffect, useRef } from 'react';
import "./account.css";
import { playButtonSound } from '../../Effect_Service/sound_effect';
import LoginEmoji from "/Icon/Welcome/account_emoji.avif";
import { loginAccount, saveToken,saveUserInfo, type LoginUserRequest ,UserInfo} from '../../Effect_Service/Api/service/fetch';
import { googleLogin, requestGoogleIdToken } from '../../Effect_Service/Api/ThirdParty/google_fetch';
import { facebookLogin, requestFacebookToken } from '../../Effect_Service/Api/ThirdParty/facebook_fetch';
import {
  startGithubOAuth,
  saveGithubIntent,
  clearGithubIntent,
  githubLogin,
} from '../../Effect_Service/Api/ThirdParty/github_fetch';


interface LoginProps {
  onSwitchToSignUp: () => void;
  onSwitchToHome: () => void;
  onSuccess?: (user:UserInfo) => void;
  githubCode?: string | null;
  onSubmit?: (data: Record<string, string>) => void;
}

const Login: React.FC<LoginProps> = ({
  onSwitchToSignUp,
  onSwitchToHome,
  githubCode,
  onSuccess,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  const hasExchanged = useRef(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload: LoginUserRequest = {
        gmail: formData.email,
        password: formData.password,
      };
      const res = await loginAccount(payload);
      saveToken(res.access_token);
      saveUserInfo(res.user_info);
      setSuccessMsg("Account login success !");
      onSuccess?.(res.user_info);
      onSubmit?.(formData);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = () => {
    playButtonSound();
    onSwitchToSignUp();
  };

  const handleToHome = () => {
    playButtonSound();
    onSwitchToHome();
  };

  const handleGoogleLogin = async () => {
    playButtonSound();
    setErrorMsg('');
    setSuccessMsg('');
    setGoogleLoading(true);

    try {
      const googleToken = await requestGoogleIdToken();
      const res = await googleLogin(googleToken);
      saveToken(res.access_token);
      
      setSuccessMsg("Account login success !");
      onSuccess?.(res.user_info);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGithubLogin = () => {
    playButtonSound();
    saveGithubIntent("login");

    startGithubOAuth();
    setErrorMsg("");
    setSuccessMsg("");
  };

  useEffect(() => {
    if (!githubCode) return;
    if (hasExchanged.current) return;
    hasExchanged.current = true;

    const run = async () => {
      setGithubLoading(true);
      try {
        const res = await githubLogin(githubCode);
        saveToken(res.access_token);
        setSuccessMsg("Account login success !");
        
        clearGithubIntent();
        onSuccess?.(res.user_info);
      } catch (err) {
        hasExchanged.current = false;
        const errMsg = err instanceof Error ? err.message : "";
        if (errMsg.includes("bad_verification_code")) {
          setErrorMsg("");
        } else {
          setErrorMsg(err instanceof Error ? err.message.slice(34) : "Something went wrong");
        }
      } finally {
        setGithubLoading(false);
      }
    };
    run();
  }, [githubCode]);

  const handleFacebookLogin = async () => {
    playButtonSound();
    setErrorMsg('');
    setSuccessMsg('');
    setFacebookLoading(true);

    try {
      const fbToken = await requestFacebookToken();
      const res = await facebookLogin(fbToken);
      saveToken(res.access_token);
  
      setSuccessMsg("Account login success !");
     onSuccess?.(res.user_info);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message.slice(36) : 'Something went wrong');
    } finally {
      setFacebookLoading(false);
    }
  };

  const reuse_button_logo:string = "flex h-12 w-12 items-center drop-shadow-lg/50 drop-shadow-blue-600 justify-center border-b-4 border-gray-500 rounded-full bg-white transition-all \
                                    hover:scale-110 hover:duration-150 \
                                    active:scale-95 active:border-b-0 active:translate-y-2 hover:duration:-100"
  const reuse_form:string = "w-100 max-w-full drop-shadow-lg/60 drop-shadow-blue-600 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-gray-400 \
                            focus:border-cyan-400 focus:drop-shadow-cyan-600 focus:drop-shadow-lg/60 focus:outline-none focus:border-3 \
                            max-[500px]:w-80"
  const reuse_label:string = "mb-1 block text-md font-semibold text-gray-300"
  return (
    <div className="block font-welcome mx-auto w-full max-w-md rounded-2xl  bg-black/40 p-8 text-white shadow-2xl backdrop-blur-[-1px]

      ">
      <h2 className="flex -mb-10 text-nowrap text-center text-3xl pl-20 font-bold text-cyan-400
        max-[500px]:text-2xl  max-[500px]:pl-15 max-[500px]:justify-between
        max-[600px]:pl-20
        max-[450px]:pl-25
        max-[400px]:pl-14

      ">
        Welcome Back
        <img src ={LoginEmoji} 
        alt = "Happy girl emoji"
        className = "w-25 h-25 relative drop-shadow-lg/80 -top-8 right-4 \
        max-[500px]:w-20 max-[500px]:h-20 max-[500px]:-top-6 max-[500px]:right-2 max-[450px]:right-8 max-[400px]:right-3 "/>
        </h2>
    <h2 className="mb-6 pr-3 text-center text-3xl font-bold text-cyan-400
     max-[500px]:text-2xl
    max-[450px]:pl-10
    max-[400px]:pl-6
     ">
        Login Account</h2>

      {/* Social Login Section */}
      <div className="mb-6 flex justify-center border-b-4 pb-4 border-dashed gap-4">
       <button
          type="button"
          disabled={googleLoading}
          onClick={handleGoogleLogin}
          className={reuse_button_logo}
        >
          <img src="/Icon/Google logo.avif" alt="Google" className="h-8 w-8 object-contain" />
        </button>
       <button
          type="button"
          disabled={githubLoading}
          onClick={handleGithubLogin}
          className={reuse_button_logo}
        >
          <img src="/Icon/Github logo.avif" alt="GitHub" className="h-12 w-12 object-contain" />
        </button>
        <button
         type="button"
         disabled={facebookLoading}
         onClick={handleFacebookLogin}
         className={reuse_button_logo}
        >
          <img src="/Icon/Facebook logo.avif" alt="Facebook" className="h-8 w-8 object-contain" />
        </button>
      </div>

      <div className= "text-center font-bold text-white/70 mb-10">
        <span className="bg-black/60 px-2 text-lg">or login with email</span>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 justify-center items-center ">
        <div>
          <label className={reuse_label}>Gmail / Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your Email"
            value={formData.email}
            onChange={handleChange}
            required
            className={reuse_form}
          />
        </div>

        <div>
          <label className= {reuse_label}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
 
 
            

            required
             className={reuse_form}
          />
        </div>
        

        {successMsg ? 
              <p className='text-center text-xl italic font-bold text-green-400  drop-shadow-green-700  drop-shadow-md/90'>{successMsg}</p>
              :
               <p className="text-center text-xl italic font-bold text-red-400 drop-shadow-red-700 drop-shadow-md/90 ">{errorMsg}</p>
            }
         

         

            <button
              type="submit"
              disabled={loading}
              onClick={playButtonSound}
              className="block items-center mt-8 w-[60%] mx-auto rounded-lg bg-green-800 py-3 text-xl text-white font-bold border-b-8 border-green-900 transition-all \
              hover:bg-green-400 hover:border-b-6 hover:translate-y-2 hover:duration-300 hover:delay-150 hover:drop-shadow-green-500 hover:drop-shadow-lg/30 \
              active:scale-[0.98] active:border-b-0 active:translate-y-4 active:bg-green-400 active:text-blue-500 active:duration-100 \
              disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
       
      </form>

      {/* Toggle Link */}
      <p className="mt-6 text-center text-md text-gray-300">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={handleSwitch}
          className="font-bold  italic text-cyan-400   hover:text-blue-900 hover:underline animate-pulse transition-all duration-300"
        >
          Continue to Sign Up
        </button>
      </p>
      <span className = "block mt-4 text-xl text-center text-white italic">or</span>
      
          <button
          type="button"
          onClick={handleToHome}
           className="font-bold px-32 italic text-nowrap  hover:text-blue-900 text-cyan-400 mt-4 hover:underline animate-pulse transition-all duration-300
           max-[500px]:px-32
           max-[450px]:px-30
           max-[400px]:px-20
           "
        >
          Go to back home
        </button>
      
    </div>
  );
};

export default Login;