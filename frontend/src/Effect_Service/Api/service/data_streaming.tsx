import React, { useEffect, useState } from 'react';
import { playButtonSound,playDataStreamingEffect} from '../../sound_effect';

interface DataStreamingProps {
  username: string;
  onContinue: () => void;
}

const DataStreaming: React.FC<DataStreamingProps> = ({ username, onContinue }) => {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled =false;

    streamMessage(
      username,
      (chunk) => {
        if (cancelled) return ;
        setText((prev) => prev + chunk)
      },
      () =>{
       if (cancelled) return;
        setDone(true)
      },
      controller.signal,
    );
    return () =>{
      cancelled = true;
      controller.abort()
    };
  }, [username]);

  const handleContinue = () => {
    playButtonSound();
    onContinue();
  };

  return (
    <div className="relative mx-4 w-full max-w-xl rounded-2xl  bg-black/40 p-8 text-white shadow-2xl -backdrop-blur-[1px] md:p-10 animate-stream-pop">
      <h2 className="mb-4 text-3xl text-nowrap font-extrabold tracking-tight text-cyan-400
      max-[500px]:text-xl">
        ☀ Weather Assistant
      </h2>

      <p className="mx-4 max-[500px]:p-2 min-h-24 text-lg leading-relaxed text-cyan-400 animate-pulse transition-colors duration-400 ">
        {text}
        {!done && <span className="ml-1 inline-block">|</span>}
      </p>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!done}
          className="rounded-xl bg-green-800 px-8 py-3 text-xl font-bold text-white shadow-lg/40 transition-all duration-300 border-b-8 mt-5 border-green-900 
          hover:bg-green-400 hover:translate-y-1 hover:border-b-5
           active:text-blue-600 active:scale-[0.98] active:border-b-0 active:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default DataStreaming;


const BASE_URL = "http://127.0.0.1:8000";

export async function streamMessage(
  username: string,
  onChunk: (chunk: string) => void,
  onDone?: () => void,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/data_streaming`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    
    });

    if (!res.ok || !res.body) {
      throw new Error(`Stream failed (${res.status})`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {

      const { value, done } = await reader.read();
      playDataStreamingEffect();
      if (done) break;
      onChunk(decoder.decode(value, { stream: true }));
    }
    onDone?.();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return;
    console.error(err);
  }
}