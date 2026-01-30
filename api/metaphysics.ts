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
    // 拆成獨立小 Prompt 呼叫
    const bazi = await callGroq(apiKey, getBaziPrompt(user, partner));
    const ziwei = await callGroq(apiKey, getZiweiPrompt(user, partner));
    const nameAnalysis = await callGroq(apiKey, getNameAnalysisPrompt(user, partner));
    const humanDesign = await callGroq(apiKey, getHumanDesignPrompt(user, partner));
    const tzolkin = await callGroq(apiKey, getTzolkinPrompt(user, partner));

    // 剩餘部分用原大 Prompt 的 dailyAdvice + luckyIndicators（可後續拆）
    const general = await callGroq(apiKey, getGeneralPrompt(user, partner));

    // 交叉驗證邏輯（簡單規則，可擴充）
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
          // numerology 暫用 general 的（後續拆）
          numerology: general.numerology || { lifeNum: 0, grid: [], arrows: [], personalYear: "" },
          tzolkin
        }
      },
      relationship: general.relationship || {}, // 暫用
      dailyAdvice: general.dailyAdvice || "",
      luckyIndicators: general.luckyIndicators || { color: "", direction: "", action: [] },
      confidence  // 新增：一致度資訊
    };

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Groq API error:', err);
    return res.status(500).json({ error: '維度連結超時或模型忙碌，請稍後重試' });
  }
}

// 共用呼叫 Groq 函式
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
    const errData = await response.json();
    throw new Error(errData.error?.message || 'Groq request failed');
  }

  const data = await response.json();
  return JSON.parse(data.choices[0]?.message?.content || '{}');
}

// 各系統專屬小 Prompt（精簡版，只算該系統）
function getBaziPrompt(user: any, partner?: any) {
  return `你是八字專家。只計算用戶 ${user.name}（生日：${user.birthday}）的八字。${
    partner ? `合盤對象：${partner.name}（${partner.birthday}）。` : ''
  }嚴格輸出 JSON：{"pillars": ["年柱", "月柱", "日柱", "時柱"], "strength": "身強/身弱描述", "favorable": "喜用神", "analysis": "50-100字專業分析"}。僅 JSON。`;
}

function getZiweiPrompt(user: any, partner?: any) {
  return `你是紫微斗數專家。只計算用戶 ${user.name}（生日：${user.birthday}）的紫微命盤。${
    partner ? `合盤對象：${partner.name}（${partner.birthday}）。` : ''
  }輸出 JSON：{"mainStars": "主星名稱", "palace": "命宮位置", "luck": "流年運勢解析"}。僅 JSON。`;
}

function getNameAnalysisPrompt(user: any, partner?: any) {
  return `你是姓名學專家。只計算用戶 ${user.name} 的姓名學五格。輸出 JSON：{"strokes": 總筆劃, "fiveGrids": {"heaven":數字, "man":數字, "earth":數字, "out":數字, "total":數字}, "luck81": "81數解析", "threeTalents": "三才影響"}。僅 JSON。`;
}

function getHumanDesignPrompt(user: any, partner?: any) {
  return `你是 Human Design 專家。只計算用戶 ${user.name}（生日：${user.birthday}）的類型。輸出 JSON：{"type": "類型", "authority": "權威", "strategy": "策略", "profile": "角色", "channels": ["通道1", "通道2"], "analysis": "50-100字靈魂藍圖解析"}。僅 JSON。`;
}

function getTzolkinPrompt(user: any, partner?: any) {
  return `你是卓爾金專家。只計算用戶 ${user.name}（生日：${user.birthday}）的卓爾金。輸出 JSON：{"kin": "Kin號", "totem": "圖騰", "tone": "調性", "wave": "波符", "analysis": "瑪雅曆靈性指引"}。僅 JSON。`;
}

function getGeneralPrompt(user: any, partner?: any) {
  return `你是玄學 AI。只計算每日建議與幸運指標。用戶：${user.name}（${user.birthday}）。${
    partner ? `合盤：${partner.name}（${partner.birthday}）。` : ''
  }輸出 JSON：{"dailyAdvice": "今日建議", "luckyIndicators": {"color": "色", "direction": "方", "action": ["行動1", "行動2"]}, "relationship": {"syncScore":數字, "harmony": "描述", "advice": "建議", "warning": "警示", "communicationTone": "語調"}}。僅 JSON。`;
}

// 交叉驗證函式（簡單規則，可擴充）
function calculateConfidence(results: any) {
  let score = 0;

  // 範例規則：可根據實際邏輯調整
  if (results.bazi?.strength?.includes('強') && results.ziwei?.luck?.includes('吉')) score++;
  if (results.humanDesign?.type === 'Generator' && results.tzolkin?.tone?.includes('高')) score++;
  if (results.nameAnalysis?.luck81?.includes('吉')) score++;

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
