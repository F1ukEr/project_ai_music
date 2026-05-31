import React, { useState, useEffect } from 'react';
import PromptPage from './components/Promt';
import MusicPlayer from './components/MusicPlayer';
import HistoryList from './components/HistoryList';

//const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const API_BASE = 'https://f1uke-music-ai-backend.hf.space';

function App() {
  const [prompt, setPrompt] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [finishedTitle, setFinishedTitle] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [lastDate, setLastDate] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);

  const [mode, setMode] = useState(() => localStorage.getItem('mode') || 'basic');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [durationTokens, setDurationTokens] = useState(() => {
    const v = parseInt(localStorage.getItem('duration_tokens') || '1500', 10);
    return [500, 1000, 1500].includes(v) ? v : 1500;
  });

  const [UserID] = useState(() => {
    let id = localStorage.getItem('user_id');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('user_id', id);
    }
    return id;
  });

  useEffect(() => {
    localStorage.setItem('mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('duration_tokens', String(durationTokens));
  }, [durationTokens]);

  useEffect(() => {
    fetchHistory();
    checkBackend();
    const t = setInterval(checkBackend, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkBackend = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
      setBackendOnline(res.ok);
    } catch {
      setBackendOnline(false);
    }
  };

  const fetchHistory = async (isLoadMore = false) => {
    if (isLoadMore) setIsLoadingMore(true);

    try {
      const url =
        isLoadMore && lastDate
          ? `${API_BASE}/history?user_id=${UserID}&last_date=${encodeURIComponent(lastDate)}`
          : `${API_BASE}/history?user_id=${UserID}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.length > 0) {
        if (isLoadMore) {
          setHistory((prev) => [...prev, ...data]);
        } else {
          setHistory(data);
        }
        setLastDate(data[data.length - 1].date);
        setHasMore(data.length === 10);
      } else {
        setHasMore(false);
        if (!isLoadMore) setHistory([]);
      }
    } catch (err) {
      console.error('ไม่สามารถโหลดประวัติได้:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const generateRandomTitle = () => {
    const coolTitles = [
      'Digital Horizon', 'Neon Distortion', 'Midnight Echoes',
      'Synthetic Soul', 'Crawling Shadows', 'Cyberpunk Rhapsody',
      'Electric Mirage', 'Pixelated Dreams', 'Future Nostalgia',
      'บัวลอยในสายลม', 'เสียงของความว่างเปล่า', 'แสงสุดท้ายของวัน',
      'ดนตรีแห่งความทรงจำ', 'จังหวะของหัวใจที่แตกสลาย', 'เสียงสะท้อนจากอดีต',
      'บทเพลงแห่งความหวัง', 'เสียงกระซิบของจักรวาล', 'ทำนองแห่งความฝัน',
      'เสียงเรียกจากความมืด', 'บทเพลงที่ไม่มีคำบรรยาย',
    ];
    const randomIndex = Math.floor(Math.random() * coolTitles.length);
    setSongTitle(coolTitles[randomIndex]);
  };

  const generateMusic = async () => {
    if (!prompt.trim()) {
      alert('กรุณาเลือกแนวเพลงหรือพิมพ์ข้อความก่อนสร้างเพลง!');
      return;
    }
    if (prompt.length > 400) {
      alert('ข้อความยาวเกินไป! กรุณาใส่ไม่เกิน 400 ตัวอักษร.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAudioUrl(null);
    setProgress(0);

    try {
      const startResponse = await fetch(`${API_BASE}/generate-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          title: songTitle.trim() === '' ? 'Untitled Track' : songTitle,
          user_id: UserID,
          mode,
          genre: mode === 'basic' ? selectedGenre : null,
          duration_tokens: durationTokens,
        }),
      });

      if (!startResponse.ok) {
        const errBody = await startResponse.json().catch(() => ({}));
        throw new Error(errBody.error || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      }
      const { task_id } = await startResponse.json();

      const checkStatus = async () => {
        try {
          const statusRes = await fetch(`${API_BASE}/status/${task_id}`);
          const data = await statusRes.json();

          setProgress(data.progress || 0);

          if (data.status === 'completed') {
            const finalTitle = songTitle.trim() === '' ? 'Untitled Track' : songTitle;
            setAudioUrl(data.audio_url);
            setFinishedTitle(finalTitle);
            setIsLoading(false);
            fetchHistory(false);
          } else if (data.status === 'failed') {
            setError(`สร้างเพลงล้มเหลว: ${data.error || 'ไม่ทราบสาเหตุ'}`);
            setIsLoading(false);
          } else {
            setTimeout(checkStatus, 5000);
          }
        } catch (err) {
          console.error(err);
          setError('การเชื่อมต่อขาดหายระหว่างรอเพลง');
          setIsLoading(false);
        }
      };

      setTimeout(checkStatus, 5000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'ไม่สามารถส่งคำสั่งเริ่มงานได้');
      setIsLoading(false);
    }
  };

  const reusePrompt = (oldPrompt, oldTitle) => {
    setMode('advanced');
    setPrompt(oldPrompt);
    setSongTitle(oldTitle);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const playFromHistory = (taskId, title) => {
    const selected = history.find((item) => item.taskId === taskId);
    if (selected && selected.audio_url) {
      setAudioUrl(selected.audio_url);
      setFinishedTitle(title);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('ไม่พบไฟล์เสียงสำหรับรายการนี้');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* floating API status indicator */}
      <div className="fixed top-4 right-4 z-40">
        <StatusBadge online={backendOnline} />
      </div>

      {/* ── Main ─────────────────────────────────── */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-12">
        <div className="surface p-6 sm:p-9 rounded-3xl">
          <PromptPage
            prompt={prompt}
            setPrompt={setPrompt}
            songTitle={songTitle}
            setSongTitle={setSongTitle}
            generateRandomTitle={generateRandomTitle}
            generateMusic={generateMusic}
            isLoading={isLoading}
            progress={progress}
            mode={mode}
            setMode={setMode}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            durationTokens={durationTokens}
            setDurationTokens={setDurationTokens}
          />

          {error && (
            <div className="mt-5 px-4 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-sm font-medium flex items-start gap-2 animate-fadeIn">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mt-0.5 shrink-0">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 5h2v7h-2V7zm0 9h2v2h-2v-2z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <MusicPlayer audioUrl={audioUrl} title={finishedTitle} />
        </div>

        <HistoryList
          history={history}
          onReusePrompt={reusePrompt}
          onPlayHistory={playFromHistory}
          onLoadMore={() => fetchHistory(true)}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
        />
      </main>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="border-t border-white/5 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <div>
            Powered by{' '}
            <span className="text-emerald-400 font-semibold">MusicGen</span>
            <span className="mx-2 text-gray-700">·</span>
            <span className="font-mono">v1.0</span>
          </div>
          <div>© {new Date().getFullYear()} AI Music Studio</div>
        </div>
      </footer>
    </div>
  );
}

function StatusBadge({ online }) {
  const color =
    online === null
      ? 'bg-gray-500'
      : online
        ? 'bg-emerald-400'
        : 'bg-red-500';
  const label =
    online === null ? 'checking…' : online ? 'API online' : 'API offline';
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-dark-900/50">
      <span className="relative flex h-2 w-2">
        {online && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
      </span>
      <span className="text-[10px] uppercase tracking-widest font-mono text-gray-300">
        {label}
      </span>
    </div>
  );
}

export default App;
