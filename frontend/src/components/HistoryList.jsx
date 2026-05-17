import React from 'react';
import { getGenreById } from '../data/genrePrompts';

function formatDate(d) {
  if (!d) return '';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return d;
  }
}

function HistoryList({ history, onReusePrompt, onPlayHistory, onLoadMore, hasMore, isLoadingMore }) {
  if (!history || history.length === 0) {
    return (
      <div className="mt-8 p-10 rounded-3xl surface-soft text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-dark-900/80 border border-white/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19a3 3 0 11-6 0 3 3 0 016 0zm12-3a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-gray-300 text-sm font-semibold mb-1">ยังไม่มีประวัติเพลง</p>
        <p className="text-gray-500 text-xs">เริ่มสร้างเพลงแรกของคุณกันเลย!</p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-5 sm:p-6 rounded-3xl surface">
      <div className="flex justify-between items-end mb-5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/80 mb-1 font-mono">
            History
          </div>
          <h4 className="text-xl font-bold text-white">ประวัติการสร้างเพลง</h4>
        </div>
        <div className="text-xs text-gray-500 font-mono">
          <span className="text-emerald-400 font-bold">{history.length}</span> tracks
        </div>
      </div>

      <div className="divider-soft mb-4" />

      <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
        {history.map((item) => {
          const genre = item.genre ? getGenreById(item.genre) : null;
          return (
            <div
              key={item.id}
              className="group p-4 rounded-2xl bg-dark-900/50 border border-white/5 hover:border-emerald-500/40 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-all duration-300 hover:bg-dark-900/80"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-bold text-white text-sm sm:text-base truncate">
                    {item.title}
                  </p>
                  {genre && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${genre.gradient} text-white uppercase tracking-wider`}>
                      {genre.emoji} {genre.name}
                    </span>
                  )}
                  {item.mode === 'advanced' && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                      Advanced
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 italic leading-relaxed">
                  "{item.prompt}"
                </p>
                <p className="text-[10px] text-gray-500 mt-1.5 font-mono">
                  {formatDate(item.date)}
                </p>
              </div>

              <div className="flex gap-1.5 mt-2 sm:mt-0 shrink-0">
                {item.taskId && (
                  <button
                    onClick={() => onPlayHistory(item.taskId, item.title)}
                    className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-dark-900 rounded-xl transition shadow-md hover:shadow-glow hover:scale-105 active:scale-95"
                    title="เล่นเพลงนี้"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5 ml-0.5">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => onReusePrompt(item.prompt, item.title)}
                  className="w-9 h-9 flex items-center justify-center bg-dark-900/80 hover:bg-dark-700 border border-white/10 hover:border-white/30 text-gray-300 rounded-xl transition hover:scale-105 active:scale-95"
                  title="ใช้ Prompt นี้อีกครั้ง"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}

        {hasMore && (
          <div className="flex justify-center pt-3 pb-1">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                isLoadingMore
                  ? 'bg-dark-900/60 text-gray-500 cursor-not-allowed'
                  : 'bg-dark-900/60 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400'
              }`}
            >
              {isLoadingMore ? 'กำลังโหลด...' : 'โหลดเพิ่ม'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryList;
