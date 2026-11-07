import React, { useEffect, useRef, useState } from 'react';
import { playButtonSound } from '../../Effect_Service/sound_effect';

interface ProfileChangeProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  currentProfile?: string;
  onSave: (dataUrl: string) => void;
}

const FRAME_SIZE =500;
const CIRCLE_RADIUS = 185;
const OUTPUT_SIZE = 650;

const ProfileChange: React.FC<ProfileChangeProps> = ({
  isOpen, onClose, isDarkMode, currentProfile, onSave,
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [circlePos, setCirclePos] = useState({ x: FRAME_SIZE / 2, y: FRAME_SIZE / 2 });
  const [draggingCircle, setDraggingCircle] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setImageUrl('');
      setIsVideo(false);
      setErrorMsg('');
      setCirclePos({ x: FRAME_SIZE / 2, y: FRAME_SIZE / 2 });
    }
  }, [isOpen]);

  const handleFile = (file: File) => {
    setErrorMsg('');
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/avif', 'video/webm'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('Only PNG, JPEG, AVIF, WEBM allowed.');
      return;
    }

    const video = file.type.startsWith('video/');
    setIsVideo(video);

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setCirclePos({ x: FRAME_SIZE / 2, y: FRAME_SIZE / 2 });
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  useEffect(() => {
    if (!draggingCircle) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!frameRef.current) return;
      const rect = frameRef.current.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      let x = clientX - rect.left;
      let y = clientY - rect.top;
      if (x < CIRCLE_RADIUS) x = CIRCLE_RADIUS;
      if (x > rect.width - CIRCLE_RADIUS) x = rect.width - CIRCLE_RADIUS;
      if (y < CIRCLE_RADIUS) y = CIRCLE_RADIUS;
      if (y > rect.height - CIRCLE_RADIUS) y = rect.height - CIRCLE_RADIUS;
      setCirclePos({ x, y });
    };

    const handleUp = () => setDraggingCircle(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [draggingCircle]);

  const handleCircleDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDraggingCircle(true);
  };

  const handleSave = () => {
    playButtonSound();
    setErrorMsg('');

    let el = null;
    let natW = 0;
    let natH = 0;

    if (isVideo) {
      if (!videoRef.current) return;
      el = videoRef.current;
      natW = videoRef.current.videoWidth;
      natH = videoRef.current.videoHeight;
    } else {
      if (!imageRef.current) return;
      el = imageRef.current;
      natW = imageRef.current.naturalWidth;
      natH = imageRef.current.naturalHeight;
    }

    if (!el || !natW || !natH) {
      setErrorMsg('Media not ready. Please try again.');
      return;
    }

    const frameW = frameRef.current ? frameRef.current.clientWidth : FRAME_SIZE;
    const frameH = frameRef.current ? frameRef.current.clientHeight : FRAME_SIZE;

    const scale = Math.max(frameW / natW, frameH / natH);
    const scaledW = natW * scale;
    const scaledH = natH * scale;
    const offsetX = (frameW - scaledW) / 2;
    const offsetY = (frameH - scaledH) / 2;

    const srcX = (circlePos.x - offsetX - CIRCLE_RADIUS) / scale;
    const srcY = (circlePos.y - offsetY - CIRCLE_RADIUS) / scale;
    const srcSize = (CIRCLE_RADIUS * 2) / scale;

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(el, srcX, srcY, srcSize, srcSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  const handleClose = () => {
    playButtonSound();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={`animate-modal-pop relative p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-white/10
          ${isDarkMode ? "bg-white text-black" : "bg-black text-white"}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 cursor-pointer hover:scale-90 active:scale-80 transition-transform"
        >
          <img src="/Icon/weather icon/feature/red_cross.svg" className="w-8 h-8" alt="close" />
        </button>

        <h2 className="text-xl font-bold text-center mb-4 border-b-2 border-dashed pb-3">
          Change Profile Picture
        </h2>

        {/* DROP ZONE */}
        {!imageUrl && (
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center cursor-pointer rounded-xl border-4 border-dashed transition-all
              ${isDraggingFile
                ? "border-cyan-400 bg-cyan-400/10"
                : isDarkMode ? "border-gray-400 bg-gray-100" : "border-gray-600 bg-gray-900"}
              w-full h-64`}
          >
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.avif,.webm"
              onChange={handleInputChange}
              className="hidden"
            />
            <img
              src={isDarkMode
                ? "/Icon/weather icon/feature/daymode/profile_black.svg"
                : "/Icon/weather icon/feature/darkmode/profile_white.svg"}
              className="w-16 h-16 mb-3 opacity-60"
              alt="upload"
            />
            <p className="font-bold text-center px-4">
              Drag & drop image here
            </p>
            <p className="text-sm opacity-60 mt-1 text-center px-4">
              or click to choose (PNG, JPEG, AVIF, WEBM)
            </p>
          </label>
        )}

        {/* CROP PREVIEW */}
        {imageUrl && (
          <div
            ref={frameRef}
            className="relative w-full rounded-xl overflow-hidden select-none"
            style={{ height: FRAME_SIZE, width: "100%", maxWidth: FRAME_SIZE, margin: "0 auto" }}
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={imageUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <img
                ref={imageRef}
                src={imageUrl}
                alt="crop preview"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            )}

            {/* Draggable circle */}
            <div
              onMouseDown={handleCircleDown}
              onTouchStart={handleCircleDown}
              style={{
                position: "absolute",
                left: circlePos.x - CIRCLE_RADIUS,
                top: circlePos.y - CIRCLE_RADIUS,
                width: CIRCLE_RADIUS * 2,
                height: CIRCLE_RADIUS * 2,
                borderRadius: "50%",
                border: "3px dashed #22d3ee",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
                cursor: draggingCircle ? "grabbing" : "grab",
                touchAction: "none",
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <span className="text-cyan-300 text-xs font-bold opacity-70">
                  drag me
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {errorMsg && (
          <p className="text-center text-red-400 font-bold mt-3">{errorMsg}</p>
        )}

        {/* ACTIONS */}
        <div className="flex justify-center gap-4 mt-5">
          {imageUrl && (
            <button
              onClick={() => {
                playButtonSound();
                setImageUrl('');
                setIsVideo(false);
              }}
              className={`px-6 py-2 rounded-xl border-b-6 font-bold transition-all duration-300
                hover:translate-y-1 hover:border-b-4
                active:border-b-0 active:translate-y-2 active:scale-95
                ${isDarkMode ? "bg-gray-300 border-gray-500 text-black" : "bg-gray-700 border-gray-900 text-white"}`}
            >
              Replace
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={!imageUrl}
            className={`px-6 py-2 rounded-xl border-b-6 font-bold transition-all duration-300
              hover:translate-y-1 hover:border-b-4
              active:border-b-0 active:translate-y-2 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
              ${!isDarkMode ? "bg-white border-gray-400 text-black" : "bg-cyan-500 border-cyan-800 text-white"}`}
          >
            Save
          </button>
        </div>

        {currentProfile && !imageUrl && (
          <p className="text-center text-xs opacity-60 mt-3">
            Current picture will be replaced
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileChange;