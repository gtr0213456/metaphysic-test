import React, { useState } from 'react';

// --- 小型元件：鑑定卡片 ---
function MiniCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] hover:bg-white/10 transition-all duration-500 group">
      <div className="text-xl mb-3 opacity-50 group-hover:opacity-100 transition-opacity text-center">{icon}</div>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">{title}</p>
      <p className="text-sm font-bold text-slate-200 text-center">{value}</p>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [partner, setPartner] = useState({ name: "", birthday: "" });
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'personal' | 'relationship'>('personal');

  const fetchAnalysis = async () => {
    if (!user.name || !user.birthday) return alert("請填寫姓名與生日");
    
    // --- 1. 環境變數檢查機制 ---
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined") {
      alert("❌ 錯誤：程式讀取不到 API Key。\n請確認 Vercel 變數名稱為 VITE_GEMINI_API_KEY (全大寫) 並已執行 Redeploy。");
      return;
    }

    setIsLoading(true);
    
    try {
      const isRel = mode === 'relationship';
      const prompt = `你是一位精通玄學能量的大師。請針對以下主體進行鑑定：
      主體：${user.name} (${user.birthday}) ${isRel ? `與對象：${partner.name} (${partner.birthday})` : ''}。
      請直接產出 JSON 格式數據，不得包含 Markdown 標籤：
      {
        "personal": { "bazi": "格局簡述", "lifeNum": "主命數", "tzolkin": "馬雅 KIN", "humanDesign": "類型", "name81": "姓名吉凶" },
        ${isRel ? `"relationship": { "syncScore": 85, "harmony": "共振描述", "advice": "建議" },` : ''}
        "dailyAdvice": "今日能量引導"
      }`;

      // --- 2. 自動降級路徑組合 (解決 404 問題) ---
      const endpoints = [
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
      ];

      let successData = null;
      let lastErrorMessage = "";

      for (const url of endpoints) {
        try {
          console.log(`嘗試連線路徑: ${url.split('?')[0]}`);
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });

          const res = await response.json();
          if (!res.error && res.candidates) {
            successData = res;
            break; 
          } else {
            lastErrorMessage = res.error?.message || "節點無回應";
          }
        } catch (e) {
          lastErrorMessage = "網路連線異常";
        }
      }

      if (!successData) {
        throw new Error(`所有連線路徑均失效。最後錯誤：${lastErrorMessage}`);
      }

      // --- 3. 數據解析 ---
      let raw = successData.candidates[0].content.parts[0].text;
      raw = raw.replace(/```json|```|json|`/gi, "").trim();
      setData(JSON.parse(raw));

    } catch (e: any) {
      console.error("Analysis Error:", e);
      alert("連線異常: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 pb-20 font-sans selection:bg-indigo-500/30">
      <header className="pt-16 pb-10 text-center">
        <h1 className="text-4xl font-black tracking-[0.4em] text-white italic">AETHERIS</h1>
        <p className="text-[10px] text-indigo-400 tracking-[0.5em] uppercase mt-3 font-bold opacity-60">Metaphysical Life OS</p>
      </header>

      <div className="flex justify-center gap-4 mb-10">
        <button onClick={() => { setMode('personal'); setData(null); }} className={`px-10 py-3 rounded-full text-[10px] font-bold tracking-widest transition-all duration-500 ${mode === 'personal' ? 'bg-indigo-600 shadow-[0_10px_30px_rgba(79,70,229,0.3)]' : 'bg-white/5 text-slate-500'}`}>個人鑑定</button>
        <button onClick={() => { setMode('relationship'); setData(null); }} className={`px-10 py-3 rounded-full text-[10px] font-bold tracking-widest transition-all duration-500 ${mode === 'relationship' ? 'bg-pink-600 shadow-[0_10px_30px_rgba(219,39,119,0.3)]' : 'bg-white/5 text-slate-500'}`}>雙人共振</button>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-10">
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 backdrop-blur-3xl shadow-2xl space-y-6">
          <div className="space-y-4">
            <p className="text-[9px] font-bold text-indigo-400/60 tracking-widest uppercase ml-1">Alpha Subject</p>
            <input type="text" placeholder="姓名" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500/50 transition-all outline-none" />
            <input type="date" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500/50 transition-all outline-none" />
          </div>
          
          {mode === 'relationship' && (
            <div className="pt-6 border-t border-white/5 space-y-4 animate-in fade-in duration-700">
              <p className="text-[9px] font-bold text-pink-400/60 tracking-widest uppercase ml-1">Beta Subject</p>
              <input type="text" placeholder="對象姓名" value={partner.name} onChange={(e)=>setPartner({...partner, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-pink-500/50 transition-all outline-none" />
              <input type="date" value={partner.birthday} onChange={(e)=>setPartner({...partner, birthday:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-pink-500/50 transition-all outline-none" />
            </div>
          )}

          <button onClick={fetchAnalysis} disabled={isLoading} className={`w-full py-5 rounded-2xl font-black tracking-[0.4em] text-xs transition-all active:scale-95 ${mode === 'personal' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-pink-600 hover:bg-pink-500'} shadow-2xl disabled:opacity-30`}>
            {isLoading ? "CALCULATING..." : "INITIATE ANALYSIS"}
          </button>
        </div>

        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="bg-gradient-to-b from-indigo-500/20 to-transparent border border-white/10 rounded-[3rem] p-10 text-center">
                 <p className="text-[10px] font-bold tracking-[0.5em] text-indigo-400 mb-2 uppercase">Mayan Sign</p>
                 <h2 className="text-2xl font-black text-white italic text-center">{data.personal.tzolkin}</h2>
            </div>

            {data.relationship && (
              <div className="bg-[#0a0a10] border border-pink-500/20 p-10 rounded-[3rem] flex flex-col items-center">
                <div className="relative flex items-center justify-center w-52 h-52 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="104" cy="104" r="92" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                    <circle cx="104" cy="104" r="92" stroke="currentColor" strokeWidth="6" fill="transparent" 
                      strokeDasharray={578} strokeDashoffset={578 - (578 * data.relationship.syncScore) / 100}
                      strokeLinecap="round" className="text-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,0.5)] transition-all duration-1000" />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-6xl font-black text-white italic">{data.relationship.syncScore}%</div>
                  </div>
                </div>
                <p className="text-pink-400 text-[11px] font-bold tracking-widest text-center">{data.relationship.harmony}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <MiniCard title="八字格局" value={data.personal.bazi} icon="☯️" />
              <MiniCard title="生命靈數" value={data.personal.lifeNum} icon="🔢" />
              <MiniCard title="人類圖" value={data.personal.humanDesign} icon="🧬" />
              <MiniCard title="姓名鑑定" value={data.personal.name81} icon="✨" />
            </div>

            <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] text-center">
              <p className="text-[10px] font-bold tracking-[0.4em] text-indigo-400 mb-5 uppercase">Oracle Guidance</p>
              <p className="text-lg font-light leading-relaxed text-slate-300 italic">「 {data.dailyAdvice} 」</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
