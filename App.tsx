import React, { useState, useEffect } from 'react';

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [reading, setReading] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayText, setDisplayText] = useState("");

  // 打字機效果：讓文字呈現更有占卜感
  useEffect(() => {
    if (reading) {
      setDisplayText("");
      let i = 0;
      const interval = setInterval(() => {
        setDisplayText((prev) => prev + reading.charAt(i));
        i++;
        if (i >= reading.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [reading]);

  const getAIReading = async () => {
    if (!user.name || !user.birthday) return;
    setIsLoading(true);
    setReading("");
    setDisplayText("");
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // 1. 自動偵測這把 Key 目前支援的可用模型 (避開 404 問題)
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const listRes = await fetch(listUrl);
      const listData = await listRes.json();
      
      const activeModel = listData.models?.find((m: any) => 
        m.supportedGenerationMethods.includes("generateContent")
      )?.name || "models/gemini-1.5-flash";

      // 2. 發起運勢請求
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${activeModel}:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `你是一位精通紫微與星象的玄學大師。姓名：${user.name}，生日：${user.birthday}。請為他撰寫今日鑑定。包含：總體運勢、事業財運、情感叮嚀。語氣神祕且溫暖，使用繁體中文，約 150 字，分段呈現。` }] }]
        })
      });

      const data = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (result) {
        setReading(result);
      } else {
        throw new Error(data.error?.message || "星象模糊");
      }
    } catch (error: any) {
      console.error("系統異常:", error);
      setReading(`${user.name}居士，今日星象顯示你氣場平穩。建議今日多行善念，凡事隨緣，必有後福。 (系統提示：${error.message})`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030308] text-slate-200 p-6 flex flex-col items-center selection:bg-indigo-500/30">
      <div className="max-w-md w-full mt-16 space-y-10">
        <header className="text-center space-y-3">
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-indigo-200 to-indigo-500">
            Aetheris OS
          </h1>
          <p className="text-[10px] tracking-[0.5em] text-indigo-400/50 uppercase font-bold">Metaphysic Intelligence</p>
        </header>
        
        <main className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] text-indigo-300 font-bold ml-1 uppercase tracking-widest opacity-60">Subject Identity</label>
              <input type="text" placeholder="輸入姓名" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mt-1 outline-none focus:border-indigo-500 transition-all text-white" />
            </div>
            <div>
              <label className="text-[10px] text-indigo-300 font-bold ml-1 uppercase tracking-widest opacity-60">Birth Sequence</label>
              <input type="date" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mt-1 outline-none focus:border-indigo-500 transition-all text-white" />
            </div>
            <button onClick={getAIReading} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-30 shadow-[0_0_30px_rgba(79,70,229,0.2)]">
              {isLoading ? "CALCULATING..." : "獲取大師鑑定"}
            </button>
          </div>
        </main>

        {displayText && (
          <section className="p-10 rounded-[2.5rem] bg-indigo-950/10 border border-white/5 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
              <h3 className="text-[10px] font-black text-indigo-300 tracking-[0.4em] uppercase">Insight Analysis</h3>
            </div>
            <div className="text-slate-300 leading-relaxed text-lg font-light italic whitespace-pre-wrap">
              {displayText}
            </div>
            <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center opacity-20">
              <span className="text-[8px] tracking-[0.2em] uppercase font-bold">Aetheris Core 1.5.2</span>
              <span className="text-[8px] font-mono tracking-tighter">STATUS: STABLE</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
