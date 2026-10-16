import React, { useEffect, useRef } from 'react';

const TRACKS = [
  '/Audio/Music/welcome/welcome_music.mp3',
  '/Audio/Music/welcome/welcome_falldrop.mp3'
];

interface BackgroundMusicStop {
  stop?: boolean;
}

export const BackgroundMusic: React.FC<BackgroundMusicStop> = ({ stop = false }) => {
  const audioRefs = useRef<HTMLAudioElement[]>([]);

  useEffect(() => {
    const audios = TRACKS.map((track) => {
      const audio = new Audio(track);
      audio.loop = true;
      audio.volume = 0.2;
      return audio;
    });

    audioRefs.current = audios;

    const handleFirstInteraction = () => {
      audioRefs.current.forEach((audio) => {
        audio.play().catch(() => {});
      });

      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);

      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      audioRefs.current = [];
    };
  }, []);

  // ⏹️ បញ្ឈប់/លេងតាម prop stop
  useEffect(() => {
    if (audioRefs.current.length === 0) return;
    if (stop) {
      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
  }, [stop]);

  return null;
};

export default BackgroundMusic;