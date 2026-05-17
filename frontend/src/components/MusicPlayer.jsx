import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

function MusicPlayer({ audioUrl, title }) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioUrl && waveformRef.current) {
      if (wavesurfer.current) wavesurfer.current.destroy();

      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(100, 116, 139, 0.45)',
        progressColor: '#10b981',
        cursorColor: '#ffffff',
        cursorWidth: 2,
        barWidth: 2,
        barRadius: 4,
        barGap: 2,
        responsive: true,
        height: 72,
      });

      wavesurfer.current.load(audioUrl);

      wavesurfer.current.on('ready', () => {
        wavesurfer.current.setVolume(volume);
        setDuration(wavesurfer.current.getDuration());
        wavesurfer.current.play();
        setIsPlaying(true);
      });

      wavesurfer.current.on('audioprocess', () => {
        setCurrentTime(wavesurfer.current.getCurrentTime());
      });

      wavesurfer.current.on('seeking', () => {
        setCurrentTime(wavesurfer.current.getCurrentTime());
      });

      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));
      wavesurfer.current.on('finish', () => setIsPlaying(false));

      return () => wavesurfer.current && wavesurfer.current.destroy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  useEffect(() => {
    if (wavesurfer.current) wavesurfer.current.setVolume(volume);
  }, [volume]);

  const togglePlay = () => {
    if (wavesurfer.current) wavesurfer.current.playPause();
  };

  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  if (!audioUrl) return null;

  return (
    <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-500/[0.08] via-dark-900/60 to-cyan-500/[0.05] border border-emerald-500/20 shadow-[0_30px_60px_-25px_rgba(16,185,129,0.4)] backdrop-blur-xl animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shrink-0 shadow-glow">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-dark-900">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-emerald-300/80 font-bold font-mono">
              Now Playing
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white truncate leading-tight">
              {title}
            </h3>
          </div>
        </div>
        <a
          href={audioUrl}
          download={`${title || 'track'}.wav`}
          className="group flex items-center gap-1.5 px-3.5 py-2 bg-dark-900/60 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <span className="hidden sm:inline">ดาวน์โหลด</span>
        </a>
      </div>

      {/* Waveform */}
      <div className="mb-3 px-1">
        <div ref={waveformRef} className="w-full cursor-pointer" />
        <div className="flex justify-between text-[11px] text-gray-400 mt-2 font-mono">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={togglePlay}
          className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-dark-900 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-glow"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 ml-0.5">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2.5 bg-dark-900/60 px-3.5 py-2 rounded-full border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 5.367v13.266m-5.625-9.75H2.25v6h3.375l5.625 4.875V4.125l-5.625 4.875z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 sm:w-32 cursor-pointer"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;
