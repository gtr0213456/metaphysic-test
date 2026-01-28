// /api/metaphysics.ts
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!apiKey) return res.status(500).json({ error: "伺服器 API Key 配置缺失" });

  const isRel = !!(partner && partner.name);
  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式。請只輸出 JSON，不要 Markdown，不要解釋。`;

  // 💡 直接使用 Google AI Studio 最通用的端點
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const googleResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
        // 🔒 暫時移除 generationConfig，排除所有欄位名稱爭議
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json({ 
        error: data.error?.message || "Google API 傳回錯誤" 
      });
    }

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // 清理 Markdown（以防萬一）
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    res.status(200).json(JSON.parse(cleanJson));

  } catch (error: any) {
    res.status(500).json({ error: "維度運算中斷: " + error.message });
  }
}
