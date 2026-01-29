// /api/metaphysics.ts
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key 缺失，請檢查 Vercel 環境變數" });
  }

  const isRel = !!(partner && partner.name);
  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
用戶：${user.name}，生日：${user.birthday}。
${isRel ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
要求：嚴格輸出 JSON 格式。包含八字、紫微、姓名學、人類圖、生命靈數、卓爾金曆、關係合盤與今日宜忌。
Respond only with valid JSON. Do not include markdown or explanations.`;

  /** 呼叫 Gemini 的共用函式 */
  async function callGemini(model: string, signal: AbortSignal) {
    return fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );
  }

  try {
    // ⏳ Vercel Serverless 超時保護
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    // 🚀 先用 Flash（快、便宜）
    let googleResponse = await callGemini("gemini-1.5-flash", controller.signal);

    // 🔁 若 Flash 掛掉，自動切 Pro
    if (!googleResponse.ok && googleResponse.status >= 500) {
      console.warn("Flash 模型失敗，切換 gemini-1.5-pro");
      googleResponse = await callGemini("gemini-1.5-pro", controller.signal);
    }

    clearTimeout(timeout);

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json({
        error: `Gemini API 錯誤: ${data.error?.message || "未知錯誤"}`
      });
    }

    const candidate = data.candidates?.[0];

    // 🛑 Safety 攔截判斷
    if (candidate?.finishReason === "SAFETY") {
      return res.status(403).json({ error: "模型因安全政策拒絕回應" });
    }

    const rawText = candidate?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error("Gemini 回傳異常結構:", JSON.stringify(data));
      return res.status(502).json({ error: "模型未回傳有效內容" });
    }

    /** 🧹 JSON 抽取 + 修復工具 */
    const extractJson = (text: string) => {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      return start !== -1 && end !== -1 ? text.slice(start, end + 1) : text;
    };

    const fixBrackets = (text: string) => {
      const open = (text.match(/{/g) || []).length;
      const close = (text.match(/}/g) || []).length;
      return close < open ? text + "}".repeat(open - close) : text;
    };

    const clean = fixBrackets(
      extractJson(
        rawText.replace(/```json/g, "").replace(/```/g, "").trim()
      )
    );

    try {
      const parsed = JSON.parse(clean);
      return res.status(200).json(parsed);
    } catch (parseErr) {
      console.error("JSON 解析失敗，原始輸出:", rawText);
      return res.status(500).json({
        error: "模型輸出格式錯誤",
        raw: rawText
      });
    }

  } catch (err: any) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Gemini 回應逾時" });
    }
    return res.status(500).json({ error: "伺服器錯誤: " + err.message });
  }
}
