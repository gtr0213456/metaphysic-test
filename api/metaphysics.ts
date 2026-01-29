import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS 設置 (允許前端跨域連線)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 處理預檢請求
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // 只允許 POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API Key 未配置，請檢查 Vercel 環境變數' });

  const { user, partner } = req.body;
  
  // 💡 鎖定 v1beta + gemini-1.5-flash (這是免費帳號最穩定的組合)
  // 如果這個網址報 404，那 100% 是 API Key 的問題
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${partner?.name ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式分析（包含八字、紫微、姓名學、人類圖、生命靈數、關係合盤與今日宜忌）。
    請直接回傳 JSON 字串，不要包含 \`\`\`json 或其他 Markdown 標記。`;

  try {
    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    const data = await googleResponse.json();

    // 🛑 捕捉 Google API 的錯誤 (如 Key 失效、模型找不到)
    if (!googleResponse.ok) {
      console.error("Google API Error:", data);
      return res.status(googleResponse.status).json({ 
        error: `Google 拒絕連線: ${data.error?.message || '權限或模型錯誤'}` 
      });
    }

    const candidate = data.candidates?.[0];
    if (!candidate) {
      return res.status(502).json({ error: "模型未回傳任何內容" });
    }

    const rawText = candidate.content?.parts?.[0]?.text || "";
    
    // 強力 JSON 清洗
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
