import React, { useState } from 'react';
import { MetaphysicalEngine, MetaphysicResult } from './services/metaphysicalEngine';

// DataTag 組件（已加大）
function DataTag({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-[0.2em] text-indigo-400/60 font-bold mb-1">{label}</span>
      <span className="text-base font-bold text-slate-200">{value || '---'}</span>
      {sub && <span className="text-sm text-slate-500 mt-1">{sub}</span>}
    </div>
  );
}

// 一致度徽章
function ConfidenceBadge({ level, msg }: { level?: '高' | '中' | '低'; msg?: string }) {
  if (!level) return null;
  const colors = {
    高: 'bg-green-500/20 text-green-300 border-green-500/40',
    中: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    低: 'bg-red-500/20 text-red-300 border-red-500/40'
  };
  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium ${colors[level] || 'bg-gray-500/20 text-gray-300'}`}>
      <span className="mr-2">一致度</span>
      <span className="font-bold">{level}</span>
      {msg && <span className="ml-2 opacity-80">({msg})</span>}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [partner, setPartner] = useState({ name: "", birthday: "" });
  const [data, setData] = useState<MetaphysicResult & { confidence?: { level: '高' | '中' | '低'; score?: number; msg: string } } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'personal' | 'relationship'>('personal');

  const handleStartAnalysis = async () => {
    if (!user.name || !user.birthday) return alert("請輸入姓名與生日");
    setIsLoading(true);
    try {
      const apiUser = { ...user, birthday: user.birthday.replace(/\//g, '-') };
      const apiPartner = mode === 'relationship' ? { ...partner, birthday: partner.birthday.replace(/\//g, '-') } : undefined;
      const result = await MetaphysicalEngine.getFullAnalysis(apiUser, apiPartner);
      setData(result);
    } catch (e: any) {
      alert("連線失敗：" + (e.message || JSON.stringify(e) || "未知錯誤"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white p-6 pb-24 font-sans selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(2,2,5,1)_100%)] -z-10"></div>

      <header className="pt-20 pb-12 text-center">
        <h1 className="text-6xl font-black tracking-[0.6em] italic text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white">AETHERIS</h1>
        <p className="text-[10px] text-indigo-500 tracking-[0.8em] mt-6 uppercase opacity-70">Metaphysical Intelligence OS</p>
      </header>

      <main className="max-w-xl mx-auto space-y-10">
        {/* 輸入介面 */}
        <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl">
          {/* ... 輸入按鈕、姓名、生日部分保持原樣 */}
          {/* （省略以節省空間，你可保留原有輸入區代碼） */}
          <button 
            onClick={handleStartAnalysis} 
            disabled={isLoading} 
            className={`w-full py-5 rounded-2xl font-black tracking-[0.5em] text-[11px] transition-all shadow-2xl ${mode === 'personal' ? 'bg-indigo-600' : 'bg-pink-600'} disabled:opacity-20`}
          >
            {isLoading ? "SYNCHRONIZING..." : "INITIATE ANALYSIS"}
          </button>
        </div>

        {/* 一致度徽章 */}
        {data && data.confidence && (
          <div className="flex justify-center mb-6">
            <ConfidenceBadge level={data.confidence.level} msg={data.confidence.msg} />
          </div>
        )}

        {/* 結果展示 */}
        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* 今日決策區 */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-transparent border border-indigo-500/30 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden">
              {/* ... 保持原樣 */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <DataTag label="幸運色" value={data.luckyIndicators?.color || '未知'} />
                <DataTag label="幸運方位" value={data.luckyIndicators?.direction || '未知'} />
                <div className="col-span-1">
                  <span className="text-sm uppercase tracking-[0.2em] text-indigo-400/60 font-bold mb-2 block">今日宜</span>
                  <div className="flex flex-wrap gap-2">
                    {(data.luckyIndicators?.action || []).map((act, i) => (
                      <span 
                        key={i} 
                        className="text-base bg-indigo-500/20 text-indigo-200 px-3 py-1.5 rounded-md border border-indigo-500/30"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 玄學細節區 - 加防呆 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 space-y-6 relative">
                <h3 className="text-sm font-black tracking-widest text-indigo-400 uppercase mb-6">Eastern</h3>
                <div className="absolute top-4 right-4">
                  <ConfidenceBadge level={data.confidence?.level} />
                </div>
                <DataTag 
                  label="八字四柱" 
                  value={data.personal?.eastern?.bazi?.pillars?.join(' ') || '無法計算'} 
                  sub={`喜用：${data.personal?.eastern?.bazi?.favorable || '未知'}`} 
                />
                <DataTag 
                  label="姓名五格" 
                  value={`總格 ${data.personal?.eastern?.nameAnalysis?.fiveGrids?.total || '---'}`} 
                  sub={data.personal?.eastern?.nameAnalysis?.luck81 || '無法解析'} 
                />
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 space-y-6 relative">
                <h3 className="text-sm font-black tracking-widest text-indigo-400 uppercase mb-6">Western</h3>
                <div className="absolute top-4 right-4">
                  <ConfidenceBadge level={data.confidence?.level} />
                </div>
                <DataTag 
                  label="人類圖" 
                  value={data.personal?.western?.humanDesign?.type || '無法計算'} 
                  sub={data.personal?.western?.humanDesign?.authority || '未知'} 
                />
                <DataTag 
                  label="生命靈數" 
                  value={`主命數 ${data.personal?.western?.numerology?.lifeNum || '---'}`} 
                  sub={`個人年：${data.personal?.western?.numerology?.personalYear || '未知'}`} 
                />
              </div>
            </div>

            {/* 關係區 */}
            {mode === 'relationship' && data.relationship && (
              <div className="bg-gradient-to-r from-pink-900/20 to-indigo-900/20 border border-pink-500/30 rounded-[3rem] p-10">
                {/* ... 保持原樣 */}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
