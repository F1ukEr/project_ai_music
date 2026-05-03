import React, { Fragment, useState } from "react";

const genres = [
  { id: 'edm',       name: 'EDM / House',       category: 'electronic', icon: '⚡', color: 'from-cyan-500 to-blue-600',     prompt: 'Euphoric EDM house track with uplifting synth arpeggios, four-on-the-floor kick, festival drop energy, and massive euphoric buildup' },
  { id: 'synthwave', name: 'Synthwave',          category: 'electronic', icon: '🌆', color: 'from-purple-500 to-pink-600',   prompt: 'Retro 80s synthwave with pulsing analog synths, neon-soaked atmosphere, driving drum machine, and nostalgic melodic leads' },
  { id: 'dubstep',   name: 'Dubstep / Bass',     category: 'electronic', icon: '🔊', color: 'from-blue-500 to-indigo-700',  prompt: 'Heavy dubstep track with aggressive wobble bass, high-energy drops, distorted synths, and intense rhythmic builds' },
  { id: 'trap_dark', name: 'Dark Trap',          category: 'electronic', icon: '🔮', color: 'from-violet-700 to-gray-900',  prompt: 'Dark atmospheric trap beat with heavy 808 bass, snappy hi-hats, eerie melodic samples, and cinematic dark tension' },
  { id: 'rock',      name: 'Rock',               category: 'rock',       icon: '🎸', color: 'from-red-500 to-orange-600',   prompt: 'High energy rock track with heavy electric guitars, powerful driving drum beats, aggressive bass lines, and anthemic chorus' },
  { id: 'metal',     name: 'Metal',              category: 'rock',       icon: '🤘', color: 'from-gray-600 to-red-900',     prompt: 'Heavy metal track with fast distorted guitar riffs, double kick drum, shredding guitar solos, and thunderous powerful low-end' },
  { id: 'indie',     name: 'Indie / Alt',        category: 'rock',       icon: '🌿', color: 'from-green-600 to-teal-700',   prompt: 'Indie alternative rock with jangly guitar melodies, warm reverb-soaked production, introspective atmosphere, and dreamy feel' },
  { id: 'punk',      name: 'Punk',               category: 'rock',       icon: '💀', color: 'from-yellow-500 to-red-700',   prompt: 'Raw energetic punk rock with fast power chords, driving snare, rough vocals energy, loud distorted guitars, and rebellious attitude' },
  { id: 'pop',       name: 'Pop Dance',          category: 'pop',        icon: '🎤', color: 'from-pink-500 to-purple-600',  prompt: 'Infectious pop dance track with catchy hook melodies, tropical percussion, bright synth pads, and uplifting summer vibes' },
  { id: 'kpop',      name: 'K-Pop',              category: 'pop',        icon: '✨', color: 'from-pink-400 to-rose-500',    prompt: 'High production K-Pop track with punchy beats, polished synth layers, catchy melodic hooks, vibrant energetic dancefloor feel' },
  { id: 'rb',        name: 'R&B / Soul',         category: 'pop',        icon: '💜', color: 'from-violet-600 to-purple-800',prompt: 'Smooth R&B soul track with lush chord progressions, warm vocal harmonies, silky groove-driven bass, and late-night atmosphere' },
  { id: 'jazz',      name: 'Jazz',               category: 'jazz',       icon: '🎷', color: 'from-amber-500 to-yellow-700', prompt: 'Smooth jazz with expressive saxophone solos, walking upright bass, brushed drums, and intimate late-night lounge atmosphere' },
  { id: 'blues',     name: 'Blues',              category: 'jazz',       icon: '🎵', color: 'from-blue-600 to-indigo-800',  prompt: 'Soulful blues with slow guitar bends, Hammond organ, walking bass line, and raw emotional storytelling groove' },
  { id: 'cinematic', name: 'Cinematic',          category: 'cinematic',  icon: '🎬', color: 'from-indigo-600 to-blue-800',  prompt: 'Epic cinematic orchestral score with sweeping strings, powerful brass fanfares, dramatic percussion, and emotionally stirring atmosphere' },
  { id: 'classical', name: 'Classical',          category: 'cinematic',  icon: '🎻', color: 'from-amber-600 to-yellow-800', prompt: 'Elegant classical piano composition with delicate melodies, lush string arrangements, and refined orchestral dynamics' },
  { id: 'ambient',   name: 'Ambient / Space',    category: 'chill',      icon: '🌙', color: 'from-blue-700 to-indigo-900',  prompt: 'Atmospheric ambient soundscape with evolving pad textures, subtle field recordings, slow reverb-drenched melodies, and meditative calm' },
  { id: 'lofi',      name: 'Lo-Fi Chill',        category: 'chill',      icon: '☕', color: 'from-emerald-600 to-green-800',prompt: 'Cozy lo-fi hip hop beat with vinyl crackle texture, warm muffled piano chords, laid-back drum groove, and peaceful studying vibes' },
  { id: 'acoustic',  name: 'Acoustic / Folk',    category: 'chill',      icon: '🪕', color: 'from-amber-500 to-orange-700', prompt: 'Warm fingerpicked acoustic guitar melody with gentle percussion, intimate recording feel, folk storytelling atmosphere, and heartfelt emotional resonance' },
  { id: 'hiphop',    name: 'Hip Hop',            category: 'urban',      icon: '🎧', color: 'from-gray-700 to-purple-900',  prompt: 'Boom bap hip hop beat with punchy sampled drums, soulful vinyl samples, deep bass groove, and classic East Coast street feel' },
  { id: 'trap',      name: 'Trap',               category: 'urban',      icon: '🔥', color: 'from-orange-600 to-red-900',   prompt: 'Hard-hitting trap beat with rolling 808 bass, rapid hi-hat triplets, dark atmospheric pads, and modern street energy' },
  { id: 'latin',     name: 'Latin / Reggaeton',  category: 'world',      icon: '🌴', color: 'from-orange-500 to-red-600',   prompt: 'Energetic Latin reggaeton with dembow rhythm, punchy 808 bass, tropical percussion, and infectious dancefloor heat' },
  { id: 'afrobeats', name: 'Afrobeats',          category: 'world',      icon: '🥁', color: 'from-yellow-500 to-orange-600',prompt: 'Vibrant Afrobeats track with layered percussion rhythms, shimmering guitars, catchy danceable groove, and warm West African energy' },
  { id: 'reggae',    name: 'Reggae',             category: 'world',      icon: '🌊', color: 'from-green-500 to-teal-700',   prompt: 'Relaxed reggae track with offbeat guitar skank, deep bass, steady one-drop rhythm, and warm Caribbean island vibes' },
];

