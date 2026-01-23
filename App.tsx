import React, { useState } from 'react';

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [reading, setReading] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getAIReading = async () => {
    if (!user.name || !user.birthday) return;
    setIsLoading(true);
    setReading(""); 
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // 使用最標準的 v1 版本路徑，這與 v1beta 的模型命名規則不同
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `請根據姓名：${user.name}，生日：${user.birthday}，寫一段 100 字內的繁體中文今日運勢鑑定。` }] }]
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(`${data.error.message} (Code: ${data.error.code})`);
      }

      const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (result) {
        setReading(result);
      } else {
        throw new Error("API 未回傳內容");
      }
    } catch (error: any) {
      console.error("AI 呼叫失敗:", error);
      setReading(`連線錯誤：${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col items-center">
      <div className="max-w-md w-full mt-12">
        <h1 className="text-4xl font-black text-center mb-10">Aetheris OS</h1>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <input type="text" placeholder="姓名" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-purple-500" />
          <input type="date" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-purple-500" />
          <button onClick={getAIReading} disabled={isLoading} className="w-full bg-purple-600 font-bold py-4 rounded-xl active:scale-95 disabled:opacity-50">
            {isLoading ? "🔮 讀取中..." : "開始鑑定"}
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
