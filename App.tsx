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
      
      // 【終極校正】改用 v1 穩定路徑，並使用相容性最高的 gemini-pro 型號
      // 這個路徑在 Google 伺服器端擁有最高的優先權與穩定度
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `你是一位玄學大師。請為姓名：${user.name}，生日：${user.birthday} 的人鑑定今日運勢。語氣神祕，用繁體中文回答，約 100 字。` 
            }] 
          }]
        })
      });

      const data = await response.json();

      // 如果 API 報錯，這裡會捕捉到
      if (data.error) {
        throw new Error(`${data.error.message} (代碼: ${data.error.code})`);
      }

      if (data.candidates && data.candidates[0].content) {
        setReading(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error("模型無回應，請稍後再試。");
      }
    } catch (error: any) {
      console.error("AI 呼叫失敗:", error);
      // 這裡會顯示最真實的錯誤原因
      setReading(`連線失敗：${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col items-center">
      <div className="max-w-md w-full mt-12">
        <h1 className="text-4xl font-black text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
          Aetheris OS
        </h1>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="您的姓名"
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
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "🔮 正在召喚能量..." : "獲取大師鑑定"}
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
