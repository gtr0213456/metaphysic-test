import React, { useState } from 'react';

export default function App() {
  const [name, setName] = useState("尋道者");
  const [result, setResult] = useState("");

  const testAI = () => {
    setResult(`你好 ${name}，看到這個畫面代表你的網頁已經成功修復了！`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-purple-400">Aetheris OS</h1>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 mb-4 outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button 
          onClick={testAI}
          className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-bold transition"
        >
          測試系統能量
        </button>
        {result && (
          <div className="mt-6 p-4 bg-slate-800 rounded-lg text-slate-300 italic">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
