import React, { useState } from "react";
import { GENRES, getNextPrompt, getGenreById } from "../data/genrePrompts";

const DURATION_OPTIONS = [
  { label: "สั้น", sub: "~10s", tokens: 500 },
  { label: "กลาง", sub: "~20s", tokens: 1000 },
  { label: "มาตรฐาน", sub: "~30s", tokens: 1500 },
];

function PromptPage({
  prompt,
  setPrompt,
  songTitle,
  setSongTitle,
  generateRandomTitle,
  generateMusic,
  isLoading,
  progress,
  mode,
  setMode,
  selectedGenre,
  setSelectedGenre,
  durationTokens,
  setDurationTokens,
}) {
  const [lastPickAt, setLastPickAt] = useState(0);

  const handleGenreClick = (genreId) => {
    const newPrompt = getNextPrompt(genreId);
    setSelectedGenre(genreId);
    setPrompt(newPrompt);
    setLastPickAt(Date.now());
  };

  const handleSurprise = () => {
    const random = GENRES[Math.floor(Math.random() * GENRES.length)];
    handleGenreClick(random.id);
  };

  const activeGenre = selectedGenre ? getGenreById(selectedGenre) : null;

  return (
    <div className="relative">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-[10px] font-mono uppercase tracking-widest text-emerald-300 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Generative AI · MusicGen
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-400 to-cyan-300 tracking-tight leading-[1.1]">
          แต่งเพลงด้วย AI<br className="sm:hidden" />
          <span className="text-white"> ในไม่กี่คลิก</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
          เลือกแนวเพลงที่ใช่ หรือเขียน prompt ของคุณเอง — แล้วให้ AI สร้างไฟล์เสียงคุณภาพให้ทันที
        </p>
      </div>

      {/* ── Mode Toggle ─────────────────────────────────── */}
      <div className="flex justify-center mb-7">
        <div className="inline-flex p-1 rounded-2xl bg-dark-900/70 border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMode("basic")}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-300 uppercase tracking-wider ${
              mode === "basic"
                ? "bg-gradient-to-r from-emerald-500 to-green-400 text-dark-900 shadow-glow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Basic
          </button>
          <button
            type="button"
            onClick={() => setMode("advanced")}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-300 uppercase tracking-wider ${
              mode === "advanced"
                ? "bg-gradient-to-r from-cyan-500 to-blue-400 text-dark-900 shadow-[0_0_20px_rgba(34,211,238,0.45)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      {/* ── ชื่อเพลง ─────────────────────────────────────── */}
      <FieldLabel>ชื่อเพลง</FieldLabel>
      <div className="flex gap-2.5 mb-6">
        <input
          type="text"
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          placeholder="ตั้งชื่อเพลง หรือกดสุ่มชื่อให้"
          maxLength={80}
          className="flex-1 px-4 py-3 text-sm rounded-xl border border-white/10 bg-dark-900/50 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        <button
          onClick={generateRandomTitle}
          title="สุ่มชื่อเพลง"
          className="group flex items-center justify-center px-4 bg-dark-900/50 border border-white/10 hover:border-emerald-500/50 rounded-xl transition-all duration-300 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-emerald-300 transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </button>
      </div>

      {/* ── Mode content ────────────────────────────────── */}
      {mode === "basic" ? (
        <BasicMode
          genres={GENRES}
          selectedGenre={selectedGenre}
          onGenreClick={handleGenreClick}
          onSurprise={handleSurprise}
          activeGenre={activeGenre}
          prompt={prompt}
          lastPickAt={lastPickAt}
        />
      ) : (
        <AdvancedMode prompt={prompt} setPrompt={setPrompt} />
      )}

      {/* ── Duration ────────────────────────────────────── */}
      <div className="mt-6">
        <FieldLabel>ความยาวเพลง</FieldLabel>
        <div className="grid grid-cols-3 gap-2">
          {DURATION_OPTIONS.map((opt) => {
            const active = durationTokens === opt.tokens;
            return (
              <button
                key={opt.tokens}
                type="button"
                onClick={() => setDurationTokens(opt.tokens)}
                className={`relative py-3 px-3 rounded-xl border transition-all duration-300 overflow-hidden ${
                  active
                    ? "border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]"
                    : "border-white/10 bg-dark-900/40 hover:border-white/20"
                }`}
              >
                <div className={`font-bold text-sm ${active ? "text-emerald-200" : "text-gray-200"}`}>
                  {opt.label}
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">{opt.sub}</div>
                {active && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Generate Button ─────────────────────────────── */}
      <button
        onClick={generateMusic}
        disabled={isLoading || !prompt.trim()}
        className={`group relative mt-7 w-full py-4 px-6 text-base sm:text-lg font-bold rounded-2xl transition-all duration-300 overflow-hidden ${
          isLoading
            ? "bg-emerald-600/30 cursor-not-allowed text-emerald-100 border border-emerald-500/30"
            : !prompt.trim()
              ? "bg-dark-900/60 border border-white/10 text-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 text-dark-900 shadow-glow hover:shadow-glow-lg hover:scale-[1.01] active:scale-[0.99]"
        }`}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              กำลังสร้างเพลง...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              สร้างเพลง
            </>
          )}
        </span>

        {isLoading && (
          <div className="mt-4 w-full">
            <div className="flex justify-between text-[11px] font-mono text-emerald-200/80 mb-1.5 px-1">
              <span>AI กำลังประมวลผล · CPU โหมดอาจใช้เวลา 5–10 นาที</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2 border border-emerald-700/30 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-300 via-emerald-200 to-cyan-200 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(34,197,94,0.9)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </button>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="block text-gray-500 text-[10px] font-bold mb-2 uppercase tracking-[0.18em]">
      {children}
    </label>
  );
}

// ── Basic Mode ─────────────────────────────────────────────────
function BasicMode({ genres, selectedGenre, onGenreClick, onSurprise, activeGenre, prompt, lastPickAt }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <FieldLabel>เลือกแนวเพลง</FieldLabel>
        <button
          type="button"
          onClick={onSurprise}
          className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20 hover:border-fuchsia-400 transition-all active:scale-95 uppercase tracking-wider"
          title="สุ่มแนวเพลงให้เลย"
        >
          🎲 Surprise me
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {genres.map((g) => {
          const active = selectedGenre === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onGenreClick(g.id)}
              className={`group relative overflow-hidden rounded-2xl p-3 sm:p-4 border transition-all duration-300 text-left active:scale-[0.97] ${
                active
                  ? "border-emerald-400/70 shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)] scale-[1.02]"
                  : "border-white/10 hover:border-white/20 hover:-translate-y-0.5"
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${g.gradient} ${
                  active ? "opacity-30" : "opacity-10 group-hover:opacity-20"
                } transition-opacity`}
              />
              <div className="relative">
                <div className="text-2xl sm:text-3xl mb-1.5">{g.emoji}</div>
                <div className="font-bold text-white text-sm">{g.name}</div>
                <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-snug">
                  {g.description}
                </div>
                {active && (
                  <div className="mt-2 text-[9px] font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-300" />
                    กดอีกครั้งเพื่อสุ่ม
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {prompt && activeGenre && (
        <div
          key={lastPickAt}
          className="rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/5 to-transparent p-4 text-left animate-fadeIn"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 flex items-center gap-1.5">
              <span>{activeGenre.emoji}</span>
              {activeGenre.name} prompt
            </span>
            <span className="text-[10px] text-gray-500 font-mono">auto-generated</span>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed italic">"{prompt}"</p>
        </div>
      )}

      {!prompt && (
        <div className="rounded-xl border border-dashed border-white/10 bg-dark-900/30 p-6 text-center text-gray-500 text-sm">
          เลือกแนวเพลงด้านบนเพื่อเริ่มต้น
        </div>
      )}
    </div>
  );
}

// ── Advanced Mode ───────────────────────────────────────────────
function AdvancedMode({ prompt, setPrompt }) {
  return (
    <div>
      <FieldLabel>เขียน prompt ของคุณเอง</FieldLabel>
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="ตัวอย่าง: Pop dance track with catchy melodies, tropical percussion, and upbeat rhythms, perfect for the beach"
          rows={5}
          maxLength={400}
          className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-dark-900/50 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none leading-relaxed"
        />
        <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-gray-500 pointer-events-none bg-dark-900/60 px-1.5 py-0.5 rounded">
          {prompt?.length || 0} / 400
        </div>
      </div>
      <p className="mt-2 text-[11px] text-gray-500">
        💡 เขียนเป็นภาษาอังกฤษเพื่อผลลัพธ์ที่แม่นยำที่สุด — ใส่แนวเพลง, instrument, mood, tempo
      </p>
    </div>
  );
}

export default PromptPage;
