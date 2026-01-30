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

  try {
    // 拆分呼叫 + 防崩潰
    let bazi = {};
    let ziwei = {};
    let nameAnalysis = {};
    let humanDesign = {};
    let tzolkin = {};
    let general = {};

    try { bazi = await callGroq(apiKey, getBaziPrompt(user, partner)); } catch (e) { console.error('Bazi error:', e); }
    try { ziwei = await callGroq(apiKey, getZiweiPrompt(user, partner)); } catch (e) { console.error('Ziwei error:', e); }
    try { nameAnalysis = await callGroq(apiKey, getNameAnalysisPrompt(user, partner)); } catch (e) { console.error('NameAnalysis error:', e); }
    try { humanDesign = await callGroq(apiKey, getHumanDesignPrompt(user, partner)); } catch (e) { console.error('HumanDesign error:', e); }
    try { tzolkin = await callGroq(apiKey, getTzolkinPrompt(user, partner)); } catch (e) { console.error('Tzolkin error:', e); }
    try { general = await callGroq(apiKey, getGeneralPrompt(user, partner)); } catch (e) { console.error('General error:', e); }

    const confidence = calculateConfidence({ bazi, ziwei, humanDesign, tzolkin });

    const result = {
      personal: {
        eastern: {
          bazi,
          ziwei,
          nameAnalysis
        },
        western: {
          humanDesign,
          numerology: general.numerology || { lifeNum: 0, grid: [], arrows: [], personalYear: "" },
          tzolkin
        }
      },
      relationship: general.relationship || {},
      dailyAdvice: general.dailyAdvice || "無法生成建議，請重試",
      luckyIndicators: general.luckyIndicators || { color: "未知", direction: "未知", action: ["請稍後重試"] },
      confidence
    };

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Metaphysics handler error:', err);
    return res.status(500).json({ error: err.message || '維度連結超時或模型忙碌，請稍後重試' });
  }
}

// 共用呼叫 Groq（已存在）
async function callGroq(apiKey: string, prompt: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are Aetheris, a professional metaphysics AI. Always respond in valid JSON only, no extra text." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Groq request failed');
  }

  const data = await response.json();
  let content = data.choices[0]?.message?.content || '{}';
  try {
    return JSON.parse(content);
  } catch (parseErr) {
    console.error('JSON parse error:', parseErr, content);
    return {};
  }
}

// 你的子 Prompt 函式（保持原樣，或確認是否遺漏）

// 交叉驗證（保持原樣，或簡化防 undefined）
function calculateConfidence(results: any) {
  let score = 0;
  try {
    if (results.bazi?.strength?.includes('強') && results.ziwei?.luck?.includes('吉')) score++;
    if (results.humanDesign?.type === 'Generator' && results.tzolkin?.tone?.includes('高')) score++;
    if (results.nameAnalysis?.luck81?.includes('吉')) score++;
  } catch (e) {
    console.error('Confidence calc error:', e);
  }

  let level = '低';
  let msg = '僅1系統支持，僅供參考';
  if (score >= 3) {
    level = '高';
    msg = '3+ 系統一致，強建議';
  } else if (score === 2) {
    level = '中';
    msg = '2 系統一致，中度建議';
  }

  return { level, score, msg };
}
