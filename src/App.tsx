import React, { useState } from 'react';

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [partner, setPartner] = useState({ name: "", birthday: "" });
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'personal' | 'relationship'>('personal');

  const fetchAnalysis = async () => {
    if (!user.name || !user.birthday) return alert("請完整輸入姓名與生日");
    setIsLoading(true);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === "undefined") {
        throw new Error("API Key 未設定，請檢查 Vercel 環境變數");
      }

      const isRel = mode === 'relationship';
      const prompt = `你是一位精通全球玄學與能量系統的大師。
      主體：${user.name} (${user.birthday}) ${isRel ? `與 對象：${partner.name} (${partner.birthday})` : ''}。
      請直接產出 JSON 格式數據，不得有其他文字或 Markdown 標記：
      {
        "personal": {
          "bazi": "格局名稱",
          "lifeNum": "主命數",
          "tzolkin": "KIN與圖騰",
          "humanDesign": "類型/權威",
          "name81": "總格吉凶"
        },
        ${isRel ? `"relationship": { "syncScore": 85, "harmony": "共振描述", "advice": "建議" },` : ''}
        "dailyAdvice": "今日能量指引"
      }`;

      // 使用經測試最穩定的 v1beta 端點 [針對 image_f3ee75 報錯修正]
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const res = await response.json();
      
      if (res.error) {
        throw new Error(res.error.message);
      }

      let raw = res.candidates[0].content.parts[0].text;
      // 強制過濾所有 Markdown 格式代碼塊
      raw = raw.replace(/```json|```|json|`/gi, "").trim();
      
      setData(JSON.parse(raw));
    } catch (e: any) {
      console.error("能量解碼異常:", e);
      alert("連線異常: " + (e.message || "未知干擾"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 pb-20 font-sans selection:bg-indigo-500/30">
      <header className="pt-12 pb-6 text-center">
        <h1 className="text-3xl font-black tracking-[0.4em] text-white italic">AETHERIS</h1>
        <p className="text-[10px] text-indigo-400 tracking-[0.5em] uppercase mt-2 font-bold">Metaphysical Life OS</p>
      </header>

      <div className="flex justify-center gap-3 mb-8">
        <button onClick={() => { setMode('personal'); setData(null); }} className={`px-8 py-2.5 rounded-full text-[10px] font-bold tracking-widest transition-all ${mode === 'personal' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>個人命盤</button>
        <button onClick={() => { setMode('relationship'); setData(null); }} className={`px-8 py-2.5 rounded-full text-[10px] font-bold tracking-widest transition-all ${mode === 'relationship' ? 'bg-pink-600 text-white shadow-[0_0_20px_rgba(219,39,119,0.4)]' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>情侶同步</button>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-8">
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-2xl shadow-2xl space-y-5">
          <input type="text" placeholder="SUBJECT NAME" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500/50 outline-none" />
          <input type="date" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500/50 outline-none" />
          
          {mode === 'relationship' && (
            <div className="pt-5 border-t border-white/5 space-y-4 animate-in fade-in duration-700">
              <input type="text" placeholder="PARTNER NAME" value={partner.name} onChange={(e)=>setPartner({...partner, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-pink-500/50 outline-none" />
              <input type="date" value={partner.birthday} onChange={(e)=>setPartner({...partner, birthday:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-pink-500/50 outline-none" />
            </div>
          )}

          <button onClick={fetchAnalysis} disabled={isLoading} className={`w-full py-5 rounded-2xl font-black tracking-[0.3em] text-xs transition-all ${mode === 'personal' ? 'bg-indigo-600' : 'bg-pink-600'} disabled:opacity-50`}>
            {isLoading ? "CALCULATING..." : "INITIATE ANALYSIS"}
          </button>
        </div>

        {data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
            <div className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-white/10 rounded-[3rem] p-10 text-center">
                 <p className="text-[10px] font-bold tracking-[0.5em] text-indigo-400 mb-2 uppercase text-center">Mayan Oracle</p>
                 <h2 className="text-2xl font-black text-white italic text-center">{data.personal.tzolkin}</h2>
            </div>

            {data.relationship && (
              <div className="bg-[#0a0a10] border border-pink-500/20 p-10 rounded-[3rem] flex flex-col items-center">
                <div className="relative flex items-center justify-center w-48 h-48 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                    <circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={534} strokeDashoffset={534 - (534 * data.relationship.syncScore) / 100}
                      strokeLinecap="round" className="text-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,0.6)]" />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-5xl font-black text-white">{data.relationship.syncScore}%</div>
                  </div>
                </div>
                <div className="px-6 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold text-center">
                  ● {data.relationship.harmony}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <MiniCard title="八字格局" value={data.personal.bazi} icon="☯️" />
              <MiniCard title="生命靈數" value={data.personal.lifeNum} icon="🔢" />
              <MiniCard title="人類圖" value={data.personal.humanDesign} icon="🧬" />
              <MiniCard title="姓名吉凶" value={data.personal.name81} icon="✨" />
            </div>

            <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem]">
              <p className="text-[10px] font-bold tracking-[0.4em] text-indigo-400 mb-4 uppercase text-center">Aetheris Guidance</p>
              <p className="text-base font-light leading-relaxed text-slate-300 italic text-center text-balance leading-relaxed">「 {data.dailyAdvice} 」</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniCard({ title, value, icon }: any) {
  return (
    <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] hover:bg-white/10 transition-colors">
      <div className="text-xl mb-3 opacity-50">{icon}</div>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">{title}</p>
      <p className="text-sm font-bold text-slate-200 text-center">{value}</p>
    </div>
  );
}
