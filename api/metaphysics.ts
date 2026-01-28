// 檔案位置: /api/metaphysics.ts
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "伺服器 API Key 未配置" });

  const isRel = !!(partner && partner.name);
  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式，包含八字、紫微、姓名學、人類圖、生命靈數、卓爾金曆、關係合盤與今日宜忌。
    請直接輸出 JSON 字串，不要包含 markdown 標籤。`;

  // ✅ 修正 1：改回 v1beta 以支援 Gemini 1.5 的完整功能
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const googleResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          // ✅ 修正 2：在 v1beta 中，必須使用小駝峰 responseMimeType
          responseMimeType: "application/json", 
          temperature: 0.8 
        }
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error("Google API Error:", JSON.stringify(data));
      return res.status(googleResponse.status).json({ 
        error: data.error?.message || "Google API 運算錯誤" 
      });
    }

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // ✅ 修正 3：加入清理邏輯，防止模型吐出 ```json ... ``` 導致解析失敗
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsedData = JSON.parse(cleanJson);
      res.status(200).json(parsedData);
    } catch (e) {
      console.error("JSON Parse Error. Raw text:", rawText);
      res.status(500).json({ error: "數據解析失敗，請再試一次" });
    }

  } catch (error: any) {
    res.status(500).json({ error: "後端系統異常: " + error.message });
  }
}
