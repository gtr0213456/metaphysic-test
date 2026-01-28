// /api/metaphysics.ts
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "伺服器 API Key 未配置" });

  const isRel = !!(partner && partner.name);
  // 在 Prompt 強調 JSON 並要求不要有 Markdown
  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式，包含八字、紫微、姓名學、人類圖、生命靈數、卓爾金曆、關係合盤與今日宜忌。
    請只輸出合法 JSON，不要加入任何解釋文字、markdown 標籤、或註解。`;

  // 使用 v1 穩定版
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const googleResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          // ✅ 徹底拔除 response_mime_type，確保不再出現 400 錯誤
          temperature: 0.7 
        }
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json({ 
        error: data.error?.message || "Google API 運算錯誤" 
      });
    }

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 🛡️ 防呆解析器：自動過濾 Markdown 標籤與多餘空白
    const cleanJson = (text: string) => {
      return text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    };

    try {
      const parsedData = JSON.parse(cleanJson(rawText));
      res.status(200).json(parsedData);
    } catch (parseError) {
      console.error("JSON 解析失敗，原始文字內容:", rawText);
      res.status(500).json({ error: "模型回傳格式不正確，請再試一次" });
    }

  } catch (error: any) {
    res.status(500).json({ error: "維度連結中斷: " + error.message });
  }
}
