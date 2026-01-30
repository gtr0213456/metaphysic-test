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

  const { user, partner } = req.body || {};

  if (!user || !user.name || !user.birthday) {
    return res.status(400).json({ error: '缺少用戶姓名或生日' });
  }

  try {
    const results: any = {};

    // 逐個呼叫，獨立 try-catch 防單一失敗影響全部
    const prompts = [
      { key: 'bazi', prompt: getBaziPrompt(user, partner) },
      { key: 'ziwei', prompt: getZiweiPrompt(user, partner) },
      { key: 'nameAnalysis', prompt: getNameAnalysisPrompt(user, partner) },
      { key: 'humanDesign', prompt: getHumanDesignPrompt(user, partner) },
      { key: 'tzolkin', prompt: getTzolkinPrompt(user, partner) },
      { key: 'general', prompt: getGeneralPrompt(user, partner) }
    ];

    for (const { key, prompt } of prompts) {
      try {
        results[key] = await callGroq(apiKey, prompt);
      } catch (e) {
        console.error(`${key} failed:`, e);
        results[key] = {}; // fallback 空物件
      }
    }

    const confidence = calculateConfidence(results);

    const result = {
      personal: {
        eastern: {
          bazi: results.bazi || {},
          ziwei: results.ziwei || {},
          nameAnalysis: results.nameAnalysis || {}
        },
        western: {
          humanDesign: results.humanDesign || {},
          numerology: results.general?.numerology || { lifeNum: 0, grid: [], arrows: [], personalYear: "" },
          tzolkin: results.tzolkin || {}
        }
      },
      relationship: results.general?.relationship || {},
      dailyAdvice: results.general?.dailyAdvice || "暫時無法生成，請重試",
      luckyIndicators: results.general?.luckyIndicators || { color: "未知", direction: "未知", action: ["請重試"] },
      confidence
    };

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message || '伺服器錯誤，請稍後重試' });
  }
}

// 呼叫 Groq（加強 JSON 解析防呆）
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
        { role: "system", content: "You are Aetheris. Respond ONLY with valid JSON, no other text, no markdown." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,  // 降低到 0.3 減少變異
      max_tokens: 500,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errData = await response.text();
    throw new Error(`Groq error: ${response.status} - ${errData}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '{}';

  try {
    return JSON.parse(content);
  } catch (parseErr) {
    console.error('JSON parse failed:', parseErr, content);
    return {};
  }
}

// 你的子 Prompt 函式（保持原樣，或確認完整）

// 交叉驗證（防 undefined）
function calculateConfidence(results: any) {
  let score = 0;
  try {
    if (results.bazi?.strength && results.bazi.strength.includes('強')) score++;
    if (results.ziwei?.luck && results.ziwei.luck.includes('吉')) score++;
    if (results.humanDesign?.type && results.humanDesign.type === 'Generator') score++;
    if (results.tzolkin?.tone && results.tzolkin.tone.includes('高')) score++;
  } catch (e) {
    console.error('Confidence error:', e);
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

// 其他 Prompt 函式（請確保你有完整定義，如果遺漏會回 {}）
