import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS 設置
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
  if (!apiKey) return res.status(500).json({ error: 'API Key 未配置' });

  const { user, partner } = req.body;

  // 💡 修正點：改用 v1 正式版路徑 (比 v1beta 更穩定)
  // 這是目前官方文件推薦的標準寫法
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${partner?.name ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式分析（包含八字、紫微、姓名學、人類圖、生命靈數、關係合盤與今日宜忌）。
    請直接回傳 JSON 字串，不要包含 markdown 標記。`;

  try {
    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // 移除過多的 config，使用預設值以減少錯誤
        generationConfig: {
          temperature: 0.7
        }
      })
    });

    const data = await googleResponse.json();

    // 🛑 如果 Google 拒絕 (例如 404 Not Found 或 400 Bad Request)
    if (!googleResponse.ok) {
      console.error("Google API Error:", JSON.stringify(data));
      // 回傳具體錯誤給前端
      return res.status(googleResponse.status).json({ 
        error: `Google API 錯誤 (${googleResponse.status}): ${data.error?.message || '權限或模型無效'}` 
      });
    }

    const candidate = data.candidates?.[0];
    if (!candidate) {
      return res.status(502).json({ error: "模型未回傳內容" });
    }

    const rawText = candidate.content?.parts?.[0]?.text || "";
    
    // JSON 清洗邏輯
    const extractJson = (text: string) => {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      return (start !== -1 && end !== -1) ? text.slice(start, end + 1) : text;
    };

    const clean = extractJson(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

    return res.status(200).json(JSON.parse(clean));

  } catch (err: any) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: '伺服器內部錯誤: ' + err.message });
  }
}
