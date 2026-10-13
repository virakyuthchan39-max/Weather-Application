import React, { useEffect, useRef } from 'react';

const TRACKS = [
  '/Audio/Music/welcome/welcome_music.mp3',
  '/Audio/Music/welcome/welcome_falldrop.mp3'
];

export const BackgroundMusic: React.FC = () => {
  // ប្រើ Array សម្រាប់រក្សាទុក Audio ២
  const audioRefs = useRef<HTMLAudioElement[]>([]);

  useEffect(() => {
    // ១. បង្កើត Audio សម្រាប់ចម្រៀងនីមួយៗ
    const audios = TRACKS.map((track) => {
      const audio = new Audio(track);
      audio.loop = true;
      audio.volume = 0.2;
      return audio;
    });

    // ២. រក្សាទុកក្នុង Ref
    audioRefs.current = audios;

    // ៣. គ្រប់គ្រងការចាក់ដំបូង
    const handleFirstInteraction = () => {
      // ចាក់ទាំង ២ ក្នុងពេលតែមួយ
      audioRefs.current.forEach((audio) => {
        audio.play().catch(() => {});
      });
      
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    // ៤. ស្តាប់ Event
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    // ៥. Cleanup
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      
      // បញ្ចប់ទាំងអស់
      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      audioRefs.current = [];
    };
  }, []);

  return null;
};

export default BackgroundMusic;