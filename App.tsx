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
    
    // 優先順序：Gemini 1.5 Flash -> Gemini 1.5 Pro -> Gemini 1.0 Pro
    const models = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro"
    ];

    let lastError = "";

    for (const model of models) {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        // 使用 v1beta 介面，這是目前相容性最高的
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `你是一位玄學大師。請為姓名：${user.name}，生日：${user.birthday} 的人鑑定運勢，用繁體中文回答約 100 字。` }] }]
          })
        });

        const data = await response.json();

        if (data.error) {
          lastError = data.error.message;
          continue; // 嘗試下一個型號
        }

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          setReading(data.candidates[0].content.parts[0].text);
          setIsLoading(false);
          return; // 成功回傳，結束函數
        }
      } catch (e: any) {
        lastError = e.message;
      }
    }

    setReading(`連線失敗。最後報錯：${lastError}。請檢查 Vercel 橘色警告是否已消除。`);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col items-center">
      <div className="max-w-md w-full mt-12">
        <h1 className="text-4xl font-black text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">Aetheris OS</h1>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl mt-8">
          <input type="text" placeholder="姓名" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-4 text-white outline-none focus:ring-2 focus:ring-purple-500" />
          <input type="date" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-4 text-white outline-none focus:ring-2 focus:ring-purple-500" />
          <button onClick={getAIReading} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition active:scale-95 disabled:opacity-50">
            {isLoading ? "🔮 正在讀取天象..." : "開始鑑定"}
          </button>
        </div>
        {reading && (
          <div className="mt-8 p-6 rounded-3xl bg-slate-900 border border-purple-500/30 italic">
            "{reading}"
          </div>
        )}
      </div>
    </div>
  );
}