const categories = [
  { id: 'all',       name: 'ทั้งหมด' },
  { id: 'electronic',name: '⚡ Electronic' },
  { id: 'rock',      name: '🎸 Rock' },
  { id: 'pop',       name: '🎤 Pop / R&B' },
  { id: 'jazz',      name: '🎷 Jazz' },
  { id: 'cinematic', name: '🎬 Cinematic' },
  { id: 'chill',     name: '☕ Chill' },
  { id: 'urban',     name: '🔥 Urban' },
  { id: 'world',     name: '🌍 World' },
];

const moodOptions = [
  { label: 'Energetic', color: 'from-orange-500 to-red-500' },
  { label: 'Relaxing',  color: 'from-blue-500 to-cyan-500' },
  { label: 'Dark',      color: 'from-gray-700 to-purple-900' },
  { label: 'Happy',     color: 'from-yellow-400 to-orange-400' },
  { label: 'Epic',      color: 'from-indigo-500 to-purple-600' },
  { label: 'Romantic',  color: 'from-pink-500 to-rose-500' },
  { label: 'Mysterious',color: 'from-purple-700 to-gray-800' },
  { label: 'Dreamy',    color: 'from-violet-400 to-pink-400' },
  { label: 'Aggressive',color: 'from-red-600 to-gray-900' },
  { label: 'Melancholic',color:'from-blue-600 to-indigo-800' },
  { label: 'Uplifting', color: 'from-green-400 to-cyan-500' },
  { label: 'Peaceful',  color: 'from-teal-500 to-green-600' },
];

