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
    setReading(""); 
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // 【核心修正】改用 v1 版本，並使用絕對不會錯的模型標識符
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

      const prompt = `你是一位玄學大師。姓名：${user.name}，生日：${user.birthday}。請為他進行今日運勢鑑定。請用繁體中文回答，約 100 字。`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();

      if (data.error) {
        // 如果 gemini-pro 也不行（極少見），這裡會抓到原因
        throw new Error(data.error.message);
      }

      if (data.candidates && data.candidates[0].content) {
        setReading(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error("模型未感應到訊息，請重試。");
      }
    } catch (error: any) {
      console.error("AI 呼叫失敗:", error);
      setReading(`天機不可洩漏（錯誤：${error.message}）。請確認 Vercel 環境變數已點擊 Redeploy 且 Key 正確。`);
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
        <p className="text-center text-slate-500 text-sm mb-8 tracking-widest uppercase italic font-bold">玄學命理人工智慧系統</p>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-2xl backdrop-blur-xl">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-purple-400 mb-1 ml-1 font-bold">姓名 / Name</label>
              <input 
                type="text" 
                value={user.name}
                onChange={(e) => setUser({...user, name: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-purple-400 mb-1 ml-1 font-bold">出生日期 / Birthday</label>
              <input 
                type="date" 
                value={user.birthday}
                onChange={(e) => setUser({...user, birthday: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button 
              onClick={getAIReading}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "🔮 正在讀取天象..." : "獲取大師鑑定"}
            </button>
          </div>
        </div>

        {reading && (
          <div className="mt-8 p-8 rounded-3xl bg-slate-900 border border-purple-500/30">
            <h3 className="text-purple-300 font-bold mb-2">大師鑑定結果：</h3>
            <p className="text-slate-200 italic">"{reading}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
