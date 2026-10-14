
import React from 'react';

const SFX_PATH = '/Audio/Effect/button/welcome_button.mp3';
const ANIME_CLICK= '/Audio/Effect/button/animeThankful.mp3'
const DATA_STREAMING= '/Audio/Effect/button/data_streaming.mp3'

export  const playDataStreamingEffect = ()=>{
  const audio = new Audio(DATA_STREAMING)
  audio.currentTime = 0
  audio.volume=0.7
  audio.play().catch(()=>{})
}


export const playAnimeClick =() =>{
        const audio = new Audio(ANIME_CLICK);
        audio.currentTime = 0;
        audio.volume = 0.5
        audio.play().catch(() => {});
}


export const playButtonSound = () => {
  const audio = new Audio(SFX_PATH);
  audio.currentTime = 0;
  audio.volume = 0.7
  audio.play().catch(() => {});
};

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}






export const SoundButton: React.FC<SoundButtonProps> = ({ onClick, children, ...props }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playButtonSound();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
};



export default {SoundButton};