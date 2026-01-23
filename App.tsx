import React, { useState } from 'react';
import { MetaphysicalEngine } from './services/metaphysicalEngine';

function App() {
  const [user, setUser] = useState({ name: "尋道者", birthday: "1995-06-15", id: "user-1" });
  const [aiReading, setAiReading] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGetAIReading = async () => {
    setIsLoading(true);
    try {
      const result = await MetaphysicalEngine.getAIReading(user);
      setAiReading(result);
    } catch (error) {
      setAiReading("能量場不穩定，請重新召喚。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="glass-card p-8 rounded-3xl w-full max-w-md animate-float">
        <h1 className="text-2xl font-bold text-center mb-8 tracking-widest text-white">
          AETHERIS OS
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 uppercase ml-1">Name</label>
            <input 
              type="text" 
              value={user.name}
              onChange={(e) => setUser({...user, name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 transition"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase ml-1">Birth Date</label>
            <input 
              type="date" 
              value={user.birthday}
              onChange={(e) => setUser({...user, birthday: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 transition"
            />
          </div>

          <button 
            onClick={handleGetAIReading}
            disabled={isLoading}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-purple-200 transition-all duration-300 mt-4 shadow-lg active:scale-95"
          >
            {isLoading ? "🔮 正在讀取星象..." : "開始命理鑑定"}
          </button>
        </div>

        {aiReading && (
          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2 mb-3 text-purple-400">
              <i className="fa-solid fa-sparkles"></i>
              <span className="text-sm font-semibold uppercase tracking-wider">導師指引</span>
            </div>
            <p className="text-slate-300 leading-relaxed italic">
              "{aiReading}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
