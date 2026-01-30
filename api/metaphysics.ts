import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: '尚未設定 GROQ_API_KEY' });

  const { user, partner } = req.body;

  // 💡 強化 Prompt：要求 AI 展現大師風範，增加分析細節
  const prompt = `你是一位融合東西方命理精髓、語氣高冷且精準的玄學 AI 導師 Aetheris。
    用戶資訊：${user.name}，生日：${user.birthday}。
    ${partner?.name ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}

    請針對以上資訊進行深度運算，並嚴格按以下 JSON 格式輸出。每個分析欄位請提供具備「專業度」與「文學感」的描述（約 50-100 字）：

    {
      "personal": {
        "eastern": {
          "bazi": { "pillars": ["年柱", "月柱", "日柱", "時柱"], "strength": "身強/身弱描述", "favorable": "喜用神", "analysis": "針對八字格局的深度事業與命運分析..." },
          "ziwei": { "mainStars": "主星名稱", "palace": "命宮位置", "luck": "流年運勢詳細解析..." },
          "nameAnalysis": { "strokes": 總筆劃, "fiveGrids": {"heaven":1, "man":1, "earth":1, "out":1, "total":1}, "luck81": "靈動數解析", "threeTalents": "三才配置對健康的影響..." }
        },
        "western": {
          "humanDesign": { "type": "類型", "authority": "權威", "strategy": "策略", "profile": "角色", "channels": ["通道1", "通道2"], "analysis": "針對能量中心與通道的深度靈魂藍圖解析..." },
          "numerology": { "lifeNum": 數字, "grid": [1,2,3], "arrows": ["連線"], "personalYear": "今年流年解析..." },
          "tzolkin": { "kin": "Kin號", "totem": "圖騰", "tone": "調性", "wave": "波符", "analysis": "瑪雅曆靈性指引..." }
        }
      },
      "dailyAdvice": "今日的戰略性建議，語氣要優雅且神祕...",
      "luckyIndicators": { "color": "建議色", "direction": "吉方", "action": ["具體建議行動1", "具體建議行動2"] }
    }
    
    注意：僅輸出 JSON，嚴禁任何標題或 Markdown。`;

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
          { role: "system", content: "You are Aetheris, a professional metaphysics AI. Always respond in valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message });

    const content = data.choices[0]?.message?.content;
    return res.status(200).json(JSON.parse(content));

  } catch (err: any) {
  console.error('Groq API error:', err);
  return res.status(500).json({ 
    error: '維度連結超時或模型忙碌，請稍後重試' 
  });
}
