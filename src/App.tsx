import React, { useState } from 'react';

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [partner, setPartner] = useState({ name: "", birthday: "" });
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'personal' | 'relationship'>('personal');

  const fetchAnalysis = async () => {
    if (!user.name || !user.birthday) return alert("請填寫完整資訊");
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const isRel = mode === 'relationship';
      
      const prompt = `你是一位精通全球玄學與能量系統的大師。
      主體：${user.name} (${user.birthday}) ${isRel ? `與 對象：${partner.name} (${partner.birthday})` : ''}。
      請產出 JSON 格式數據，不得有其他文字：
      {
        "personal": {
          "bazi": "八字格局(4字)",
          "lifeNum": "主命數",
          "tzolkin": "KIN與圖騰名稱",
          "humanDesign": "類型/權威",
          "name81": "總格與吉凶"
        },
        ${isRel ? `"relationship": { "syncScore": 85, "harmony": "共振狀態", "advice": "建議" },` : ''}
        "dailyAdvice": "一句話能量引導"
      }`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const res = await response.json();
      const raw = res.candidates[0].content.parts[0].text.replace(/```json|```/g, "");
      setData(JSON.parse(raw));
    } catch (e) {
      console.error("能量解碼異常");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 pb-20 font-sans selection:bg-indigo-500/30">
      {/* 頂部標題 */}
      <header className="pt-12 pb-6 text-center">
        <h1 className="text-3xl font-black tracking-[0.4em] text-white">AETHERIS</h1>
        <p className="text-[10px] text-indigo-400 tracking-[0.5em] uppercase mt-2">Metaphysical Life OS</p>
      </header>

      {/* 模式切換 */}
      <div className="flex justify-center gap-3 mb-8">
        <button onClick={() => setMode('personal')} className={`px-8 py-2.5 rounded-full text-[10px] font-bold tracking-widest transition-all duration-500 ${mode === 'personal' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-white/5 text-slate-500'}`}>個人命盤</button>
        <button onClick={() => setMode('relationship')} className={`px-8 py-2.5 rounded-full text-[10px] font-bold tracking-widest transition-all duration-500 ${mode === 'relationship' ? 'bg-pink-600 text-white shadow-[0_0_20px_rgba(219,39,119,0.4)]' : 'bg-white/5 text-slate-500'}`}>情侶同步</button>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-8">
        {/* 輸入卡片 */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-2xl shadow-2xl space-y-5">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-indigo-400/60 tracking-widest uppercase ml-1">Subject Alpha</p>
            <input type="text" placeholder="SUBJECT NAME" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500/50 transition-all outline-none" />
            <input type="date" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500/50 transition-all outline-none" />
          </div>
          
          {mode === 'relationship' && (
            <div className="pt-5 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-700">
              <p className="text-[10px] font-bold text-pink-400/60 tracking-widest uppercase ml-1">Subject Beta</p>
              <input type="text" placeholder="PARTNER NAME" value={partner.name} onChange={(e)=>setPartner({...partner, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-pink-500/50 transition-all outline-none" />
              <input type="date" value={partner.birthday} onChange={(e)=>setPartner({...partner, birthday:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-pink-500/50 transition-all outline-none" />
            </div>
          )}

          <button onClick={fetchAnalysis} disabled={isLoading} className={`w-full py-5 rounded-2xl font-black tracking-[0.3em] text-xs transition-all active:scale-95 ${mode === 'personal' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20' : 'bg-pink-600 hover:bg-pink-500 shadow-pink-900/20'} shadow-2xl`}>
            {isLoading ? "CALCULATING..." : "INITIATE ANALYSIS"}
          </button>
        </div>

        {/* 結果展示區 */}
        {data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* 1. 核心能量標籤 - 模仿 image_cdc46c */}
            <div className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-white/10 rounded-[3rem] p-10 text-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>
               <div className="relative z-10">
                 <div className="w-20 h-20 mx-auto mb-6 rounded-full border border-indigo-500/30 flex items-center justify-center bg-indigo-500/5 shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                    <span className="text-3xl">☀️</span>
                 </div>
                 <p className="text-[10px] font-bold tracking-[0.5em] text-indigo-400 mb-2 uppercase">Mayan Oracle</p>
                 <h2 className="text-2xl font-black tracking-tight text-white mb-2 italic">{data.personal.tzolkin}</h2>
               </div>
            </div>

            {/* 2. 同步分數圓環 - 模仿 image_cdc12c */}
            {data.relationship && (
              <div className="bg-[#0a0a10] border border-pink-500/20 p-10 rounded-[3rem] flex flex-col items-center shadow-2xl">
                <div className="relative flex items-center justify-center w-48 h-48 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                    <circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={534} strokeDashoffset={534 - (534 * data.relationship.syncScore) / 100}
                      strokeLinecap="round" className="text-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,0.6)] transition-all duration-[2000ms]" />
                  </svg>
                  <div className="absolute text-center mt-2">
                    <div className="text-5xl font-black text-white">{data.relationship.syncScore}%</div>
                    <div className="text-[8px] font-bold tracking-[0.3em] text-pink-400/60 uppercase">Resonance</div>
                  </div>
                </div>
                <div className="px-6 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold">
                  ● {data.relationship.harmony}
                </div>
              </div>
            )}

            {/* 3. 多維度數據格 - 模仿 image_cdc452 */}
            <div className="grid grid-cols-2 gap-4">
              <MiniCard title="八字格局" value={data.personal.bazi} icon="☯️" />
              <MiniCard title="生命靈數" value={data.personal.lifeNum} icon="🔢" />
              <MiniCard title="人類圖" value={data.personal.humanDesign} icon="🧬" />
              <MiniCard title="姓名吉凶" value={data.personal.name81} icon="✨" />
            </div>

            {/* 4. 今日引導 */}
            <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] relative">
              <p className="text-[10px] font-bold tracking-[0.4em] text-indigo-400 mb-4 uppercase">Aetheris Guidance</p>
              <p className="text-base font-light leading-relaxed text-slate-300 italic">「 {data.dailyAdvice} 」</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniCard({ title, value, icon }: any) {
  return (
    <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] hover:bg-white/10 transition-all duration-500 group">
      <div className="text-xl mb-3 opacity-50 group-hover:opacity-100 transition-opacity">{icon}</div>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
}
