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


interface WeatherMusic {
  play: boolean;
  track: string;
}

export const WeatherMusicPlay: React.FC<WeatherMusic> = ({ play, track }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(track);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;

    if (play) {
      audioRef.current.play().catch(() => {});
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      if (play) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [play]);

  return null;
};