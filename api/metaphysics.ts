import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. 設定 CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 💡 注意：環境變數名稱請設為 GROQ_API_KEY
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: '尚未在 Vercel 設定 GROQ_API_KEY' });

  const { user, partner } = req.body;
  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${partner?.name ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式分析（包含八字、紫微、姓名學、人類圖、生命靈數、關係合盤與今日宜忌）。
    直接回傳 JSON 物件，不要有任何 Markdown 標籤或前言。`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a professional metaphysics expert. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        response_format: { type: "json_object" } // 強制 JSON 模式
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message });

    const content = data.choices[0]?.message?.content;
    return res.status(200).json(JSON.parse(content));

  } catch (err: any) {
    return res.status(500).json({ error: 'Groq 執行異常: ' + err.message });
  }
}
