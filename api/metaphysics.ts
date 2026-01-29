export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "環境變數 GEMINI_API_KEY 未設定" });

  // 💡 2026 暴力對齊法：直接嘗試所有可能的名稱
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro",
    "gemini-1.0-pro"
  ];

  let lastError = "";

  for (const modelName of modelsToTry) {
    try {
      // 使用 v1beta 搭配 URL Key (AI Studio 最穩寫法)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `你是一位玄學大師，請用 JSON 回覆這封訊息：{"status": "ok", "model": "${modelName}"}` }] }],
          generationConfig: { temperature: 0.5 }
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 🎯 只要有一個模型通了，就用這個模型跑正式 Prompt
        const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。用戶：${user.name}，生日：${user.birthday}。要求：嚴格輸出 JSON。`;
        
        const finalResponse = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8 }
          })
        });

        const finalData = await finalResponse.json();
        let rawText = finalData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const clean = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        return res.status(200).json(JSON.parse(clean));
      } else {
        lastError = data.error?.message || "未知錯誤";
        console.warn(`${modelName} 失敗: ${lastError}`);
      }
    } catch (e: any) {
      lastError = e.message;
    }
  }

  return res.status(500).json({ error: `所有模型均不可用。最後錯誤: ${lastError}` });
}
