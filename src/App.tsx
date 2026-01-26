import React, { useState } from 'react';

// --- 元件定義 ---
function MiniCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] hover:bg-white/10 transition-all duration-500 group">
      <div className="text-xl mb-3 opacity-50 group-hover:opacity-100 transition-opacity text-center">{icon}</div>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">{title}</p>
      <p className="text-sm font-bold text-slate-200 text-center">{value}</p>
    </div>
  );
}

// --- 主程式 ---
export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [partner, setPartner] = useState({ name: "", birthday: "" });
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'personal' | 'relationship'>('personal');

  const fetchAnalysis = async () => {
    if (!user.name || !user.birthday) return alert("請完整填寫鑑定對象資料");
    setIsLoading(true);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === "undefined") {
        throw new Error("API Key 未正確載入，請確認 Vercel 環境變數 VITE_GEMINI_API_KEY 已設置");
      }

      const isRel = mode === 'relationship';
      const prompt = `你是一位精通全球玄學與能量系統的大師。
      主體：${user.name} (${user.birthday}) ${isRel ? `與 對象：${partner.name} (${partner.birthday})` : ''}。
      請直接產出 JSON 格式數據，不得有 Markdown 標籤或解釋：
      {
        "personal": {
          "bazi": "格局簡述",
          "lifeNum": "生命靈數核心",
          "tzolkin": "馬雅 KIN/圖騰",
          "humanDesign": "人類圖類型",
          "name81": "姓名吉凶"
        },
        ${isRel ? `"relationship": { "syncScore": 85, "harmony": "契合度描述", "advice": "相處建議" },` : ''}
        "dailyAdvice": "今日能量指引"
      }`;

      // 使用最穩定的 v1beta 以及完整的模型命名規範 [針對 image_f3855b 報錯修正]
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const res = await response.json();
      
      if (res.error) {
        // 如果 flash 還是不給過，這裡會顯示更精確的錯誤原因
        throw new Error(`[Google API Error] ${res.error.message}`);
      }

      let raw = res.candidates[0].content.parts[0].text;
      raw = raw.replace(/```json|```|json|`/gi, "").trim();
      
      setData(JSON.parse(raw));
    } catch (e: any) {
      console.error("能量解碼異常:", e);
      alert("宇宙連線中斷: " + (e.message || "未知能量干擾，請稍後再試"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 pb-20 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* 頂部標題 */}
      <header className="pt-16 pb-10 text-center">
        <h1 className="text-4xl font-black tracking-[0.4em] text-white italic drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">AETHERIS</h1>
        <p className="text-[10px] text-indigo-400 tracking-[0.5em] uppercase mt-3 font-bold opacity-70">Metaphysical Life OS</p>
      </header>

      {/* 模式切換器 */}
      <div className="flex justify-center gap-4 mb-10">
        <button 
          onClick={() => { setMode('personal'); setData(null); }} 
          className={`px-10 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] transition-all duration-500 ${mode === 'personal' ? 'bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.4)]' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
        >
          個人鑑定
        </button>
        <button 
          onClick={() => { setMode('relationship'); setData(null); }} 
          className={`px-10 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] transition-all duration-500 ${mode === 'relationship' ? 'bg-pink-600 text-white shadow-[0_10px_30px_rgba(219,39,119,0.4)]' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
        >
          雙人共振
        </button>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-10">
        {/* 輸入介面 */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 backdrop-blur-3xl shadow-2xl space-y-6 relative">
          <div className="space-y-4">
            <label className="text-[9px] font-bold text-indigo-400/60 tracking-[0.2em] uppercase ml-1">Alpha Subject (You)</label>
            <input 
              type="text" 
              placeholder="輸入姓名" 
              value={user.name} 
              onChange={(e)=>setUser({...user, name:e.target.value})} 
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500/50 transition-all outline-none" 
            />
            <input 
              type="date" 
              value={user.birthday} 
              onChange={(e)=>setUser({...user, birthday:e.target.value})} 
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500/50 transition-all outline-none" 
            />
          </div>
          
          {mode === 'relationship' && (
            <div className="pt-6 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <label className="text-[9px] font-bold text-pink-400/60 tracking-[0.2em] uppercase ml-1">Beta Subject (Partner)</label>
              <input 
                type="text" 
                placeholder="輸入對象姓名" 
                value={partner.name} 
                onChange={(e)=>setPartner({...partner, name:e.target.value})} 
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-pink-500/50 transition-all outline-none" 
              />
              <input 
                type="date" 
                value={partner.birthday} 
                onChange={(e)=>setPartner({...partner, birthday:e.target.value})} 
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-pink-500/50 transition-all outline-none" 
              />
            </div>
          )}

          <button 
            onClick={fetchAnalysis} 
            disabled={isLoading} 
            className={`w-full py-5 rounded-2xl font-black tracking-[0.4em] text-xs transition-all active:scale-[0.98] ${mode === 'personal' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-pink-600 hover:bg-pink-500'} disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {isLoading ? "CALCULATING..." : "START SCAN"}
          </button>
        </div>

        {/* 結果面板 */}
        {data && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-1000">
            {/* 馬雅圖騰 */}
            <div className="bg-gradient-to-b from-indigo-500/20 to-transparent border border-white/10 rounded-[3rem] p-10 text-center">
                 <p className="text-[10px] font-bold tracking-[0.5em] text-indigo-400 mb-2 uppercase">Mayan Oracle</p>
                 <h2 className="text-2xl font-black text-white italic">{data.personal.tzolkin}</h2>
            </div>

            {/* 情侶契合度 */}
            {data.relationship && (
              <div className="bg-[#0a0a10] border border-pink-500/20 p-10 rounded-[3rem] flex flex-col items-center">
                <div className="relative flex items-center justify-center w-52 h-52 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="104" cy="104" r="90" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                    <circle cx="104" cy="104" r="90" stroke="currentColor" strokeWidth="6" fill="transparent" 
                      strokeDasharray={565} strokeDashoffset={565 - (565 * data.relationship.syncScore) / 100}
                      strokeLinecap="round" className="text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all duration-1000" />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-6xl font-black text-white italic">{data.relationship.syncScore}%</div>
                    <div className="text-[9px] font-bold tracking-[0.3em] text-pink-400/60 uppercase">Sync Level</div>
                  </div>
                </div>
                <div className="px-8 py-2.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold text-center">
                   {data.relationship.harmony}
                </div>
              </div>
            )}

            {/* 四格鑑定資料 */}
            <div className="grid grid-cols-2 gap-4">
              <MiniCard title="八字格局" value={data.personal.bazi} icon="☯️" />
              <MiniCard title="主命數" value={data.personal.lifeNum} icon="🔢" />
              <MiniCard title="人類圖類型" value={data.personal.humanDesign} icon="🧬" />
              <MiniCard title="姓名吉凶" value={data.personal.name81} icon="✨" />
            </div>

            {/* 指引文字 */}
            <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] text-center">
              <p className="text-[10px] font-bold tracking-[0.4em] text-indigo-400 mb-5 uppercase">Aetheris Oracle</p>
              <p className="text-lg font-light leading-relaxed text-slate-200 italic px-4">
                「 {data.dailyAdvice} 」
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
