import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. 處理 CORS 跨域 (確保前端能順利連線)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: '伺服器端 GEMINI_API_KEY 未配置' });

  const { user, partner } = req.body;
  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${partner?.name ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式分析（包含八字、紫微、姓名學、人類圖、生命靈數、關係合盤與今日宜忌）。
    請直接回傳 JSON 字串，不要包含任何 Markdown 標記或解釋文字。`;

  // 💡 呼叫共用函式：嘗試 v1beta 端點 (目前對 1.5-flash 相容性最高)
  async function callGemini(model: string, signal: AbortSignal) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      })
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    // 🚀 先嘗試 1.5-flash，失敗則切換到 gemini-pro
    let response = await callGemini('gemini-1.5-flash', controller.signal);
    
    if (!response.ok && (response.status === 404 || response.status >= 500)) {
      console.warn("Flash 模型不可用，切換備援模型...");
      response = await callGemini('gemini-pro', controller.signal);
    }

    clearTimeout(timeout);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: `Google API: ${data.error?.message || '未知錯誤'}` });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // 強力清洗 JSON (處理 AI 可能多回傳的標籤)
    const extractJson = (text: string) => {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      return (start !== -1 && end !== -1) ? text.slice(start, end + 1) : text;
    };

    const clean = extractJson(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

    return res.status(200).json(JSON.parse(clean));
  } catch (err: any) {
    if (err.name === 'AbortError') return res.status(504).json({ error: '運算超時' });
    return res.status(500).json({ error: '後端執行錯誤: ' + err.message });
  }
}
