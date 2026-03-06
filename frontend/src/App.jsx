import React, { useState, useEffect } from 'react';
import MusicPlayer from './components/MusicPlayer';
import HistoryList from './components/HistoryList';
function App() {
  const [prompt, setPrompt] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [finishedTitle, setFinishedTitle] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('musicHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const generateRandomTitle = () => {
    const coolTitles = [
      "Digital Horizon", "Neon Distortion", "Midnight Echoes",
      "Synthetic Soul", "Crawling Shadows", "Cyberpunk Rhapsody", "Electric Mirage", "Pixelated Dreams", "Future Nostalgia", "บัวลอยในสายลม", "เสียงของความว่างเปล่า", "แสงสุดท้ายของวัน", "ดนตรีแห่งความทรงจำ", "จังหวะของหัวใจที่แตกสลาย", "เสียงสะท้อนจากอดีต", "บทเพลงแห่งความหวัง", "เสียงกระซิบของจักรวาล", "ทำนองแห่งความฝัน", "เสียงเรียกจากความมืด", "บทเพลงที่ไม่มีคำบรรยาย"
    ];
    const randomIndex = Math.floor(Math.random() * coolTitles.length);
    setSongTitle(coolTitles[randomIndex]);
  };

  const generateMusic = async () => {
    if (!prompt.trim()) {
      alert("กรุณาพิมพ์ข้อความก่อนสร้างเพลง!");
      return;
    }

    setIsLoading(true);
    setError('');
    setAudioUrl(null);
    setProgress(0); // 🟢 เริ่มต้นที่ 0%

    try {
      // 1. สั่งเริ่มงาน ขอรหัส task_id จาก Backend
      const startResponse = await fetch('https://f1uke-music-ai-backend.hf.space/generate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!startResponse.ok) throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      const { task_id } = await startResponse.json();

      // 2. ฟังก์ชันวนเช็คสถานะ
      const checkStatus = async () => {
        try {
          const statusRes = await fetch(`https://f1uke-music-ai-backend.hf.space/status/${task_id}`);
          const data = await statusRes.json();

          // อัปเดต % จาก Backend มาใส่ใน React
          setProgress(data.progress || 0);

          if (data.status === 'completed') {
            // 3. ถ้าสำเร็จ 100% ให้ดาวน์โหลดไฟล์มาเล่น
            const audioRes = await fetch(`https://f1uke-music-ai-backend.hf.space/download/${task_id}`);
            const audioBlob = await audioRes.blob();

            const url = URL.createObjectURL(audioBlob);
            const finalTitle = songTitle.trim() === '' ? 'Untitled Track' : songTitle;

            setFinishedTitle(finalTitle);
            setAudioUrl(url);

            // บันทึกประวัติ
            const newHistoryItem = {
              id: Date.now(),
              taskId: task_id,
              title: finalTitle,
              prompt: prompt,
              date: new Date().toLocaleTimeString('th-TH')
            };
            const updatedHistory = [newHistoryItem, ...history].slice(0, 5);
            setHistory(updatedHistory);
            localStorage.setItem('musicHistory', JSON.stringify(updatedHistory));

            setIsLoading(false);
          } else if (data.status === 'failed') {
            setError(`สร้างเพลงล้มเหลว: ${data.error}`);
            setIsLoading(false);
          } else {
            // ถ้ายืนยันว่ายัง processing อยู่ ให้รอ 2 วินาทีแล้วถามใหม่
            setTimeout(checkStatus, 2000);
          }
        } catch (err) {
          console.error(err);
          setError('การเชื่อมต่อขาดหายระหว่างรอเพลง');
          setIsLoading(false);
        }
      };

      // เริ่มการถามครั้งแรก
      setTimeout(checkStatus, 1500);

    } catch (err) {
      console.error(err);
      setError('ไม่สามารถส่งคำสั่งเริ่มงานได้');
      setIsLoading(false);
    }
  };

  // ดึง Prompt จากประวัติกลับมาใช้ใหม่
  const reusePrompt = (oldPrompt, oldTitle) => {
    setPrompt(oldPrompt);
    setSongTitle(oldTitle);
  };

  const playFromHistory = (taskId, title) => {
    // โหลดไฟล์เสียงตรงๆ จาก Backend ตามรหัส
    const url = `https://f1uke-music-ai-backend.hf.space/download/${taskId}`;
    setAudioUrl(url);
    setFinishedTitle(title);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // เลื่อนจอกลับขึ้นไปด้านบน
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 text-center mt-6 ">
      <div className="p-8 rounded-2xl bg-dark-900/60 backdrop-blur border border-gray-700/50 shadow-2xl">
        <h1 className="text-4xl font-bold uppercase mb-3 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-white">
          AI Music Studio 🎵
        </h1>
        <p className="text-gray-400 mb-6">พิมพ์แนวเพลง จากนั้นกดปุ่ม "Generate Music" เพื่อสร้างเพลง</p>

        {/* ช่องใส่ชื่อเพลง */}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-gray-400 group-hover:text-green-400 transition-colors"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ช่องใส่ Prompt */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="rock, pop, jazz, hip-hop, etc หรือ เพลงช้าๆ เศร้าๆ"
          rows={3}
          className="w-full p-3 text-lg rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-500 mb-4 focus:outline-none focus:border-dark-500 focus:ring-1 focus:ring-green-500"
        />
        <div className="absolute bottom-1 right-3 text-md font-medium text-gray-500">
          {prompt?.length || 0} / 200
        </div>
        <button
          onClick={generateMusic}
          disabled={isLoading}
          className={`w-full py-4 px-6 text-xl font-bold rounded-xl transition-all duration-300 ${isLoading
            ? 'bg-green-600 cursor-not-allowed text-green-400 shadow-[0_0_20px_rgba(72,187,120,0.7)]'
            : 'bg-dark-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]'
            }`}
        >
          {isLoading ? '⏳ กำลังแต่งเพลงและประมวลผลเสียง (รอประมาณ 5-15 นาที)...' : '✨ Generate Music'}
          {isLoading && (
            <div className="mt-4 w-full">
              <div className="flex justify-between text-sm text-white font-medium mb-1 px-1">
                <span>AI กำลังทำงาน (ใช้เวลาประมาณ 5-15 นาที)</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-3 border border-dark-700 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-green-400 to-white h-3 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>)}
        </button>


        {error && <div className="text-red-500 mt-5 font-bold">❌ {error}</div>}

        {/* Waveform Player */}
        <MusicPlayer audioUrl={audioUrl} title={finishedTitle} />
      </div>

      {/*  ประวัติการสร้าง */}
      <HistoryList history={history} onReusePrompt={reusePrompt} onPlayHistory={playFromHistory} />
    </div>

  );
}

export default App;