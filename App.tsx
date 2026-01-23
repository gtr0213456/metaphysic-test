import React, { useState } from 'react';

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [reading, setReading] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getAIReading = async () => {
    if (!user.name || !user.birthday) {
      alert("請輸入姓名與生日");
      return;
    }

    setIsLoading(true);
    setReading(""); 
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // 【終極校正】使用 v1beta 搭配 gemini-1.5-flash-latest
      // 這是目前最能解決 404 問題的組合
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `你是一位精通玄學的大師。請為姓名：${user.name}，生日：${user.birthday} 的人鑑定今日運勢。請用繁體中文回答，約 100 字。` 
            }] 
          }]
        })
      });

      const data = await response.json();

      // 如果 API 報錯，直接捕捉
      if (data.error) {
        throw new Error(`${data.error.message} (Code: ${data.error.code}, Status: ${data.error.status})`);
      }

      if (data.candidates && data.candidates[0].content) {
        setReading(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error("API 回傳結構異常，請檢查 API Key 權限。");
      }
    } catch (error: any) {
      console.error("AI 呼叫失敗:", error);
      // 把錯誤訊息直接呈現在畫面上，省去開 Console 的麻煩
      setReading(`系統報錯：${error.message}`);
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

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="姓名"
              value={user.name}
              onChange={(e) => setUser({...user, name: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input 
              type="date" 
              value={user.birthday}
              onChange={(e) => setUser({...user, birthday: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button 
              onClick={getAIReading}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "🔮 正在召喚能量..." : "開始鑑定"}
            </button>
          </div>
        </div>

        {reading && (
          <div className="mt-8 p-8 rounded-3xl bg-slate-900 border border-purple-500/30">
            <p className="text-slate-200 leading-relaxed italic">
              "{reading}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
