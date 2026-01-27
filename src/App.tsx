import React, { useState } from 'react';
import { MetaphysicalEngine, MetaphysicResult } from './services/metaphysicalEngine';

// --- UI 組件：高質感卡片 ---
function GlassCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.03] border border-white/[0.08] backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-2xl ${className}`}>
      <h3 className="text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase mb-6 italic">{title}</h3>
      {children}
    </div>
  );
}

// --- 小型組件：數據標籤 ---
function DataTag({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">{label}</span>
      <span className="text-sm font-bold text-slate-200">{value}</span>
      {sub && <span className="text-[9px] text-indigo-400/70 mt-1">{sub}</span>}
    </div>
  );
}

// --- 九宮格組件 ---
function LoShuGrid({ grid }: { grid: number[] }) {
  const layout = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  return (
    <div className="grid grid-cols-3 gap-1.5 w-24">
      {layout.map((num) => (
        <div key={num} className={`h-7 w-7 flex items-center justify-center text-[10px] rounded-lg border transition-all duration-700 ${grid && grid[num] > 0 ? 'bg-indigo-500/30 border-indigo-400/50 text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.2)]' : 'border-white/5 text-white/5'}`}>
          {num}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [partner, setPartner] = useState({ name: "", birthday: "" });
  const [data, setData] = useState<MetaphysicResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'personal' | 'relationship'>('personal');

  const handleDateChange = (val: string, target: 'user' | 'partner') => {
    const parts = val.split('-');
    if (parts[0] && parts[0].length > 4) {
      const correctedDate = `${parts[0].slice(0, 4)}-${parts[1] || ''}-${parts[2] || ''}`;
      if (target === 'user') setUser({ ...user, birthday: correctedDate });
      else setPartner({ ...partner, birthday: correctedDate });
    } else {
      if (target === 'user') setUser({ ...user, birthday: val });
      else setPartner({ ...partner, birthday: val });
    }
  };

  const handleStartAnalysis = async () => {
    if (!user.name || !user.birthday) return alert("請填寫您的姓名與生日");
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("API Key 未配置");

    setIsLoading(true);
    try {
      const result = await MetaphysicalEngine.getFullAnalysis(user, mode === 'relationship' ? partner : undefined);
      setData(result);
    } catch (e: any) {
      alert("連結失敗：" + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-slate-200 pb-24 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* 背景光暈裝飾 */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[150px] rounded-full"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-900/10 blur-[150px] rounded-full"></div>

      <header className="relative pt-24 pb-16 text-center">
        <h1 className="text-6xl font-black tracking-[0.5em] text-white italic drop-shadow-2xl">AETHERIS</h1>
        <p className="text-[11px] text-indigo-400 tracking-[0.6em] uppercase mt-6 font-medium opacity-60">Metaphysical Intelligence OS</p>
      </header>

      <div className="max-w-xl mx-auto px-6 relative z-10 space-y-12">
        {/* 輸入與模式切換 */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-[3rem] p-10 backdrop-blur-2xl shadow-2xl">
          <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8">
            <button onClick={() => setMode('personal')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold tracking-widest transition-all ${mode === 'personal' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>個人鑑定</button>
            <button onClick={() => setMode('relationship')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold tracking-widest transition-all ${mode === 'relationship' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-500'}`}>雙人共振</button>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <input type="text" placeholder="您的姓名" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-indigo-500/50 transition-all" />
              <input type="date" value={user.birthday} onChange={(e) => handleDateChange(e.target.value, 'user')} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-indigo-500/50 transition-all text-slate-400" />
            </div>
            {mode === 'relationship' && (
              <div className="pt-6 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-4">
                <input type="text" placeholder="對象姓名" value={partner.name} onChange={(e)=>setPartner({...partner, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-pink-500/50 transition-all" />
                <input type="date" value={partner.birthday} onChange={(e) => handleDateChange(e.target.value, 'partner')} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-pink-500/50 transition-all text-slate-400" />
              </div>
            )}
            <button onClick={handleStartAnalysis} disabled={isLoading} className={`w-full py-5 rounded-2xl font-black tracking-[0.5em] text-[10px] transition-all duration-500 shadow-2xl ${mode === 'personal' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-pink-600 hover:bg-pink-500'} disabled:opacity-20`}>
              {isLoading ? "SYNCHRONIZING..." : "INITIATE ANALYSIS"}
            </button>
          </div>
        </div>

        {/* 分析結果：算命仙板塊 */}
        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* 1. 每日行動指標 */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-pink-500/10 to-transparent border border-white/10 rounded-[3rem] p-10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
              <p className="text-[10px] font-black tracking-[0.5em] text-indigo-400 mb-6 uppercase italic">Daily Insight</p>
              <p className="text-xl leading-relaxed text-slate-200 font-serif italic">"{data.dailyAdvice}"</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {data.luckyIndicators.action.map((a, i) => (
                  <span key={i} className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-bold text-slate-400 border border-white/5">宜：{a}</span>
                ))}
              </div>
            </div>

            {/* 2. 東方命理板塊 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard title="Eastern Metaphysics">
                <div className="space-y-6">
                  <DataTag label="八字四柱" value={data.personal.eastern.bazi.pillars.join(' ')} sub={`喜用神：${data.personal.eastern.bazi.favorable}`} />
                  <DataTag label="姓名學-五格" value={`總格 ${data.personal.eastern.nameAnalysis.fiveGrids.total} - ${data.personal.eastern.nameAnalysis.luck81}`} sub={`三才：${data.personal.eastern.nameAnalysis.threeTalents}`} />
                  <p className="text-[10px] leading-relaxed text-slate-400 italic">{data.personal.eastern.bazi.analysis.substring(0, 80)}...</p>
                </div>
              </GlassCard>

              {/* 3. 西方能量板塊 */}
              <GlassCard title="Western Energy">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <DataTag label="生命靈數" value={data.personal.western.numerology.lifeNum} sub={data.personal.western.numerology.personalYear} />
                    <LoShuGrid grid={data.personal.western.numerology.grid} />
                  </div>
                  <DataTag label="人類圖類型" value={data.personal.western.humanDesign.type} sub={`權威：${data.personal.western.humanDesign.authority}`} />
                  <DataTag label="卓爾金曆" value={data.personal.western.tzolkin.kin} sub={`波符：${data.personal.western.tzolkin.wave}`} />
                </div>
              </GlassCard>
            </div>

            {/* 4. 關係互動板塊 */}
            {mode === 'relationship' && data.relationship && (
              <GlassCard title="Relationship Synergy" className="bg-gradient-to-br from-pink-500/10 to-indigo-500/5">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <span className="text-5xl font-black text-white">{data.relationship.syncScore}%</span>
                    <p className="text-[10px] text-pink-400 font-bold mt-2 uppercase tracking-widest">{data.relationship.harmony}</p>
                  </div>
                  <div className="text-right max-w-[60%]">
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">"{data.relationship.advice}"</p>
                  </div>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                  <p className="text-[9px] font-bold text-indigo-300">溝通頻率建議：{data.relationship.communicationTone}</p>
                  <p className="text-[9px] font-bold text-pink-500">雷區預警：{data.relationship.warning}</p>
                </div>
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
