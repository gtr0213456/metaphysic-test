import React, { useState } from 'react';

export default function App() {
  const [user, setUser] = useState({ name: "", birthday: "" });
  const [reading, setReading] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getAIReading = async () => {
    if (!user.name || !user.birthday) return;
    setIsLoading(true);
    setReading(""); 
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // 定義所有可能的「型號 + 版本」組合，讓程式自己去撞，撞到對為止
    const configs = [
      { url: 'v1beta', model: 'gemini-1.5-flash' },
      { url: 'v1', model: 'gemini-1.5-flash' },
      { url: 'v1beta', model: 'gemini-pro' }
    ];

    let lastErrorMessage = "";

    for (const config of configs) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/${config.url}/models/${config.model}:generateContent?key=${apiKey}`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `你是一位玄學大師，請為姓名：${user.name}，生日：${user.birthday} 的人寫一段 80 字的繁體中文今日運勢。` }] }]
          })
        });

        const data = await response.json();

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          setReading(data.candidates[0].content.parts[0].text);
          setIsLoading(false);
          return; // 成功就跳出
        } else if (data.error) {
          lastErrorMessage = `${data.error.message} (Status: ${data.error.status})`;
        }
      } catch (e: any) {
        lastErrorMessage = e.message;
      }
    }

    // 如果所有組合都失敗，啟動「本地保底大師」，確保畫面不留白，同時顯示報錯原因
    console.error("所有 API 嘗試均失敗:", lastErrorMessage);
    setReading(`(能量連結中...) ${user.name}，大師感應到你今日氣場穩定，凡事皆能逢凶化吉。 [診斷資訊: ${lastErrorMessage}]`);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050510] text-slate-200 p-6 flex flex-col items-center">
      <div className="max-w-md w-full mt-12">
        <h1 className="text-4xl font-black text-center mb-10 tracking-tighter text-indigo-400">Aetheris OS</h1>
        
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2rem] shadow-2xl backdrop-blur-md">
          <div className="space-y-5">
            <div>
              <label className="text-[10px] text-indigo-400 font-bold ml-1 uppercase tracking-widest">User Name</label>
              <input type="text" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 mt-1 outline-none focus:border-indigo-500 transition-all" placeholder="輸入姓名" />
            </div>
            <div>
              <label className="text-[10px] text-indigo-400 font-bold ml-1 uppercase tracking-widest">Birthday</label>
              <input type="date" value={user.birthday} onChange={(e)=>setUser({...user, birthday:e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 mt-1 outline-none focus:border-indigo-500 transition-all" />
            </div>
            <button onClick={getAIReading} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-indigo-900/20">
              {isLoading ? "🔮 正在對準星象..." : "獲取 AI 大師鑑定"}
            </button>
          </div>
        </div>

        {reading && (
          <div className="mt-8 p-8 rounded-[2rem] bg-indigo-950/20 border border-indigo-500/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <h3 className="text-xs font-bold text-indigo-300 tracking-widest uppercase">大師洞察分析</h3>
            </div>
            <p className="text-slate-200 leading-relaxed italic text-lg">"{reading}"</p>
            <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-between items-center">
              <span className="text-[10px] text-slate-600 tracking-tighter">ENERGY SYNCED ● CORE 1.5</span>
              <span className="text-[10px] text-slate-600 font-mono">200 OK</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
