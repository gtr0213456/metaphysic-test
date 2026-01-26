import React, { useState } from 'react';

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [partner, setPartner] = useState({ name: "", birthday: "" });
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'personal' | 'relationship'>('personal');

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const isRel = mode === 'relationship';
      
      const prompt = `你是一位精通全球玄學與能量系統的大師。
      主體：${user.name} (${user.birthday}) ${isRel ? `與 對象：${partner.name} (${partner.birthday})` : ''}。
      請產出 JSON 格式數據，不得有其他文字：
      {
        "personal": {
          "bazi": "八字格局簡述",
          "lifeNum": "生命靈數與核心性格",
          "tzolkin": "卓爾金曆 KIN 與圖騰",
          "humanDesign": "人類圖類型與權威",
          "name81": "姓名81靈動數吉凶"
        },
        ${isRel ? `"relationship": { "syncScore": 85, "harmony": "契合度描述", "advice": "溝通建議" },` : ''}
        "dailyAdvice": "今日能量提醒"
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
    <div className="min-h-screen bg-[#050508] text-slate-200 pb-20">
      {/* 頂部切換 */}
      <div className="flex justify-center gap-4 p-8">
        <button onClick={() => setMode('personal')} className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest transition ${mode === 'personal' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'}`}>個人命盤</button>
        <button onClick={() => setMode('relationship')} className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest transition ${mode === 'relationship' ? 'bg-pink-600 text-white' : 'bg-white/5 text-slate-500'}`}>情侶合盤</button>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-6">
        {/* 輸入區 */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl space-y-4">
          <input type="text" placeholder="您的姓名" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-indigo-500" />
          <input type="date" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-indigo-500" />
          
          {mode === 'relationship' && (
            <div className="pt-4 border-t border-white/10 space-y-4 animate-in fade-in duration-500">
              <input type="text" placeholder="對象姓名" value={partner.name} onChange={(e)=>setPartner({...partner, name:e.target.value})} className="w-full bg-black/40 border border-pink-500/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-pink-500" />
              <input type="date" value={partner.birthday} onChange={(e)=>setPartner({...partner, birthday:e.target.value})} className="w-full bg-black/40 border border-pink-500/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-pink-500" />
            </div>
          )}

          <button onClick={fetchAnalysis} disabled={isLoading} className={`w-full py-5 rounded-2xl font-black tracking-widest transition-all active:scale-95 shadow-xl ${mode === 'personal' ? 'bg-indigo-600' : 'bg-pink-600'}`}>
            {isLoading ? "ALIGNING..." : "START CALCULATION"}
          </button>
        </div>

        {/* 結果展示 */}
        {data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
            {/* 合盤分數卡片 */}
            {data.relationship && (
              <div className="bg-gradient-to-br from-pink-900/20 to-indigo-900/20 border border-pink-500/20 p-8 rounded-[2.5rem] text-center">
                <p className="text-[10px] font-bold tracking-[0.4em] text-pink-400 mb-4 uppercase">Sync Score</p>
                <div className="text-6xl font-black text-white mb-2">{data.relationship.syncScore}%</div>
                <p className="text-sm text-pink-200 opacity-80">{data.relationship.harmony}</p>
              </div>
            )}

            {/* 個人數據卡片 */}
            <div className="grid grid-cols-2 gap-4">
              <MiniCard title="八字格局" value={data.personal.bazi} />
              <MiniCard title="生命靈數" value={data.personal.lifeNum} />
              <MiniCard title="卓爾金曆" value={data.personal.tzolkin} />
              <MiniCard title="人類圖" value={data.personal.humanDesign} />
            </div>

            {/* 建議 */}
            <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
              <p className="text-[10px] font-bold tracking-[0.3em] text-indigo-400 mb-4 uppercase">Daily Guidance</p>
              <p className="italic font-light leading-relaxed">「{data.dailyAdvice}」</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniCard({ title, value }: any) {
  return (
    <div className="bg-white/5 border border-white/5 p-5 rounded-3xl">
      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-2">{title}</p>
      <p className="text-xs font-medium text-slate-200 leading-tight">{value}</p>
    </div>
  );
}
