import React, { Fragment, useState } from "react";

// 🟢 ข้อมูลแนวเพลงสำหรับโหมด Basic
const genres = [
  { id: 'pop', name: 'Pop Dance', icon: '🎤', prompt: 'Pop dance track with catchy melodies, tropical percussion, and upbeat rhythms, perfect for the beach' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎬', prompt: 'Epic cinematic orchestral music with sweeping strings and powerful brass, dramatic and emotional' },
  { id: 'rock', name: 'Rock', icon: '🎸', prompt: 'High energy rock track with heavy electric guitars, driving drum beats, and aggressive bass' },
  { id: 'jazz', name: 'Jazz', icon: '🎷', prompt: 'Smooth jazz tune with saxophone solos, upright bass, and a relaxing evening groove' },
  { id: 'electronic', name: 'Electronic', icon: '🎧', prompt: 'Futuristic electronic dance track with deep bass, pulsing synths, and cyberpunk vibe' },
  { id: 'lofi', name: 'Lo-Fi Chill', icon: '☕', prompt: 'Chill lo-fi hip hop beat with vinyl crackle, warm piano, and relaxed drums for studying' },
];

function PromptPage({ 
  prompt,         // รับค่า prompt ปัจจุบัน
  setPrompt,      // รับฟังก์ชันสำหรับเปลี่ยนค่า prompt
  songTitle,      // รับชื่อเพลงปัจจุบัน
  setSongTitle,   // รับฟังก์ชันสำหรับเปลี่ยนชื่อเพลง
  generateRandomTitle, // ฟังก์ชันสุ่มชื่อเพลง
  generateMusic,  // ฟังก์ชันเริ่มสร้างเพลง
  isLoading,      // สถานะว่ากำลังโหลดอยู่ไหม
  progress        // เลข % ความคืบหน้า
}) {

  // 🟢 State สำหรับจัดการโหมด
  const [mode, setMode] = useState('basic');

  return (
    <Fragment> 
      <h1 className="text-4xl font-bold uppercase mb-3 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-white">
        AI Music Studio 🎵
      </h1>
      <p className="text-gray-400 mb-6">พิมพ์แนวเพลง จากนั้นกดปุ่ม "Generate Music" เพื่อสร้างเพลง</p>

      {/* 🟢 ส่วนชื่อเพลง + Toggle สลับโหมด */}
      <div className="mb-4 text-left">
        <div className="flex justify-between items-end mb-2">
          <label className="block text-gray-400 text-sm font-bold focus:shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            ชื่อเพลง
          </label>
          
          {/* Toggle Switch */}
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-600 shadow-inner">
            <button
              onClick={() => setMode('basic')}
              className={`px-4 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                mode === 'basic' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Basic Mode
            </button>
            <button
              onClick={() => setMode('advanced')}
              className={`px-4 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                mode === 'advanced' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Advanced Mode
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="ตั้งชื่อเพลง หรือสุ่มชื่อ"
            disabled={isLoading}
            className="flex-1 p-3 text-lg rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-dark-500 focus:ring-1 focus:ring-green-500"
          />
          <button
            onClick={generateRandomTitle}
            disabled={isLoading}
            title="สุ่มชื่อเพลง"
            className="group flex items-center justify-center p-3 bg-dark-800/80 backdrop-blur-sm border border-gray-600 hover:border-green-500 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:pointer-events-none"
          >
            {/* SVG ไอคอนสุ่ม */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-400 group-hover:text-green-400 transition-colors">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 🟢 พื้นที่ Prompt สลับตามโหมด */}
      {mode === 'advanced' ? (
        <div className="relative mb-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Pop dance track with catchy melodies, tropical percussion, and upbeat rhythms, perfect for the beach"
            rows={3}
            disabled={isLoading}
            className="w-full p-3 text-lg rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-dark-500 focus:ring-1 focus:ring-green-500 resize-none"
          />
          <div className="absolute bottom-3 right-3 text-md font-medium text-gray-500">
            {prompt?.length || 0} / 200
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {genres.map((g) => {
            const isSelected = prompt === g.prompt;
            return (
              <button
                key={g.id}
                onClick={() => {
                  setPrompt(g.prompt);
                  if (!songTitle) setSongTitle(`${g.name} Track`); // ตั้งชื่อให้อัตโนมัติถ้าช่องชื่อว่าง
                }}
                disabled={isLoading}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-3xl mb-2">{g.icon}</span>
                <span className="text-sm font-semibold">{g.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 🟢 ปุ่ม Generate ของคุณแบบต้นฉบับ 100% */}
      <button
        onClick={generateMusic}
        disabled={isLoading}
        className={`w-full py-4 px-6 text-xl font-bold rounded-xl transition-all duration-300 ${isLoading
            ? 'bg-green-600 cursor-not-allowed text-green-400 shadow-[0_0_20px_rgba(72,187,120,0.7)]'
            : 'bg-dark-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]'
          }`}
      >
        {isLoading ? '⏳ กำลังแต่งเพลงและประมวลผลเสียง (โปรดรอสักครู่)...' : '✨ Generate Music'}
        
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