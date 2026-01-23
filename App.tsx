import React, { useState } from 'react';

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [reading, setReading] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getAIReading = async () => {
    if (!user.name || !user.birthday) {
      alert("請輸入姓名與生日，大師才能為您感應能量。");
      return;
    }

    setIsLoading(true);
    setReading(""); // 清除舊的結果
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // 使用更穩定的 v1 版本與正確的型號代碼
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const prompt = `你是一位精通紫微斗數與西洋占星的玄學大師。請為姓名：${user.name}，生日：${user.birthday} 的使用者進行今日運勢鑑定。請用繁體中文回答，語氣神祕且溫暖，約 100 字。`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const result = data.candidates[0].content.parts[0].text;
      setReading(result);
    } catch (error) {
      console.error("AI 呼叫失敗:", error);
      setReading("天機混濁，連線能量不穩定。請檢查 API Key 是否正確，或稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col items-center font-sans">
      <div className="max-w-md w-full mt-12">
        <h1 className="text-4xl font-black text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
          Aetheris OS
        </h1>
        <p className="text-center text-slate-500 text-sm mb-8 tracking-widest uppercase italic">玄學命理人工智慧系統</p>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-2xl backdrop-blur-xl">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-purple-400 mb-1 ml-1 font-bold uppercase">姓名 / Name</label>
              <input 
                type="text" 
                placeholder="輸入您的姓名"
                value={user.name}
                onChange={(e) => setUser({...user, name: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-purple-400 mb-1 ml-1 font-bold uppercase">出生日期 / Birthday</label>
              <input 
                type="date" 
                value={user.birthday}
                onChange={(e) => setUser({...user, birthday: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
            <button 
              onClick={getAIReading}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition duration-300 shadow-lg shadow-purple-900/20 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "🔮 正在召喚星象能量..." : "獲取 AI 大師鑑定"}
            </button>
          </div>
        </div>

        {reading && (
          <div className="mt-8 p-8 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <div className="flex items-center gap-2 mb-4 text-purple-300">
              <span className="text-xl">⚛️</span>
              <h3 className="font-bold tracking-wider uppercase text-sm">大師洞察分析</h3>
            </div>
            <p className="text-slate-200 leading-relaxed text-lg italic font-light">
              "{reading}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
