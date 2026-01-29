export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "API Key 缺失，請檢查 Vercel 環境變數" });

  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${partner?.name ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式。包含八字、紫微、姓名學、人類圖、生命靈數、卓爾金曆、關係合盤與今日宜忌。
    Respond only with valid JSON. Do not include markdown or explanations.`;

  // 💡 關鍵修正：
  // 1. 強制回歸 v1beta (v1 正式版目前確實常找不到 1.5-flash)
  // 2. 改回 URL 參數傳遞金鑰 (這是 AI Studio 的最標準做法，相容性最高)
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const googleResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    clearTimeout(timeout);
    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json({
        error: `Gemini 報錯: ${data.error?.message || "未知錯誤"}`
      });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      return res.status(200).json(JSON.parse(clean));
    } catch {
      return res.status(500).json({ error: "格式修復失敗", raw: rawText });
    }
  } catch (err: any) {
    return res.status(500).json({ error: "連線超時或異常" });
  }
}
