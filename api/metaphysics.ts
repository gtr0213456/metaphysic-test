export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "環境變數未設定" });

  // 💡 使用 v1 版本的 gemini-1.5-flash，這是目前全球最通用的路徑
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${partner?.name ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式。包含八字、紫微、姓名學、人類圖、生命靈數、卓爾金曆、關係合盤與今日宜忌。
    請只回傳 JSON，不要 markdown 標籤。`;

  try {
    const googleResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      // 這裡會顯示 Google 的具體拒絕理由（例如：API Key 限制）
      return res.status(googleResponse.status).json({
        error: `Google API 拒絕連線: ${data.error?.message || "未知原因"}`
      });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // 強力過濾 markdown
    const clean = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    return res.status(200).json(JSON.parse(clean));
  } catch (err: any) {
    return res.status(500).json({ error: "伺服器內部錯誤: " + err.message });
  }
}
