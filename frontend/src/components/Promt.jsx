import React, { Fragment } from "react";

const BASIC_GENRES = [
  {
    label: "Pop",
    prompt: "Upbeat pop track with catchy melodies, bright synths, and danceable rhythm.",
  },
  {
    label: "Rock",
    prompt: "Energetic rock song with driving guitars, punchy drums, and stadium vibe.",
  },
  {
    label: "Lo-fi",
    prompt: "Chill lo-fi beat with warm keys, vinyl texture, and relaxed groove for studying.",
  },
  {
    label: "Hip-Hop",
    prompt: "Modern hip-hop instrumental with deep bass, crisp drums, and confident mood.",
  },
  {
    label: "EDM",
    prompt: "Festival EDM anthem with powerful drop, sidechain synths, and high energy.",
  },
  {
    label: "Cinematic",
    prompt: "Emotional cinematic score with strings, piano, and epic atmosphere.",
  },
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
  generationMode,
  setGenerationMode,
}) {
  const selectedGenre = BASIC_GENRES.find((genre) => genre.prompt === prompt)?.label || "";

  return (
    <Fragment>
      <h1 className="text-4xl font-bold uppercase mb-3 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-white">
        AI Music Studio 🎵
      </h1>
      <p className="text-gray-400 mb-6">
        เลือกโหมด <span className="font-semibold text-white">Basic</span> หรือ <span className="font-semibold text-white">Advanced</span> แล้วกดสร้างเพลงได้ทันที
      </p>

      <div className="mb-6 bg-gray-900/60 border border-gray-700 rounded-xl p-2 inline-flex gap-2">
        <button
          type="button"
          onClick={() => setGenerationMode("basic")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            generationMode === "basic"
              ? "bg-green-500 text-black shadow-[0_0_12px_rgba(34,197,94,0.5)]"
              : "bg-gray-800 text-gray-300 hover:text-white"
          }`}
        >
          Basic
        </button>
        <button
          type="button"
          onClick={() => setGenerationMode("advanced")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            generationMode === "advanced"
              ? "bg-green-500 text-black shadow-[0_0_12px_rgba(34,197,94,0.5)]"
              : "bg-gray-800 text-gray-300 hover:text-white"
          }`}
        >
          Advanced
        </button>
      </div>

      <div className="mb-4 text-left">
        <label className="block text-gray-400 text-sm font-bold mb-2 focus:shadow-[0_0_20px_rgba(34,197,94,0.2)]">ชื่อเพลง</label>
        <div className="flex gap-4">
          <input
            type="text"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="ตั้งชื่อเพลง หรือสุ่มชื่อ"
            className="flex-1 p-3 text-lg rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-dark-500 focus:ring-1 focus:ring-green-500"
          />
          <button
            onClick={generateRandomTitle}
            title="สุ่มชื่อเพลง"
            className="group flex items-center justify-center p-3 bg-dark-800/80 backdrop-blur-sm border border-gray-600 hover:border-green-500 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-400 group-hover:text-green-400 transition-colors">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </button>
        </div>
      </div>

      {generationMode === "basic" ? (
        <div className="mb-5 text-left">
          <label className="block text-gray-400 text-sm font-bold mb-2">เลือกแนวเพลงสำเร็จรูป</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {BASIC_GENRES.map((genre) => (
              <button
                key={genre.label}
                type="button"
                onClick={() => setPrompt(genre.prompt)}
                className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${
                  selectedGenre === genre.label
                    ? "border-green-400 bg-green-500/20 text-green-300"
                    : "border-gray-600 bg-gray-800 text-gray-200 hover:border-green-400"
                }`}
              >
                {genre.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            โหมด Basic จะเติม Prompt ให้อัตโนมัติจากแนวเพลงที่คุณเลือก
          </p>
        </div>
      ) : (
        <div className="mb-2 text-left">
          <label className="block text-gray-400 text-sm font-bold mb-2">Prompt แบบกำหนดเอง</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Pop dance track with catchy melodies, tropical percussion, and upbeat rhythms, perfect for the beach"
            rows={3}
            className="w-full p-3 text-lg rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-500 mb-2 focus:outline-none focus:border-dark-500 focus:ring-1 focus:ring-green-500"
          />
          <div className="text-right text-sm font-medium text-gray-500 mb-2">{prompt?.length || 0} / 200</div>
        </div>
      )}

      <button
        onClick={generateMusic}
        disabled={isLoading}
        className={`w-full py-4 px-6 text-xl font-bold rounded-xl transition-all duration-300 ${
          isLoading
            ? "bg-green-600 cursor-not-allowed text-green-400 shadow-[0_0_20px_rgba(72,187,120,0.7)]"
            : "bg-dark-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]"
        }`}
      >
        {isLoading ? "⏳ กำลังแต่งเพลงและประมวลผลเสียง (โปรดรอสักครู่)..." : "✨ Generate Music"}

        {isLoading && (
          <div className="mt-4 w-full">
            <div className="flex justify-between text-sm text-white font-medium mb-1 px-1">
              <span>AI กำลังทำงาน (ใช้เวลาสักครู่)</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-dark-800 rounded-full h-3 border border-dark-700 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-green-400 to-white h-3 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </button>
    </Fragment>
  );
}

export default PromptPage;
