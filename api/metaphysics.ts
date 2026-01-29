// 檔案路徑：/api/metaphysics.ts (必須在專案根目錄的 api 資料夾內)
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. 限制 POST 請求
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user, partner } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Vercel 環境變數 GEMINI_API_KEY 未設定" });
  }

  const isRel = !!(partner && partner.name);
  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式。包含八字、紫微、姓名學、人類圖、生命靈數、卓爾金曆、關係合盤與今日宜忌。
    Respond only with valid JSON. Do not include markdown or explanations.`;

  /** * 💡 備援呼叫機制：嘗試不同的模型 ID 以應對 Google 的區域限制
   */
  async function callGemini(modelId: string, signal: AbortSignal) {
    // 使用 v1beta 端點，這是目前對 Flash 模型相容性最好的路徑
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25秒超時保護

    // 🚀 優先嘗試 gemini-1.5-flash
    let response = await callGemini("gemini-1.5-flash", controller.signal);

    // 🔁 如果 1.5-flash 報 404 (Not Found)，自動嘗試 gemini-pro
    if (!response.ok && response.status === 404) {
      console.warn("Flash 模型找不到，切換 gemini-pro...");
      response = await callGemini("gemini-pro", controller.signal);
    }

    clearTimeout(timeout);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Google API 錯誤: ${data.error?.message || "未知錯誤"}`
      });
    }

    // 🛑 檢查內容是否被安全過濾器攔截
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === "SAFETY") {
      return res.status(403).json({ error: "內容因安全政策被攔截，請調整輸入內容" });
    }

    const rawText = candidate?.content?.parts?.[0]?.text;
    if (!rawText) return res.status(502).json({ error: "模型未回傳有效文字" });

    /** 🧹 強力 JSON 抽取與補括號邏輯 (確保格式絕對正確) */
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

    const cleanJsonStr = fixBrackets(
      extractJson(rawText.replace(/```json/g, "").replace(/```/g, "").trim())
    );

    try {
      const parsed = JSON.parse(cleanJsonStr);
      return res.status(200).json(parsed);
    } catch (parseErr) {
      return res.status(500).json({ error: "JSON 解析失敗", raw: rawText });
    }

  } catch (err: any) {
    if (err.name === "AbortError") return res.status(504).json({ error: "連線超時，請重試" });
    return res.status(500).json({ error: "伺服器錯誤: " + err.message });
  }
}
