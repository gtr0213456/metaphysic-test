// 檔案位置: /api/metaphysics.ts
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!apiKey) return res.status(500).json({ error: "伺服器 API Key 配置缺失" });

  const isRel = !!(partner && partner.name);
  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式。包含八字、紫微、姓名學、人類圖、生命靈數、卓爾金曆、關係合盤與今日宜忌。
    Respond only with valid JSON. Do not include any explanation or markdown tags.`;

  /**
   * 💡 解決 Not Found 的關鍵：
   * 在 REST API 呼叫中，模型路徑必須完整包含 "models/" 前綴。
   * 我們使用 v1beta 端點來確保對 1.5 系列的完整支援。
   */
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const googleResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: prompt }] 
        }],
        // 🔒 徹底移除 generationConfig 參數
        // 避開所有像 "responseMimeType" 這類可能因 API 版本不匹配而導致的 400 錯誤。
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error("Google API Error Detail:", JSON.stringify(data));
      return res.status(googleResponse.status).json({ 
        error: data.error?.message || "Google API 運算失敗" 
      });
    }

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // 🛡️ 強力清洗 JSON（處理模型可能會吐出的 Markdown 標籤）
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      res.status(200).json(JSON.parse(cleanJson));
    } catch (e) {
      console.error("JSON 解析失敗，原始內容：", rawText);
      res.status(500).json({ error: "數據格式化失敗，請重試" });
    }

  } catch (error: any) {
    res.status(500).json({ error: "後端連結中斷: " + error.message });
  }
}
