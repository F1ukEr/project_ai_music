import React, { useState, useEffect } from 'react';
import PromptPage from './components/Promt';
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
  const [lastDate, setLastDate] = useState(null); // สำหรับเก็บวันที่ของรายการล่าสุดที่โหลดมา
  const [hasMore, setHasMore] = useState(true); // สำหรับเช็คว่ามีรายการเก่ากว่านี้อีกไหม
  const [isLoadingMore, setIsLoadingMore] = useState(false); // สำหรับสถานะการโหลดรายการเก่า


  useEffect(() => {
    // โหลดประวัติจาก Database ผ่าน API
    /*const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8000/history');
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error('ไม่สามารถโหลดประวัติได้:', err);
      }*/
    fetchHistory();
  }, []);


  // 🟢 แก้ไขฟังก์ชัน fetchHistory ให้รับพารามิเตอร์ isLoadMore
  const fetchHistory = async (isLoadMore = false) => {
    // ถ้าเป็นการกดโหลดเพิ่ม ให้เซ็ตสถานะปุ่มเป็นกำลังโหลด
    if (isLoadMore) setIsLoadingMore(true);

    try {
      // สร้าง URL พร้อมเช็คว่าต้องแนบ last_date ไปไหม
      /*const url = isLoadMore && lastDate
        ? `http://localhost:8000/history?last_date=${encodeURIComponent(lastDate)}`
        : 'http://localhost:8000/history';*/
      const url = isLoadMore && lastDate
        ? `https://f1uke-music-ai-backend.hf.space/history?last_date=${encodeURIComponent(lastDate)}`
        : 'https://f1uke-music-ai-backend.hf.space/history';

      const res = await fetch(url);
      const data = await res.json();

      if (data.length > 0) {
        if (isLoadMore) {
          // ถ้าระบุว่าโหลดเพิ่ม ให้เอาข้อมูลใหม่ไปต่อท้ายของเดิม
          setHistory(prev => [...prev, ...data]);
        } else {
          // ถ้าดึงครั้งแรกตอนเปิดเว็บ ให้แทนที่ข้อมูลทั้งหมด
          setHistory(data);
        }

        // อัปเดตวันที่ล่าสุด (จากรายการสุดท้ายที่ได้มา) เพื่อเอาไว้ใช้โหลดครั้งหน้า
        setLastDate(data[data.length - 1].date);

        // ตรวจสอบว่ายังมีให้โหลดต่อไหม (ถ้าได้มา 10 รายการเป๊ะ อาจจะมีต่อ)
        setHasMore(data.length === 10);
      } else {
        // ถ้าได้ข้อมูลกลับมาเป็น 0 แสดงว่าหมดประวัติแล้ว
        setHasMore(false);
        if (!isLoadMore) setHistory([]);
      }
    } catch (err) {
      console.error('ไม่สามารถโหลดประวัติได้:', err);
    } finally {
      // เมื่อทำงานเสร็จ ปิดสถานะกำลังโหลด
      setIsLoadingMore(false);
    }
  }; // 🟢 วงเล็บปิดฟังก์ชันครบถ้วน

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
    if (prompt.length > 200) {
      alert("ข้อความยาวเกินไป! กรุณาใส่ไม่เกิน 200 ตัวอักษร.");
      return;
    }

    setIsLoading(true);
    setError('');
    setAudioUrl(null);
    setProgress(0); // 🟢 เริ่มต้นที่ 0%

    try {
      // 1. สั่งเริ่มงาน ขอรหัส task_id จาก Backend
      //const startResponse = await fetch('http://localhost:8000/generate-task',
      const startResponse = await fetch('https://f1uke-music-ai-backend.hf.space/generate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt, title: songTitle.trim() === '' ? 'Untitled Track' : songTitle }),
      });

      if (!startResponse.ok) throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      const { task_id } = await startResponse.json();

      // 2. ฟังก์ชันวนเช็คสถานะ
      const checkStatus = async () => {
        try {
          //const statusRes = await fetch(`http://localhost:8000/status/${task_id}`);
          const statusRes = await fetch(`https://f1uke-music-ai-backend.hf.space/status/${task_id}`);
          const data = await statusRes.json();

          // อัปเดต % จาก Backend มาใส่ใน React
          setProgress(data.progress || 0);

          if (data.status === 'completed') {
            // 3. ถ้าสำเร็จ 100% ให้ดาวน์โหลดไฟล์มาเล่น
            //const audioRes = await fetch(`http://localhost:8000/download/${task_id}`);
            const audioRes = await fetch(`https://f1uke-music-ai-backend.hf.space/download/${task_id}`);
            const audioBlob = await audioRes.blob();
            const url = URL.createObjectURL(audioBlob);
            console.log(`🎉 เพลงพร้อมแล้ว! URL: ${url}`);
            console.log(`🎵 ชื่อเพลง: ${songTitle.trim() === '' ? 'Untitled Track' : songTitle}`);
            console.log(`📝 Prompt ที่ใช้: ${prompt}`);
            console.log(`⏱️ เวลาที่ใช้: ${data.execution_time} วินาที`);
            const finalTitle = songTitle.trim() === '' ? 'Untitled Track' : songTitle;

            setFinishedTitle(finalTitle);
            setAudioUrl(url);
            setIsLoading(false);
            fetchHistory(false); // รีเฟรชประวัติใหม่หลังสร้างเพลงเสร็จ


          } else if (data.status === 'failed') {
            setError(`สร้างเพลงล้มเหลว: ${data.error}`);
            setIsLoading(false);
          } else {
            // ถ้ายังไม่เสร็จ ให้รอแล้วเช็คใหม่อีกครั้ง
            setTimeout(checkStatus, 5000);
          }
        } catch (err) {
          console.error(err);
          setError('การเชื่อมต่อขาดหายระหว่างรอเพลง');
          setIsLoading(false);
        }
      };

      // เริ่มการถามครั้งแรก
      setTimeout(checkStatus, 5000);

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
    //const url = `http://localhost:8000/download/${taskId}`;
    const url = `https://f1uke-music-ai-backend.hf.space/download/${taskId}`;
    setAudioUrl(url);
    setFinishedTitle(title);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // เลื่อนจอกลับขึ้นไปด้านบน
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 text-center mt-6 ">
      <div className="p-8 rounded-2xl bg-dark-900/60 backdrop-blur border border-gray-700/50 shadow-2xl">
          <PromptPage 
            prompt={prompt} 
            setPrompt={setPrompt} 
            songTitle={songTitle} 
            setSongTitle={setSongTitle}
            generateRandomTitle={generateRandomTitle}
            generateMusic={generateMusic}
            isLoading={isLoading}
            progress={progress}
          />


        {error && <div className="text-red-500 mt-5 font-bold">❌ {error}</div>}

        {/* Waveform Player */}
        <MusicPlayer audioUrl={audioUrl} title={finishedTitle} />
      </div>

      {/*  ประวัติการสร้าง */}
      <HistoryList history={history} onReusePrompt={reusePrompt} onPlayHistory={playFromHistory} onLoadMore={() => fetchHistory(true)} hasMore={hasMore} isLoadingMore={isLoadingMore} />
    </div>

  );
}

export default App;