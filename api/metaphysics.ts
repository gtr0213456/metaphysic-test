import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. 設定 CORS (確保前端能連線)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API Key 未配置' });

  const { user, partner } = req.body;
  
  // 💡 暴力解法：定義所有可能的模型名稱
  // 只要其中有一個能通，程式就會成功
  const MODELS_TO_TRY = [
    "gemini-1.5-flash",          // 標準名稱
    "gemini-1.5-flash-latest",   // 最新別名
    "gemini-1.5-flash-001",      // 特定版本號 (最穩)
    "gemini-pro"                 // 舊版備援 (最後手段)
  ];

  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${partner?.name ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式分析（包含八字、紫微、姓名學、人類圖、生命靈數、關係合盤與今日宜忌）。
    請直接回傳 JSON 字串，不要包含 markdown 標記。`;

  let lastError = "";

  // 🔄 迴圈嘗試所有模型
  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`正在嘗試模型: ${model}...`);
      
      // 使用 v1beta，因為它對別名的支援度最好
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 }
        })
      });

      // 如果失敗 (例如 404 Not Found)，就進入下一次迴圈嘗試別的模型
      if (!response.ok) {
        const errData = await response.json();
        lastError = `模型 ${model} 失敗: ${errData.error?.message || response.statusText}`;
        console.warn(lastError);
        continue; // 繼續試下一個
      }

      // 🎉 成功連線！處理資料並回傳
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!rawText) throw new Error("模型回傳空內容");

      const extractJson = (text: string) => {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        return (start !== -1 && end !== -1) ? text.slice(start, end + 1) : text;
      };

      const clean = extractJson(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
      
      // 成功解析後直接 return，結束函式
      return res.status(200).json(JSON.parse(clean));

    } catch (err: any) {
      console.error(`嘗試 ${model} 時發生例外:`, err);
      lastError = err.message;
      // 繼續試下一個...
    }
  }

  // 🛑 如果跑完所有模型都失敗
  return res.status(500).json({ 
    error: `所有模型均嘗試失敗。請檢查 API Key 是否啟用 Generative Language API。最後錯誤: ${lastError}` 
  });
}
