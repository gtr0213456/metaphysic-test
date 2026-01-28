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
    Respond only with valid JSON. Do not include markdown tags.`;

  /**
   * 💡 2026 關鍵修正：
   * 1. 1.5-flash 已退役，切換至 gemini-2.5-flash (最新穩定版) 
   * 或 gemini-3-flash-preview (如果你的 Key 有權限)
   * 2. 使用 v1beta 端點以獲取最新模型支援
   */
  const modelId = "gemini-2.5-flash"; // 建議優先嘗試此穩定別名
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  try {
    const googleResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          // 2026 v1beta 已支援此寫法
          responseMimeType: "application/json",
          temperature: 0.8 
        }
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      // 如果 2.5-flash 仍報 404，可能是區域權限問題
      return res.status(googleResponse.status).json({ 
        error: `模型調用失敗 (${modelId}): ${data.error?.message}` 
      });
    }

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    res.status(200).json(JSON.parse(cleanJson));

  } catch (error: any) {
    res.status(500).json({ error: "維度運算中斷: " + error.message });
  }
}
