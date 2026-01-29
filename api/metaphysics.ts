export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "API Key 未配置" });

  const isRel = !!(partner && partner.name);
  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式。包含八字、紫微、姓名學、人類圖、生命靈數、卓爾金曆、關係合盤與今日宜忌。
    Respond only with valid JSON. Do not include markdown blocks.`;

  // 💡 修正關鍵：改用 'gemini-1.5-flash-latest' 或 'gemini-pro'
  // 這是為了避開部分節點找不到 'gemini-1.5-flash' 的問題
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  try {
    const googleResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // 🔒 徹底移除 generationConfig 內的所有參數 (如 responseMimeType)
        // 這樣可以 100% 解決 image_ddc2d3.png 中的 400 Bad Request 錯誤
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json({ 
        error: `Google API 錯誤: ${data.error?.message}` 
      });
    }

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // 清理 Markdown 標籤以防 JSON.parse 失敗
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsedData = JSON.parse(cleanJson);
      res.status(200).json(parsedData);
    } catch (parseError) {
      res.status(500).json({ error: "模型回傳格式非合法 JSON", rawText });
    }

  } catch (error: any) {
    res.status(500).json({ error: "伺服器運算異常: " + error.message });
  }
}
