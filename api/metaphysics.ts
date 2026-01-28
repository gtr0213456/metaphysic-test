// 檔案位置: /api/metaphysics.ts
export default async function handler(req: any, res: any) {
  // 1. 只允許 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; // 🔒 確保 Vercel 後台已設定此環境變數

  if (!apiKey) {
    return res.status(500).json({ error: "伺服器 API Key 配置缺失" });
  }

  const isRel = !!(partner && partner.name);
  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式，包含八字、紫微、姓名學、人類圖、生命靈數、卓爾金曆、關係合盤與今日宜忌。`;

  /**
   * 💡 關鍵修正點：
   * 1. 使用 v1 版本端點（比 v1beta 更穩定支援 1.5 系列）
   * 2. 使用標準模型名稱 "gemini-1.5-flash"
   */
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const googleResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          responseMimeType: "application/json", 
          temperature: 0.8 
        }
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      // 將詳細錯誤印在 Vercel 日誌中，前端則回傳易讀的錯誤訊息
      console.error("Google API Error Detail:", JSON.stringify(data.error));
      return res.status(googleResponse.status).json({ 
        error: data.error?.message || "Google API 傳回錯誤" 
      });
    }

    // 確保路徑安全並解析 JSON
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) {
      throw new Error("模型未回傳有效內容");
    }

    res.status(200).json(JSON.parse(rawText));

  } catch (error: any) {
    console.error("Server Error:", error.message);
    res.status(500).json({ error: "維度運算中斷: " + error.message });
  }
}