function PromptPage({ prompt, setPrompt, songTitle, setSongTitle, generateRandomTitle, generateMusic, isLoading, progress }) {
  const [mode, setMode] = useState('basic');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeGenre, setActiveGenre] = useState(null);
  const [activeMoods, setActiveMoods] = useState([]);

  const filteredGenres = activeCategory === 'all'
    ? genres
    : genres.filter((g) => g.category === activeCategory);

  const buildPrompt = (genre, moods) => {
    const base = genre.prompt;
    return moods.length ? `${base}, ${moods.map(m => m.toLowerCase()).join(', ')}` : base;
  };

  const handleGenreSelect = (g) => {
    setActiveGenre(g);
    setPrompt(buildPrompt(g, activeMoods));
    if (!songTitle) setSongTitle(`${g.name} Track`);
  };

  const toggleMood = (mood) => {
    const next = activeMoods.includes(mood)
      ? activeMoods.filter((m) => m !== mood)
      : [...activeMoods, mood];
    setActiveMoods(next);
    if (activeGenre) setPrompt(buildPrompt(activeGenre, next));
  };

  return (
    <Fragment>
      {/* ─── Header ─── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-semibold uppercase tracking-widest mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          AI Music Generator
        </div>
        <h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-green-200 to-green-500 leading-tight pb-1">
          Create Your Music
        </h1>
        <p className="text-gray-500 text-sm">เลือกแนวเพลง กำหนด Mood แล้วสร้างเพลงของคุณได้เลย</p>
      </div>

      {/* ─── Song Title + Mode Toggle ─── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-gray-400 text-xs font-semibold tracking-widest uppercase">ชื่อเพลง</label>

          <div className="flex bg-gray-900 rounded-full p-1 border border-gray-700/80">
            {[['basic', 'Basic'], ['advanced', 'Advanced']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setMode(val)}
                className={`px-4 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
                  mode === val
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_12px_rgba(34,197,94,0.35)]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2.5">
          <input
            type="text"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="ตั้งชื่อเพลงของคุณ..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-700/80 bg-gray-900/70 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/70 focus:ring-1 focus:ring-green-500/30 transition-all text-sm"
          />
          <button
            onClick={generateRandomTitle}
            disabled={isLoading}
            title="สุ่มชื่อเพลง"
            className="group flex items-center justify-center w-11 h-11 bg-gray-900/70 border border-gray-700/80 hover:border-green-500/60 rounded-xl transition-all duration-200 hover:shadow-[0_0_12px_rgba(34,197,94,0.25)] disabled:opacity-40 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5 text-gray-500 group-hover:text-green-400 transition-colors w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Mode Content ─── */}
      {mode === 'advanced' ? (
        /* Advanced Mode */
        <div className="mb-6">
          <label className="block text-gray-400 text-xs font-semibold mb-2 tracking-widest uppercase">Prompt</label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="อธิบายแนวเพลงที่ต้องการ เช่น: Epic cinematic orchestral music with sweeping strings, powerful brass, and emotional atmosphere..."
              rows={4}
              disabled={isLoading}
              maxLength={200}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-700/80 bg-gray-900/70 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/70 focus:ring-1 focus:ring-green-500/30 resize-none text-sm transition-all"
            />
            <div className={`absolute bottom-3 right-3.5 text-xs font-medium tabular-nums ${(prompt?.length || 0) > 180 ? 'text-red-400' : 'text-gray-600'}`}>
              {prompt?.length || 0}&thinsp;/&thinsp;200
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            💡 เขียนรายละเอียดเครื่องดนตรี, จังหวะ, อารมณ์เพลง และสไตล์ยิ่งละเอียดยิ่งดี
          </p>
        </div>
      ) : (
        /* Basic Mode */
        <div className="mb-6 space-y-5">

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.35)]'
                    : 'bg-gray-900/80 text-gray-500 border border-gray-700/80 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Genre Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredGenres.map((g) => {
              const isSelected = activeGenre?.id === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => !isLoading && handleGenreSelect(g)}
                  disabled={isLoading}
                  className={`relative flex flex-col items-start p-3.5 rounded-xl border transition-all duration-200 overflow-hidden group text-left ${
                    isSelected
                      ? 'border-transparent ring-2 ring-green-500/70 shadow-[0_0_18px_rgba(34,197,94,0.2)]'
                      : 'border-gray-700/60 hover:border-gray-600/80'
                  } ${isLoading ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}`}
                >
                  {/* Gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${g.color} transition-opacity duration-200`}
                    style={{ opacity: isSelected ? 0.22 : 0.08 }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.03] transition-opacity duration-200" />

                  <span className="text-2xl mb-1.5 relative z-10 leading-none">{g.icon}</span>
                  <span className={`text-xs font-bold relative z-10 leading-snug ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                    {g.name}
                  </span>

                  {isSelected && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.9)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mood & Vibe Tags */}
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2.5">
              Mood &amp; Vibe
              {activeMoods.length > 0 && (
                <button
                  onClick={() => { setActiveMoods([]); if (activeGenre) setPrompt(activeGenre.prompt); }}
                  className="ml-2 normal-case text-gray-600 hover:text-gray-400 font-normal"
                >
                  (ล้าง)
                </button>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map(({ label }) => {
                const isActive = activeMoods.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() => !isLoading && toggleMood(label)}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                      isActive
                        ? 'bg-green-500/15 border-green-500/60 text-green-300 shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                        : 'bg-transparent border-gray-700/80 text-gray-500 hover:border-gray-600 hover:text-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Preview */}
          {activeGenre && (
            <div className="p-3.5 rounded-xl bg-gray-900/50 border border-gray-700/50">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1.5">Prompt ที่จะใช้</p>
              <p className="text-xs text-gray-400 leading-relaxed">{prompt}</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Generate Button ─── */}
      <button
        onClick={generateMusic}
        disabled={isLoading || !prompt}
        className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden ${
          isLoading
            ? 'bg-gray-900 border border-green-500/20 cursor-not-allowed'
            : prompt
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-[0_4px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_4px_30px_rgba(34,197,94,0.55)] hover:scale-[1.01] active:scale-[0.99]'
              : 'bg-gray-800/60 text-gray-600 cursor-not-allowed border border-gray-700/60'
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center w-full py-0.5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
              <span className="text-green-400 text-sm font-semibold">AI กำลังแต่งเพลงให้คุณ...</span>
            </div>
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">ประมวลผลเสียง</span>
                <span className="text-green-400 font-bold tabular-nums">{progress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <span className="flex items-center justify-center gap-2 text-base">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Generate Music
          </span>
        )}
      </button>

      {!prompt && !isLoading && (
        <p className="text-center text-xs text-gray-600 mt-2">เลือกแนวเพลงก่อนเพื่อเริ่มสร้างเพลง</p>
      )}
    </Fragment>
  );
}

export default PromptPage;
