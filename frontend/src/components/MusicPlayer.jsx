import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

function MusicPlayer({ audioUrl, title }) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8); // 🟢 State ระดับเสียง (0.0 - 1.0) เริ่มที่ 80%

  useEffect(() => {
    if (audioUrl && waveformRef.current) {
      if (wavesurfer.current) wavesurfer.current.destroy();

      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4b5563', // เปลี่ยนสีคลื่นตอนยังไม่เล่นเป็นสีเทา (gray-600)
        progressColor: '#4ade80', // 🟢 เปลี่ยนสีคลื่นที่เล่นแล้วเป็นสีเขียว (green-400)
        cursorColor: '#ffffff',
        barWidth: 3,
        barRadius: 3,
        responsive: true,
        height: 80,
      });

      wavesurfer.current.load(audioUrl);

      wavesurfer.current.on('ready', () => {
        wavesurfer.current.setVolume(volume); // 🟢 ตั้งระดับเสียงตอนโหลดเสร็จ
        wavesurfer.current.play();
        setIsPlaying(true);
      });

      wavesurfer.current.on('finish', () => setIsPlaying(false));

      return () => wavesurfer.current.destroy();
    }
  }, [audioUrl]);

  // 🟢 คอยปรับเสียงเมื่อผู้ใช้เลื่อนหลอด Slider
  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(volume);
    }
  }, [volume]);

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  if (!audioUrl) return null;

  return (
    <div className="mt-8 p-6 border border-gray-700 rounded-2xl bg-dark-900/40 shadow-inner backdrop-blur-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-white font-extrabold truncate max-w-xs">
          {title}
        </h3>
        <a
          href={audioUrl}
          download={`${title}.wav`}
          className="group flex items-center gap-2 px-4 py-2 bg-dark-800 text-green-400 text-sm font-bold rounded-lg border border-gray-600 hover:border-green-500 hover:bg-green-600/20 transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:animate-bounce">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          ดาวน์โหลด
        </a>
      </div>

      <div className="mb-6">
        <div ref={waveformRef} className="w-full cursor-pointer"></div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
        <button
          onClick={togglePlay}
          className="w-16 h-16 flex items-center justify-center bg-green-600 hover:bg-green-500 text-white rounded-full transition-all duration-300 hover:scale-105   hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
        >
          {isPlaying ? (
            // SVG Pause (หยุดชั่วคราว)
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
            </svg>
          ) : (
            // SVG Play (เล่น)
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8 ml-1">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* 🟢 หลอดปรับระดับเสียง */}
        <div className="flex items-center gap-3 bg-dark-800/80 px-4 py-2 rounded-full border border-gray-700 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 5.367v13.266m-5.625-9.75H2.25v6h3.375l5.625 4.875V4.125l-5.625 4.875z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32 accent-green-500 cursor-pointer"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;