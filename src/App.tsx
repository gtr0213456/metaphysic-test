import React, { useState } from 'react';
import { MetaphysicalEngine, MetaphysicResult } from './services/metaphysicalEngine';

function DataTag({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] uppercase tracking-[0.2em] text-indigo-400/60 font-bold mb-1">{label}</span>
      <span className="text-sm font-bold text-slate-200">{value || '---'}</span>
      {sub && <span className="text-[10px] text-slate-500 mt-1">{sub}</span>}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [partner, setPartner] = useState({ name: "", birthday: "" });
  const [data, setData] = useState<MetaphysicResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'personal' | 'relationship'>('personal');

  const handleStartAnalysis = async () => {
    if (!user.name || !user.birthday) return alert("請輸入姓名與生辰");
    setIsLoading(true);
    try {
      const apiUser = { ...user, birthday: user.birthday.replace(/\//g, '-') };
      const apiPartner = mode === 'relationship' ? { ...partner, birthday: partner.birthday.replace(/\//g, '-') } : undefined;
      const result = await MetaphysicalEngine.getFullAnalysis(apiUser, apiPartner);
      setData(result);
    } catch (e: any) {
      alert("連線失敗：" + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white p-6 pb-24 font-sans selection:bg-indigo-500/30">
      {/* 背景裝飾 */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(2,2,5,1)_100%)] -z-10"></div>
      
      <header className="pt-20 pb-12 text-center">
        <h1 className="text-6xl font-black tracking-[0.6em] italic text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white">AETHERIS</h1>
        <p className="text-[10px] text-indigo-500 tracking-[0.8em] mt-6 uppercase opacity-70">Metaphysical Intelligence OS</p>
      </header>

      <main className="max-w-xl mx-auto space-y-10">
        {/* 輸入介面 */}
        <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl">
          <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8">
            <button onClick={() => setMode('personal')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold tracking-widest transition-all ${mode === 'personal' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>個人鑑定</button>
            <button onClick={() => setMode('relationship')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold tracking-widest transition-all ${mode === 'relationship' ? 'bg-pink-600 text-white' : 'text-slate-500'}`}>雙人共振</button>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="姓名" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all" />
            <input type="text" placeholder="生日 (1980/10/29)" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all" />
            
            {mode === 'relationship' && (
              <div className="pt-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-4">
                <input type="text" placeholder="對象姓名" value={partner.name} onChange={(e)=>setPartner({...partner, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-pink-500 transition-all" />
                <input type="text" placeholder="對象生日" value={partner.birthday} onChange={(e)=>setPartner({...partner, birthday:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-pink-500 transition-all" />
              </div>
            )}
            
            <button onClick={handleStartAnalysis} disabled={isLoading} className={`w-full py-5 rounded-2xl font-black tracking-[0.5em] text-[11px] transition-all shadow-2xl ${mode === 'personal' ? 'bg-indigo-600' : 'bg-pink-600'} disabled:opacity-20`}>
              {isLoading ? "SYNCHRONIZING..." : "INITIATE ANALYSIS"}
            </button>
          </div>
        </div>

        {/* 結果展示 */}
        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            
            {/* 1. 今日決策區 (補全) */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-transparent border border-indigo-500/30 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl italic font-black">2026</div>
              <h3 className="text-[10px] font-black tracking-widest text-indigo-400 uppercase mb-6">Daily Strategic Decision</h3>
              <p className="text-2xl font-serif italic text-white mb-8 leading-relaxed">"{data.dailyAdvice}"</p>
              
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <DataTag label="幸運色" value={data.luckyIndicators.color} />
                <DataTag label="幸運方位" value={data.luckyIndicators.direction} />
                <div className="col-span-1">
                   <span className="text-[9px] uppercase tracking-[0.2em] text-indigo-400/60 font-bold mb-2 block">今日宜</span>
                   <div className="flex flex-wrap gap-2">
                     {data.luckyIndicators.action.map((act, i) => (
                       <span key={i} className="text-[10px] bg-indigo-500/20 text-indigo-200 px-2 py-1 rounded-md border border-indigo-500/30">{act}</span>
                     ))}
                   </div>
                </div>
              </div>
            </div>

            {/* 2. 玄學細節區 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                <h3 className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Eastern</h3>
                <DataTag label="八字四柱" value={data.personal.eastern.bazi.pillars.join(' ')} sub={`喜用：${data.personal.eastern.bazi.favorable}`} />
                <DataTag label="姓名五格" value={`總格 ${data.personal.eastern.nameAnalysis.fiveGrids.total}`} sub={data.personal.eastern.nameAnalysis.luck81} />
              </div>
              
              <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                <h3 className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Western</h3>
                <DataTag label="人類圖" value={data.personal.western.humanDesign.type} sub={data.personal.western.humanDesign.authority} />
                <DataTag label="生命靈數" value={`主命數 ${data.personal.western.numerology.lifeNum}`} sub={`個人年：${data.personal.western.numerology.personalYear}`} />
              </div>
            </div>

            {/* 3. 關係共振區 (僅在雙人模式顯示) */}
            {mode === 'relationship' && data.relationship && (
              <div className="bg-gradient-to-r from-pink-900/20 to-indigo-900/20 border border-pink-500/30 rounded-[3rem] p-10">
                <div className="flex justify-between items-end mb-8">
                  <h3 className="text-[10px] font-black tracking-widest text-pink-400 uppercase">Resonance</h3>
                  <span className="text-4xl font-black italic">{data.relationship.syncScore}%</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DataTag label="和諧程度" value={data.relationship.harmony} />
                  <DataTag label="溝通建議" value={data.relationship.communicationTone} />
                  <div className="col-span-full bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-xs text-pink-200/70 leading-relaxed"><span className="text-pink-500 font-bold">預警：</span>{data.relationship.warning}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
