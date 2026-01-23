import React, { useState, useEffect } from 'react';

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [reading, setReading] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayText, setDisplayText] = useState("");

  // 打字機效果：讓文字更有神祕感
  useEffect(() => {
    if (reading) {
      setDisplayText("");
      let i = 0;
      const timer = setInterval(() => {
        setDisplayText((prev) => prev + reading.charAt(i));
        i++;
        if (i >= reading.length) clearInterval(timer);
      }, 50).default; 
      return () => clearInterval(timer);
    }
  }, [reading]);

  const getAIReading = async () => {
    if (!user.name || !user.birthday) return;
    setIsLoading(true);
    setReading("");
    setDisplayText("");
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // 使用已經證實可用的 v1beta 與動態模型偵測
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const listRes = await fetch(listUrl);
      const listData = await listRes.json();
      
      const activeModel = listData.models?.find((m: any) => 
        m.supportedGenerationMethods.includes("generateContent")
      )?.name || "models/gemini-1.5-flash";

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${activeModel}:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `你是一位精通命理的玄學大師。姓名：${user.name}，生日：${user.birthday}。請為他撰寫一段今日運勢鑑定，內容需包含事業、財運與情感，語氣神祕優雅，繁體中文，約 120 字。` }] }]
        })
      });

      const data = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (result) {
        setReading(result);
      } else {
        throw new Error("星象模糊，請重試");
      }
    } catch (error) {
      setReading(`${user.name}，今日星象顯示你氣場穩健，宜守不宜攻，凡事順其自然即可。`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02020a] text-slate-200 p-6 flex flex-col items-center font-sans">
      <div className="max-w-md w-full mt-16 space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-indigo-300 to-indigo-600">
            Aetheris OS
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-indigo-500/60 uppercase font-bold">Metaphysic Intelligence System</p>
        </header>
        
        <main className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
          <div className="space-y-6">
            <div className="group">
              <label className="text-[10px] text-indigo-400/80 font-bold ml-1 uppercase tracking-widest">Subject Name</label>
              <input type="text" placeholder="輸入姓名" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mt-1 outline-none focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-600" />
            </div>
            <div className="group">
              <label className="text-[10px] text-indigo-400/80 font-bold ml-1 uppercase tracking-widest">Birth Sequence</label>
              <input type="date" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mt-1 outline-none focus:border-indigo-500/50 transition-all text-white" />
            </div>
            <button onClick={getAIReading} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-30 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              {isLoading ? "ALIGNING STARS..." : "START CALCULATION"}
            </button>
          </div>
        </main>

        {displayText && (
          <section className="p-10 rounded-[2.5rem] bg-gradient-to-b from-slate-900/60 to-transparent border-t border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
              <h3 className="text-[10px] font-black text-indigo-400 tracking-[0.4em] uppercase">Insight Analysis</h3>
            </div>
            <p className="text-slate-300 leading-relaxed text-lg font-light italic">
              「{displayText}」
            </p>
            <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center opacity-30">
              <span className="text-[8px] tracking-widest uppercase">Sync: Stable</span>
              <span className="text-[8px] font-mono">CORE V.1.5.0</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
