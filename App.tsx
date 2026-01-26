import React, { useState, useEffect } from 'react';

// --- 1. 定義數據規格 (讓 AI 輸出固定格式) ---
interface MetaphysicData {
  bazi: { pillars: string[]; analysis: string };
  humanDesign: { type: string; strategy: string; authority: string };
  tzolkin: { kin: string; totem: string; energy: string };
  numerology: { lifeNum: number; name81: string; luckyColor: string };
  dailyFortune: string;
}

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [data, setData] = useState<MetaphysicData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- 2. 數據引擎：一次獲取所有命盤資料 ---
  const fetchFullAnalysis = async () => {
    if (!user.name || !user.birthday) return;
    setIsLoading(true);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const prompt = `你是一位精通全球玄學的數據大師。
      請針對 姓名：${user.name}，生日：${user.birthday} 進行深度解析。
      請嚴格按照以下 JSON 格式回覆，不要有任何其他解釋文字：
      {
        "bazi": {"pillars": ["年柱", "月柱", "日柱", "時柱"], "analysis": "八字格局解析"},
        "humanDesign": {"type": "類型", "strategy": "策略", "authority": "權威"},
        "tzolkin": {"kin": "KIN編號", "totem": "圖騰名稱", "energy": "能量關鍵字"},
        "numerology": {"lifeNum": 數字, "name81": "吉凶解析", "luckyColor": "顏色"},
        "dailyFortune": "今日綜合運勢鑑定(150字)"
      }`;

      // 使用我們之前跑通的 fetch 邏輯 (此處簡略，請沿用之前的 API 呼叫代碼)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const res = await response.json();
      const rawJson = res.candidates[0].content.parts[0].text.replace(/```json|```/g, "");
      setData(JSON.parse(rawJson));
    } catch (e) {
      console.error("能量鏈接中斷", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white p-6 font-sans">
      {/* 頂部 Header */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          AETHERIS OS
        </h1>
        <p className="text-[10px] text-indigo-500/60 tracking-[0.5em] mt-2 uppercase">Spiritual Technology System</p>
      </header>

      {/* 輸入模組 */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 mb-8 backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <input type="text" placeholder="NAME" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="bg-black/20 border border-white/5 rounded-xl p-4 text-sm" />
          <input type="date" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="bg-black/20 border border-white/5 rounded-xl p-4 text-sm" />
        </div>
        <button onClick={fetchFullAnalysis} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold tracking-widest transition-all">
          {isLoading ? "CALCULATING..." : "START ANALYSIS"}
        </button>
      </div>

      {/* 數據卡片區域 - 這是實現 image_cdc452 質感的關鍵 */}
      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-1000">
          
          {/* 卓爾金曆：模仿 image_cdc46c 的圓形或強調設計 */}
          <section className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 p-8 rounded-[2.5rem] text-center">
            <div className="text-xs text-indigo-400 font-bold tracking-widest mb-2">{data.tzolkin.kin}</div>
            <h2 className="text-3xl font-black mb-1">{data.tzolkin.totem}</h2>
            <p className="text-xs text-slate-400">{data.tzolkin.energy}</p>
          </section>

          {/* 四格小卡：模仿 image_cdc452 的 Status Overview */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard title="八字能量" value={data.bazi.pillars[2]} sub={data.bazi.analysis} />
            <Card title="生命靈數" value={String(data.numerology.lifeNum)} />
            <Card title="81 靈動數" value={data.numerology.name81} />
            <Card title="人類圖權威" value={data.humanDesign.authority} />
          </div>

          {/* 運勢大卡 */}
          <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem]">
            <h4 className="text-[10px] text-indigo-400 font-bold tracking-[0.3em] mb-4">DAILY INSIGHT</h4>
            <p className="text-lg leading-relaxed italic font-light">「{data.dailyFortune}」</p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 3. 視覺組件 (保持 UI 一致性) ---
function Card({ title, value }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
      <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function InfoCard({ title, value, sub }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
      <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">{title}</p>
      <p className="text-xl font-bold text-indigo-400">{value}</p>
      <p className="text-[10px] text-slate-500 mt-1 truncate">{sub}</p>
    </div>
  );
}
