import React, { useState } from 'react';
import "./account.css"
import { playButtonSound } from '../../Effect_Sevice/sound_effect';
import SignupEmoji from "/public/Icon/Welcome/account_emoji2.avif"

interface SignUpProps {
  onSwitchToLogin: () => void;
  onSubmit?: (data: Record<string, string>) => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSwitchToLogin, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value, }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
  };
  const handleSwitch = ()=>{
  
      playButtonSound();
      onSwitchToLogin();
    }
   const reuse_button_logo:string = "flex h-12 w-12 items-center drop-shadow-lg/50 drop-shadow-blue-600 justify-center border-b-4 border-gray-500 rounded-full bg-white transition-all \
  hover:scale-110 hover:duration-150 \
  active:scale-95 active:border-b-0 active:translate-y-2 hover:duration:-100"
  const reuse_form:string = "w-full rounded-lg drop-shadow-lg/90 drop-shadow-blue-600  border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-gray-400 \
             focus:border-cyan-400 focus:drop-shadow-cyan-600 focus:drop-shadow-lg/60 focus:outline-none focus:border-3"
   const reuse_label:string = "mb-1 block text-md font-semibold text-gray-300"

  return (
     <div className="block font-welcome mx-auto w-full max-w-md rounded-2xl  bg-black/40 p-8 text-white shadow-2xl backdrop-blur-[-1px]
     max-[500px]:w-[80%] max-[500px]:ml-1 ">
      <h2 className="flex -mb-10 text-center text-3xl pl-20 font-bold text-cyan-400
        max-[500px]:text-2xl max-[500px]:text-nowrap max-[500px]:pl-15 max-[500px]:justify-between
        max-[600px]:pl-20
        max-[400px]:pl-10
      ">
        Welcome Back
        <img src ={SignupEmoji} className = "w-25 h-25 relative drop-shadow-lg/80 -top-8 right-4 \
        max-[500px]:w-20 max-[500px]:h-20 max-[500px]:-top-6 max-[500px]:right-3 \
        " />
        </h2>
      <h2 className="mb-6 text-center text-3xl font-bold text-cyan-400
        max-[500px]:text-2xl">
            Create Account</h2>

      {/* Social Login Section */}
       <div className="mb-6 flex justify-center border-b-4 pb-4 border-dashed gap-4">
        <button
          type="button"
          onClick={playButtonSound}
          className={reuse_button_logo}
        >
          <img src="/Icon/Google logo.avif" alt="Google" className="h-8 w-8 object-contain" />
        </button>
        <button
          onClick={playButtonSound}
          type="button"
           className={reuse_button_logo}
        >
          <img src="/Icon/Github logo.avif" alt="GitHub" className="h-12 w-12 object-contain" />
        </button>
        <button
          type="button"
          onClick={playButtonSound}
          className={reuse_button_logo}
        >
          <img src="/Icon/Facebook logo.avif" alt="Facebook" className="h-8 w-8 object-contain" />
        </button>
      </div>

      <div className="text-center font-bold text-white/70 mb-10">
        <span className="bg-black/60 text-lg px-2">or register with email</span>
      </div>

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className= {reuse_label}>First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className = {reuse_form}
            />
          </div>
          <div className="flex-1">
            <label className= {reuse_label}>Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
               className = {reuse_form}
            />
          </div>
        </div>

        <div>
          <label className = {reuse_label}>Gmail / Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
           className = {reuse_form}
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
            className = {reuse_form}
          />
        </div>

        <button
          type="submit"
          onClick = {playButtonSound}
          className=" block items-center mt-6 w-[60%] mx-auto rounded-lg bg-green-800 py-3 text-xl text-white font-bold border-b-8 border-green-900 transition-all \
          hover:bg-green-400 hover:border-b-6 hover:translate-y-2 hover:duration-300 hover:delay-150 hover:drop-shadow-green-500 hover:drop-shadow-lg/30 \
          active:scale-[0.98] active:border-b-0 active:translate-y-4 active:bg-green-400 active:text-blue-500 active:duration-100"
        >
          Sign Up
        </button>
      </form>

      {/* Toggle Link */}
      <p className="mt-6 text-center text-md text-gray-300">
        Already have an account?{' '}
        <button
          type="button"
          onClick={handleSwitch}
           className="font-bold  italic text-cyan-400 hover:underline animate-pulse transition-all duration-300"
        >
          Continue to Login
        </button>
      </p>
    </div>
  );
};

export default SignUp;