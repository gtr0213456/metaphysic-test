import React, { useState } from 'react';
import { MetaphysicalEngine } from './services/metaphysicalEngine';
// ... 其他 import

function App() {
  const [user, setUser] = useState({ name: "張小明", birthday: "1995-06-15", id: "user-1" });
  const [aiReading, setAiReading] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGetAIReading = async () => {
    setIsLoading(true);
    try {
      // 呼叫你在 MetaphysicalEngine 實作的異步函式
      const result = await MetaphysicalEngine.getAIReading(user);
      setAiReading(result);
    } catch (error) {
      setAiReading("連線能量不穩定，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Aetheris 玄學命理 OS</h1>
      
      {/* 使用者資訊區 */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <p>姓名: {user.name} | 生日: {user.birthday}</p>
        <button 
          onClick={handleGetAIReading}
          disabled={isLoading}
          className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
        >
          {isLoading ? "大師冥想中..." : "獲取今日 AI 大師建議"}
        </button>
      </div>

      {/* AI 分析顯示區 */}
      {aiReading && (
        <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg animate-fade-in">
          <h3 className="text-purple-800 font-bold mb-2">大師洞察：</h3>
          <p className="text-gray-700 leading-relaxed italic">"{aiReading}"</p>
        </div>
      )}

      {/* 這裡可以繼續放你之前的雷達圖或卡片組件 */}
    </div>
  );
}

export default App;
