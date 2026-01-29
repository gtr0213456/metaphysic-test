export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key 缺失" });
  }

  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
用戶：${user?.name}，生日：${user?.birthday}。
${partner?.name ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
要求：嚴格輸出 JSON，不要輸出解釋文字或 markdown。`;

  try {
    /** 🧠 STEP 1：抓出這把 API key 可用的模型 */
    const modelsRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const modelsData = await modelsRes.json();

    if (!modelsRes.ok) {
      return res.status(500).json({ error: "無法取得模型清單", detail: modelsData });
    }

    const usableModels = (modelsData.models || []).filter((m: any) =>
      m.supportedGenerationMethods?.includes("generateContent")
    );

    if (!usableModels.length) {
      return res.status(500).json({ error: "此 API Key 沒有可用的生成模型" });
    }

    // 🎯 優先挑 Flash 類型（快又便宜），沒有就選第一個
    const chosenModel =
      usableModels.find((m: any) => m.name.includes("flash"))?.name ||
      usableModels[0].name;

    console.log("使用模型:", chosenModel);

    /** 🧠 STEP 2：呼叫該模型產生內容 */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${chosenModel}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      }
    );

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gemini API 錯誤"
      });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error("模型回傳空內容:", JSON.stringify(data));
      return res.status(502).json({ error: "模型未回傳內容" });
    }

    /** 🧹 JSON 清洗三部曲 */
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
      extractJson(rawText.replace(/```json|```/g, "").trim())
    );

    try {
      const parsed = JSON.parse(clean);
      return res.status(200).json(parsed);
    } catch {
      console.error("JSON 解析失敗，原始輸出:", rawText);
      return res.status(500).json({ error: "模型輸出格式錯誤", raw: rawText });
    }

  } catch (err: any) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Gemini 回應逾時" });
    }
    return res.status(500).json({ error: "伺服器錯誤: " + err.message });
  }
}
