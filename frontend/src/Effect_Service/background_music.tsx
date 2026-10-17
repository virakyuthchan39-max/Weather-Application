import React, { useEffect, useRef } from 'react';

const TRACKS = [
  '/Audio/Music/welcome/welcome_music.mp3',
  '/Audio/Music/welcome/welcome_falldrop.mp3'
];

<<<<<<< HEAD
export const BackgroundMusic: React.FC = () => {
  // ប្រើ Array សម្រាប់រក្សាទុក Audio ២
  const audioRefs = useRef<HTMLAudioElement[]>([]);

  useEffect(() => {
    // ១. បង្កើត Audio សម្រាប់ចម្រៀងនីមួយៗ
=======
interface BackgroundMusicStop {
  stop?: boolean;
}

export const BackgroundMusic: React.FC<BackgroundMusicStop> = ({ stop = false }) => {
  const audioRefs = useRef<HTMLAudioElement[]>([]);

  useEffect(() => {
>>>>>>> backend
    const audios = TRACKS.map((track) => {
      const audio = new Audio(track);
      audio.loop = true;
      audio.volume = 0.2;
      return audio;
    });

<<<<<<< HEAD
    // ២. រក្សាទុកក្នុង Ref
    audioRefs.current = audios;

    // ៣. គ្រប់គ្រងការចាក់ដំបូង
    const handleFirstInteraction = () => {
      // ចាក់ទាំង ២ ក្នុងពេលតែមួយ
      audioRefs.current.forEach((audio) => {
        audio.play().catch(() => {});
      });
      
=======
    audioRefs.current = audios;

    const handleFirstInteraction = () => {
      audioRefs.current.forEach((audio) => {
        audio.play().catch(() => {});
      });

>>>>>>> backend
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

<<<<<<< HEAD
    // ៤. ស្តាប់ Event
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    // ៥. Cleanup
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      
      // បញ្ចប់ទាំងអស់
=======
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);

>>>>>>> backend
      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      audioRefs.current = [];
    };
  }, []);

<<<<<<< HEAD
=======
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

>>>>>>> backend
  return null;
};

export default BackgroundMusic;