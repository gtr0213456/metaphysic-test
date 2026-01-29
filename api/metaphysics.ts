export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key 缺失" });
  }

  const prompt = `請用 JSON 回答以下命理分析，不要輸出任何解釋文字：
用戶：${user.name} ${user.birthday}
${partner?.name ? `對象：${partner.name} ${partner.birthday}` : ""}`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gemini API 錯誤"
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // 清 Markdown
    const clean = text.replace(/```json|```/g, "").trim();

    try {
      res.status(200).json(JSON.parse(clean));
    } catch {
      res.status(500).json({ error: "模型沒有回傳合法 JSON", raw: text });
    }

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
