import React, { useState } from 'react';
import { MetaphysicalEngine } from './services/metaphysicalEngine';
import { UserProfile } from './types';

function App() {
  // 將資料動態化，預設值僅供參考
  const [user, setUser] = useState<UserProfile>({ 
    name: "張小明", 
    birthday: "1995-06-15", 
    id: "user-1" 
  });
  
  const [aiReading, setAiReading] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGetAIReading = async () => {
    setIsLoading(true);
    try {
      // 呼叫異步函式獲取 AI 分析
      const result = await MetaphysicalEngine.getAIReading(user);
      setAiReading(result);
    } catch (error) {
      setAiReading("連線能量不穩定，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 text-center">
          Aetheris 玄學命理 OS
        </h1>
        
        {/* 使用者資訊輸入區 (取代原本的靜態顯示) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-purple-400 mb-1 ml-1 uppercase">姓名</label>
              <input 
                type="text" 
                value={user.name}
                onChange={(e) => setUser({...user, name: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-purple-400 mb-1 ml-1 uppercase">生日</label>
              <input 
                type="date" 
                value={user.birthday}
                onChange={(e) => setUser({...user, birthday: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          <button 
            onClick={handleGetAIReading}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 disabled:bg-slate-700 transition duration-300 shadow-lg shadow-purple-900/20"
          >
            {isLoading ? "🔮 大師冥想中..." : "獲取今日 AI 大師建議"}
          </button>
        </div>

        {/* AI 分析顯示區 (升級版導師名片 UI) */}
        {aiReading && (
          <div className="relative p-8 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)] animate-in fade-in zoom-in duration-500">
            {/* 裝飾圖示 */}
            <div className="absolute top-4 right-6 opacity-30 text-2xl">✨</div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50">
                <span className="text-purple-300">⚛️</span>
              </div>
              <h3 className="text-xl font-semibold text-purple-100 font-bold">Aetheris 導師洞察</h3>
            </div>

            <div className="space-y-4">
              <p className="text-slate-200 leading-relaxed text-lg italic font-light tracking-wide">
                "{aiReading}"
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 uppercase tracking-widest">
              <span>命理分析完成</span>
              <span className="text-purple-400">● 能量已同步</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
