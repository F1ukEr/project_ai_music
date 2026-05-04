import React from 'react';

const genres = [
  { name: "Cinematic", icon: "🎬", prompt: "Epic cinematic orchestral music with sweeping strings and powerful brass" },
  { name: "Pop", icon: "🎤", prompt: "Catchy upbeat pop music with bright melodies and energetic rhythm" },
  { name: "Rock", icon: "🎸", prompt: "High energy rock track with heavy electric guitars and driving drum beats" },
  { name: "Jazz", icon: "🎷", prompt: "Smooth jazz tune with saxophone solos, upright bass, and a relaxing groove" },
  { name: "Electronic", icon: "🎧", prompt: "Futuristic electronic dance track with deep bass and pulsing synths" },
  { name: "Lo-Fi", icon: "☕", prompt: "Chill lo-fi hip hop beat with vinyl crackle, warm piano, and relaxed drums" },
  { name: "Acoustic", icon: "🌾", prompt: "Calm acoustic guitar melody with warm and soothing vibes" },
  { name: "Cyberpunk", icon: "🤖", prompt: "Fast-paced cyberpunk electronic track with heavy bass and synth leads" }
];

function BasicMode({ prompt, setPrompt, setSongTitle, generateMusic, isLoading, progress }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-200 mb-6">เลือกแนวเพลงที่คุณต้องการ</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {genres.map((g) => {
          const isSelected = prompt === g.prompt;
          return (
            <div
              key={g.name}
              onClick={() => {
                if (isLoading) return;
                // เซ็ตค่าลง State เดิมของคุณ
                setPrompt(g.prompt);
                setSongTitle(`${g.name} Track`);
              }}
              className={`border rounded-xl p-6 text-center cursor-pointer transition-all duration-300 
                ${isSelected ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'} 
                ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="text-4xl mb-3">{g.icon}</div>
              <div className="font-semibold text-white">{g.name}</div>
            </div>
          );
        })}
      </div>

      {/* ปุ่มสร้างเพลงสำหรับ Basic Mode */}
      <div className="flex flex-col items-center justify-center mt-6">
        <button 
          onClick={generateMusic} 
          disabled={isLoading || !prompt}
          className={`px-8 py-3 font-bold rounded-lg transition-all ${
            isLoading || !prompt 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-400 text-white'
          }`}
        >
          {isLoading ? `กำลังสร้าง...` : '✨ สร้างเพลงเลย'}
        </button>

        {/* แถบโหลด */}
        {isLoading && (
          <div className="w-full mt-4">
            <p className="text-blue-400 font-bold mb-2">Progress: {progress}%</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BasicMode;