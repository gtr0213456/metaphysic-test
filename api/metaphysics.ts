// 檔案位置: /api/metaphysics.ts
export default async function handler(req: any, res: any) {
  // 只允許 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; // 🔒 從 Vercel 環境變數安全讀

  if (!apiKey) {
    return res.status(500).json({ error: "伺服器 API Key 配置缺失" });
  }

  const isRel = !!(partner && partner.name);
  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式，包含八字、紫微、姓名學、人類圖、生命靈數、卓爾金曆、關係合盤與今日宜忌。`;

  // 嘗試模型
  const modelId = "gemini-1.5-flash-latest";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

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
      console.error("Google API Error:", data.error);
      return res.status(googleResponse.status).json({ error: data.error?.message || "Google API 傳回錯誤" });
    }

    // 解析 Google 傳回的 JSON 字串並回傳給前端
    const rawText = data.candidates[0].content.parts[0].text;
    res.status(200).json(JSON.parse(rawText));

  } catch (error: any) {
    console.error("Server Error:", error.message);
    res.status(500).json({ error: "維度運算中斷，請重試" });
  }
}
