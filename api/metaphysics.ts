// 檔案位置: /api/metaphysics.ts
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "API Key 缺失，請檢查 Vercel 環境變數" });

  const isRel = !!(partner && partner.name);
  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式。包含八字、紫微、姓名學、人類圖、生命靈數、卓爾金曆、關係合盤與今日宜忌。
    Respond only with valid JSON. Do not include any markdown tags or explanations.`;

  /**
   * 💡 2026 穩定性策略：
   * 既然 1.5-flash 在你的 Key/區域下報 404，
   * 我們改用 'gemini-pro'，這是 Google 全球節點最通用的穩定路徑。
   */
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  try {
    const googleResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
        // 🔒 保持請求最簡化，不傳 generationConfig，確保不報 400 錯誤
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      // 這裡會抓到 Google 真正的抱怨理由
      return res.status(googleResponse.status).json({ 
        error: `API 報錯: ${data.error?.message || "未知錯誤"}` 
      });
    }

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // 強力清洗 JSON 格式
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsedData = JSON.parse(cleanJson);
      res.status(200).json(parsedData);
    } catch (e) {
      console.error("JSON 解析失敗。原始內容：", rawText);
      res.status(500).json({ error: "解析維度數據失敗", detail: rawText });
    }

  } catch (error: any) {
    res.status(500).json({ error: "後端系統異常: " + error.message });
  }
}
