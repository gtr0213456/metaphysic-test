import React, { useState, useEffect } from 'react';
import { MetaphysicalEngine } from './services/metaphysicalEngine';

function App() {
  const [user, setUser] = useState({ 
    name: "尋道者", 
    birthday: "1995-06-15", 
    id: "user-1" 
  });
  
  const [aiReading, setAiReading] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 檢查組件是否正常掛載
  useEffect(() => {
    console.log("Aetheris OS 已啟動");
  }, []);

  const handleGetAIReading = async () => {
    setIsLoading(true);
    try {
      const result = await MetaphysicalEngine.getAIReading(user);
      setAiReading(result);
    } catch (error) {
      console.error(error);
      setAiReading("連線能量不穩定，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  if (hasError) return <div style={{color: 'white', padding: '20px'}}>程式啟動失敗，請檢查控制台。</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans" style={{ backgroundColor: '#020617' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-purple-400">
          Aetheris 玄學命理 OS
        </h1>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-purple-400 mb-1 uppercase">姓名</label>
              <input 
                type="text" 
                value={user.name}
                onChange={(e) => setUser({...user, name: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-purple-400 mb-1 uppercase">生日</label>
              <input 
                type="date" 
                value={user.birthday}
                onChange={(e) => setUser({...user, birthday: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <button 
            onClick={handleGetAIReading}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 disabled:bg-slate-700 transition duration-300"
          >
            {isLoading ? "🔮 大師冥想中..." : "獲取今日 AI 大師建議"}
          </button>
        </div>

        {aiReading && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-lg">
            <h3 className="text-xl font-bold text-purple-100 mb-4 flex items-center gap-2">
              <span>⚛️</span> Aetheris 導師洞察
            </h3>
            <p className="text-slate-200 italic font-light leading-relaxed">
              "{aiReading}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
