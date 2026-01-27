import React, { useState } from 'react';
import { MetaphysicalEngine, MetaphysicResult } from './services/metaphysicalEngine';

// --- 小型元件：鑑定卡片 ---
function MiniCard({ title, value, icon, subValue }: { title: string; value: string | number; icon: string; subValue?: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] hover:bg-white/10 transition-all duration-500 group flex flex-col items-center justify-center min-h-[140px]">
      <div className="text-xl mb-3 opacity-50 group-hover:opacity-100 transition-opacity text-center">{icon}</div>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">{title}</p>
      <p className="text-sm font-bold text-slate-200 text-center leading-tight">{value}</p>
      {subValue && <p className="text-[8px] text-indigo-400 mt-2 text-center opacity-70 leading-relaxed px-1">{subValue}</p>}
    </div>
  );
}

// --- 九宮格元件 (洛書標準佈局) ---
function LoShuGrid({ grid }: { grid: number[] }) {
  // 標準洛書順序：4 9 2 / 3 5 7 / 8 1 6
  const layout = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  return (
    <div className="grid grid-cols-3 gap-1 w-20 mx-auto my-3">
      {layout.map((num) => (
        <div 
          key={num} 
          className={`h-6 w-6 flex items-center justify-center text-[9px] rounded-md border transition-colors ${
            grid && grid[num] > 0 
              ? 'bg-indigo-500/40 border-indigo-500/60 text-white font-bold shadow-[0_0_8px_rgba(99,102,241,0.4)]' 
              : 'border-white/5 text-white/5'
          }`}
        >
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
    if (!user.name || !user.birthday) return alert("請填寫您的姓名與生日");
    if (mode === 'relationship' && (!partner.name || !partner.birthday)) return alert("請填寫對象的姓名與生日");

    setIsLoading(true);
    try {
      const result = await MetaphysicalEngine.getFullAnalysis(
        user, 
        mode === 'relationship' ? partner : undefined
      );
      setData(result);
    } catch (e: any) {
      console.error("Analysis Error:", e);
      alert("宇宙能量連結失敗：" + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 pb-20 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="pt-16 pb-10 text-center">
        <h1 className="text-4xl font-black tracking-[0.4em] text-white italic">AETHERIS</h1>
        <p className="text-[10px] text-indigo-400 tracking-[0.5em] uppercase mt-3 font-bold opacity-60">Metaphysical Life OS</p>
      </header>

      {/* Mode Switcher */}
      <div className="flex justify-center gap-4 mb-10">
        <button 
          onClick={() => { setMode('personal'); setData(null); }} 
          className={`px-10 py-3 rounded-full text-[10px] font-bold tracking-widest transition-all duration-500 ${mode === 'personal' ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
        >
          個人鑑定
        </button>
        <button 
          onClick={() => { setMode('relationship'); setData(null); }} 
          className={`px-10 py-3 rounded-full text-[10px] font-bold tracking-widest transition-all duration-500 ${mode === 'relationship' ? 'bg-pink-600 shadow-[0_0_20px_rgba(219,39,119,0.4)]' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
        >
          雙人共振
        </button>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-10">
        {/* Input Form */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 backdrop-blur-3xl shadow-2xl space-y-6">
          <div className="space-y-4">
            <label className="text-[9px] font-bold text-indigo-400 tracking-widest uppercase ml-2 italic">User Profile</label>
            <input type="text" placeholder="姓名" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500/50 transition-all outline-none" />
            <input type="date" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500/50 transition-all outline-none text-slate-400" />
          </div>
          
          {mode === 'relationship' && (
            <div className="pt-6 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
              <label className="text-[9px] font-bold text-pink-400 tracking-widest uppercase ml-2 italic">Partner Profile</label>
              <input type="text" placeholder="對象姓名" value={partner.name} onChange={(e)=>setPartner({...partner, name:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-pink-500/50 transition-all outline-none" />
              <input type="date" value={partner.birthday} onChange={(e)=>setPartner({...partner, birthday:e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-pink-500/50 transition-all outline-none text-slate-400" />
            </div>
          )}

          <button 
            onClick={handleStartAnalysis} 
            disabled={isLoading} 
            className={`w-full py-5 rounded-2xl font-black tracking-[0.4em] text-xs transition-all duration-500 ${mode === 'personal' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-pink-600 hover:bg-pink-500'} shadow-2xl disabled:opacity-30 active:scale-95`}
          >
            {isLoading ? "CALCULATING..." : "INITIATE ANALYSIS"}
          </button>
        </div>

        {/* Results Area */}
        {data && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-700">
            {/* Daily Advice Card */}
            <div className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-[3rem] p-8 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
               <p className="text-[10px] font-bold tracking-[0.5em] text-indigo-400 mb-4 uppercase italic opacity-80">Daily Insight</p>
               <p className="text-sm leading-relaxed text-slate-300 italic">"{data.dailyAdvice}"</p>
            </div>

            {/* Mayan & Core Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] col-span-2 flex items-center justify-between group hover:bg-white/10 transition-all">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mayan Totem</p>
                  <h3 className="text-lg font-black text-white italic">{data.personal.tzolkin.totem} ({data.personal.tzolkin.kin})</h3>
                  <p className="text-[10px] text-indigo-400 mt-1">{data.personal.tzolkin.energy}</p>
                </div>
                <div className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-1000">🌀</div>
              </div>
              
              <MiniCard title="八字格局" value={data.personal.bazi.pillars[2]} icon="☯️" subValue={data.personal.bazi.analysis} />
              
              <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[140px]">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">生命靈數</p>
                <p className="text-xl font-black text-indigo-400">{data.personal.numerology.lifeNum}</p>
                <LoShuGrid grid={data.personal.numerology.grid} />
              </div>

              <MiniCard title="人類圖" value={data.personal.humanDesign.type} icon="🧬" subValue={`${data.personal.humanDesign.profile} / ${data.personal.humanDesign.authority}`} />
              
              <MiniCard 
                title="81 靈動數" 
                value={`${data.personal.numerology.name81.strokes} 劃`} 
                icon="✨" 
                subValue={`${data.personal.numerology.name81.luck}: ${data.personal.numerology.name81.analysis.substring(0, 20)}...`} 
              />
            </div>

            {/* Relationship Synergy */}
            {mode === 'relationship' && data.relationship && (
              <div className="bg-gradient-to-br from-pink-500/20 to-indigo-500/20 border border-white/10 rounded-[3rem] p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-1000">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black tracking-widest uppercase text-white italic">Relationship Synergy</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500" style={{ width: `${data.relationship.syncScore}%` }}></div>
                    </div>
                    <span className="text-2xl font-black text-pink-500">{data.relationship.syncScore}%</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-black/30 p-5 rounded-3xl border border-white/5 backdrop-blur-md">
                    <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">{data.relationship.harmony}</p>
                    <div className="flex gap-2">
                      <span className="text-sm">💡</span>
                      <p className="text-[10px] text-pink-300 font-bold italic leading-normal">{data.relationship.advice}</p>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-2 text-[9px] tracking-[0.2em] text-slate-500 uppercase font-bold">
                    <span>Peak Time Today</span>
                    <span className="w-1 h-1 rounded-full bg-pink-500"></span>
                    <span className="text-white">{data.relationship.peakTime}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
