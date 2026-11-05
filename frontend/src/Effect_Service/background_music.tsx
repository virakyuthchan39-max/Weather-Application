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
  volume: number;
  loop: boolean;
  random: boolean;
  tracks: string[];
  onNext: (path: string) => void;
  audioRef?: React.MutableRefObject<HTMLAudioElement | null>
}

export const WeatherMusicPlay: React.FC<WeatherMusic> = ({
  play, track, loop, random, tracks, onNext,volume,audioRef: sharedRef
}) => {
  
  const internalRef = useRef<HTMLAudioElement | null>(null)
  const audioRef = sharedRef ?? internalRef
  // latest config, read inside handleEnded (avoids stale closures)
  const configRef = useRef({ loop, random, tracks, onNext });
  useEffect(() => {
    configRef.current = { loop, random, tracks, onNext };
  }, [loop, random, tracks, onNext]);

  // create audio when track changes
  useEffect(() => {
    audioRef.current?.pause();
    
    const audio = new Audio(track);
   
   
   
    audio.loop = configRef.current.loop;
    audioRef.current = audio;
    const handleEnded = () => {
      const { loop, random, tracks, onNext } = configRef.current;
      if (loop) return;                
      if (random) {
        const others = tracks.filter((t) => t !== track); 
        const next = others[Math.floor(Math.random() * others.length)];
        if (next) onNext(next);
        return;
      }
      const i = tracks.indexOf(track);
      onNext(tracks[i + 1] ?? tracks[0]);
    };
    audio.addEventListener('ended', handleEnded);

    if (play) audio.play().catch(() => {});

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [track,audioRef]);

  // loop toggle — no audio recreation, just flip the flag
  useEffect(() => {
    if(audioRef.current) {audioRef.current.volume = volume/100}
    if (audioRef.current) audioRef.current.loop = loop;
  }, [loop,volume,audioRef]);

  // play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (play) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [play,audioRef]);

  return null;
};