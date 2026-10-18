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
    // ១. បង្កើត Audio objects សម្រាប់ TRACKS ទាំងអស់
    const audios = TRACKS.map((track) => {
      const audio = new Audio(track);
      audio.loop = true;
      audio.volume = 0.2;
      return audio;
    });

    // ២. រក្សាទុកក្នុង Ref
    audioRefs.current = audios;

    // ៣. គ្រប់គ្រងការចាក់ដំបូង (Handle browser autoplay policy via user interaction)
    const handleFirstInteraction = () => {
      audioRefs.current.forEach((audio) => {
        audio.play().catch(() => {});
      });

      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    // ៤. ភ្ជាប់ EventListeners សម្រាប់ការបញ្ជាដំបូង
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    // ៥. Cleanup function ពេល Component unmount
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