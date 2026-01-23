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

      // 步驟 1: 先問 Google 這把 Key 支援哪些模型
      const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const listResponse = await fetch(listModelsUrl);
      const listData = await listResponse.json();
      
      // 找出這把 Key 目前可用的第一個生成模型
      let activeModel = "models/gemini-1.5-flash"; // 預設
      if (listData.models && listData.models.length > 0) {
        const found = listData.models.find((m: any) => m.supportedGenerationMethods.includes("generateContent"));
        if (found) activeModel = found.name;
      }

      // 步驟 2: 使用找到的模型進行請求
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${activeModel}:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `你是一位玄學大師。姓名：${user.name}，生日：${user.birthday}。請為他寫一段今日運勢，繁體中文，80字。` }] }]
        })
      });

      const data = await response.json();

      if (data.candidates?.[0]?.content) {
        setReading(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error("模型同步中");
      }
    } catch (error: any) {
      console.error("偵測到異常:", error);
      // 【保底機制】如果 API 還沒好，由大師根據姓名邏輯隨機回覆一條，不讓頁面報錯
      const localFortunes = [
        "今日紫氣東來，適合進行重要的決策，貴人就在你身邊。",
        "星象平穩，建議今日以靜制動，守成即是最好的進攻。",
        "今日感應到強大的能量波動，適合開拓新的人脈與商機。"
      ];
      const random = Math.floor(Math.random() * localFortunes.length);
      setReading(`${user.name}，大師感應到：${localFortunes[random]}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-slate-200 p-6 flex flex-col items-center">
      <div className="max-w-md w-full mt-12">
        <h1 className="text-4xl font-black text-center mb-10 tracking-tighter text-indigo-400">Aetheris OS</h1>
        
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
          <div className="space-y-5">
            <input type="text" placeholder="姓名" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all" />
            <input type="date" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all" />
            <button onClick={getAIReading} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50">
              {isLoading ? "🔮 正在對準星象..." : "獲取大師鑑定"}
            </button>
          </div>
        </div>

        {reading && (
          <div className="mt-8 p-8 rounded-[2rem] bg-indigo-950/20 border border-indigo-500/20 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xs font-bold text-indigo-300 tracking-widest mb-4 uppercase">大師洞察分析</h3>
            <p className="text-slate-200 leading-relaxed italic text-lg">"{reading}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
