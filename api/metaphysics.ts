// 檔案路徑務必確保在：專案根目錄/api/metaphysics.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. 只允許 POST 請求
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

  /** * 💡 呼叫 Gemini 的共用函式 
   * 使用 v1beta 搭配 URL Key 是目前對 1.5 系列相容性最好的方式
   */
  async function callGemini(model: string, signal: AbortSignal) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });
  }

  try {
    // ⏳ 25 秒超時保護（配合 Vercel 免費版限制）
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    // 🚀 策略：先嘗試 Flash，若失敗自動切換到 Pro
    let googleResponse = await callGemini("gemini-1.5-flash", controller.signal);

    // 如果 1.5-flash 報 404 (找不到模型) 或 5xx (伺服器錯誤)，嘗試備援模型
    if (!googleResponse.ok && (googleResponse.status === 404 || googleResponse.status >= 500)) {
      console.warn("Flash 模型不可用，切換 gemini-pro 備援");
      googleResponse = await callGemini("gemini-pro", controller.signal);
    }

    clearTimeout(timeout);

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return res.status(googleResponse.status).json({
        error: `Gemini API 報錯: ${data.error?.message || "未知錯誤"}`
      });
    }

    const candidate = data.candidates?.[0];
    
    // 🛑 安全政策攔截處理
    if (candidate?.finishReason === "SAFETY") {
      return res.status(403).json({ error: "內容因觸發安全過濾器被攔截" });
    }

    const rawText = candidate?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(502).json({ error: "模型未回傳有效內容" });
    }

    // 🧹 ChatGPT 建議的強力 JSON 抽取與補括號邏輯
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
      extractJson(rawText.replace(/```json/g, "").replace(/```/g, "").trim())
    );

    try {
      const parsed = JSON.parse(clean);
      return res.status(200).json(parsed);
    } catch (parseErr) {
      console.error("JSON 解析失敗:", rawText);
      return res.status(500).json({ error: "數據格式損毀", raw: rawText });
    }

  } catch (err: any) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "運算超時，請重試" });
    }
    return res.status(500).json({ error: "伺服器錯誤: " + err.message });
  }
}
