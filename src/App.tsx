import React, { useState } from 'react';
import { MetaphysicalEngine, MetaphysicResult } from './services/metaphysicalEngine';

function MiniCard({ title, value, icon, subValue }: { title: string; value: string | number; icon: string; subValue?: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] hover:bg-white/10 transition-all duration-500 group flex flex-col items-center justify-center min-h-[150px]">
      <div className="text-xl mb-3 opacity-50 group-hover:opacity-100 transition-opacity">{icon}</div>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-sm font-bold text-slate-200 text-center leading-tight">{value || '---'}</p>
      {subValue && <p className="text-[8px] text-indigo-400 mt-2 text-center opacity-70 px-2">{subValue}</p>}
    </div>
  );
}

function LoShuGrid({ grid }: { grid: number[] }) {
  const layout = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  return (
    <div className="grid grid-cols-3 gap-1 w-20 mx-auto mt-2">
      {layout.map((num) => (
        <div key={num} className={`h-6 w-6 flex items-center justify-center text-[9px] rounded-md border ${grid && grid[num] > 0 ? 'bg-indigo-500/40 border-indigo-500/60 text-white font-bold' : 'border-white/5 text-white/5'}`}>
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

  const handleStartAnalysis = async () => {
    if (!user.name || !user.birthday) return alert("請填寫姓名與生日");
    setIsLoading(true);
    try {
      const result = await MetaphysicalEngine.getFullAnalysis(user, mode === 'relationship' ? partner : undefined);
      setData(result);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 pb-20 font-sans">
      <header className="pt-16 pb-10 text-center">
        <h1 className="text-4xl font-black tracking-[0.4em] text-white italic">AETHERIS</h1>
        <p className="text-[10px] text-indigo-400 tracking-[0.5em] uppercase mt-3 font-bold opacity-60">Metaphysical Life OS</p>
      </header>

      <div className="flex justify-center gap-4 mb-10">
        <button onClick={() => { setMode('personal'); setData(null); }} className={`px-10 py-3 rounded-full text-[10px] font-bold tracking-widest transition-all ${mode === 'personal' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-500'}`}>個人鑑定</button>
        <button onClick={() => { setMode('relationship'); setData(null); }} className={`px-10 py-3 rounded-full text-[10px] font-bold tracking-widest transition-all ${mode === 'relationship' ? 'bg-pink-600 shadow-lg shadow-pink-500/20' : 'bg-white/5 text-slate-500'}`}>雙人共振</button>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-10">
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 backdrop-blur-3xl space-y-6">
          <input type="text" placeholder="您的姓名" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-indigo-500/50 transition-all" />
          <input type="date" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-indigo-500/50 transition-all" />
          
          {mode === 'relationship' && (
            <div className="pt-6 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
              <input type="text" placeholder="對象姓名" value={partner.name} onChange={(e)=>setPartner({...partner, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-pink-500/50 transition-all" />
              <input type="date" value={partner.birthday} onChange={(e)=>setPartner({...partner, birthday:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-pink-500/50 transition-all" />
            </div>
          )}

          <button onClick={handleStartAnalysis} disabled={isLoading} className={`w-full py-5 rounded-2xl font-black tracking-[0.4em] text-xs transition-all ${mode === 'personal' ? 'bg-indigo-600' : 'bg-pink-600'} disabled:opacity-30`}>
            {isLoading ? "CALCULATING..." : "INITIATE ANALYSIS"}
          </button>
        </div>

        {data && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="bg-gradient-to-b from-indigo-500/20 to-transparent border border-white/10 rounded-[3rem] p-8 text-center">
              <p className="text-[10px] font-bold tracking-[0.5em] text-indigo-400 mb-2 uppercase">Daily Insight</p>
              <p className="text-sm leading-relaxed text-slate-300 italic">"{data.dailyAdvice}"</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MiniCard title="八字格局" value={data.personal.bazi.pillars[2]} icon="☯️" subValue={data.personal.bazi.analysis} />
              
              <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[150px]">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">生命靈數</p>
                <p className="text-lg font-bold text-indigo-400">{data.personal.numerology.lifeNum}</p>
                <LoShuGrid grid={data.personal.numerology.grid} />
              </div>

              <MiniCard title="人類圖" value={data.personal.humanDesign.type} icon="🧬" subValue={data.personal.humanDesign.profile} />
              
              <MiniCard 
                title="81 靈動數" 
                value={`${data.personal.numerology.name81.strokes} 劃`} 
                icon="✨" 
                subValue={`${data.personal.numerology.name81.luck}: ${data.personal.numerology.name81.analysis.substring(0, 15)}...`} 
              />
            </div>

            {mode === 'relationship' && data.relationship && (
              <div className="bg-gradient-to-br from-pink-500/20 to-indigo-500/20 border border-white/10 rounded-[3rem] p-8 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black tracking-widest uppercase text-white">Relationship Synergy</h3>
                  <span className="text-2xl font-black text-pink-500">{data.relationship.syncScore}%</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">{data.relationship.harmony}</p>
                <p className="text-[10px] text-pink-400 font-bold italic">💡 {data.relationship.advice}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
