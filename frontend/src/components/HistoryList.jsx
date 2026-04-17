import React from 'react';

function HistoryList({ history, onReusePrompt, onPlayHistory, onLoadMore, hasMore, isLoadingMore }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="mt-8 p-6 rounded-2xl bg-dark-900/40 border border-gray-700 text-left">
      {/* แก้ข้อความหัวข้อให้ครอบคลุม และบอกจำนวนทั้งหมดที่มีในระบบ */}
      <div className="flex justify-between items-end mb-4">
        <h4 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-white bg-clip-text text-transparent">
          ประวัติการสร้างเพลง
        </h4>
        <span className="text-sm text-gray-400">ทั้งหมด {history.length} รายการ</span>
      </div>
      
      {/* เพิ่ม max-h-[500px] และ overflow-y-auto เพื่อให้มี Scrollbar ถ้าเพลงเริ่มเยอะ */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {history.map((item) => (
          <div key={item.id} className="group p-4 rounded-xl bg-dark-800/50 border border-gray-700 hover:border-green-500 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:bg-dark-800 transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <div className="flex-1">
              <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-white text-lg group-hover:text-green-300 transition-colors">{item.title}</p>
              <p className="text-sm text-white-600 line-clamp-2">"{item.prompt}"</p>
              <p className="text-sm text-white-500 mt-2">เวลาที่สร้าง: {item.date}</p>
            </div>

            <div className="flex-2 gap-2 mt-2 sm:mt-0 flex">
              {/* ปุ่มเล่นเพลงจากประวัติ */}
              {item.taskId && (
                <button
                  onClick={() => onPlayHistory(item.taskId, item.title)}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-sm rounded-lg text-white transition whitespace-nowrap shadow-md hover:shadow-[0_0_10px_rgba(34,197,94,0.5)] mr-2"
                  title="เล่นเพลงนี้"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    className="w-4 h-4 transition-transform group-hover:scale-110"
                  >
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                </button>
              )}

              {/* ปุ่มใช้ Prompt ซ้ำ */}
              <button
                onClick={() => onReusePrompt(item.prompt, item.title)}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm rounded-lg text-white transition whitespace-nowrap"
                title="ใช้ Prompt นี้อีกครั้ง"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {/* ปุ่มโหลดเพิ่มเติม ถ้ามีรายการเก่ากว่านี้อีก */ }
        {hasMore && (
          <div className="flex justify-center pt-4 pb-2">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                isLoadingMore 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-dark-800 border border-gray-600 text-green-400 hover:bg-dark-700 hover:border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
              }`}
            >
              {isLoadingMore ? '⏳ กำลังโหลด...' : '⬇️ โหลดเพิ่มเติม'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryList;