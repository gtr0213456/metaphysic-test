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
    let results: any = {};

    // 逐個呼叫，每個系統獨立，防單一失敗影響全部
    const promptFunctions = [
      { key: 'bazi', fn: getBaziPrompt },
      { key: 'ziwei', fn: getZiweiPrompt },
      { key: 'nameAnalysis', fn: getNameAnalysisPrompt },
      { key: 'humanDesign', fn: getHumanDesignPrompt },
      { key: 'tzolkin', fn: getTzolkinPrompt },
      { key: 'general', fn: getGeneralPrompt }
    ];

    for (const { key, fn } of promptFunctions) {
      try {
        const prompt = fn(user, partner);
        results[key] = await safeCallGroq(apiKey, prompt);
      } catch (e) {
        console.error(`${key} failed:`, e);
        results[key] = {};
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
      dailyAdvice: results.general?.dailyAdvice || "暫時無法生成建議，請稍後重試",
      luckyIndicators: results.general?.luckyIndicators || { color: "未知", direction: "未知", action: ["請重試"] },
      confidence
    };

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message || '伺服器錯誤，請稍後重試' });
  }
}

// ====================== 安全呼叫 Groq ======================
async function safeCallGroq(apiKey: string, prompt: string) {
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
          { role: "system", content: "You are Aetheris, a professional metaphysics AI. Respond ONLY with valid JSON, no extra text, no markdown." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 600,
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
  } catch (e) {
    console.error('safeCallGroq failed:', e);
    return {};
  }
}

// ====================== 子 Prompt 函式（完整定義） ======================
function getBaziPrompt(user: any, partner?: any) {
  return `你是八字專家。只計算用戶 ${user.name}（生日：${user.birthday}）的八字。${
    partner ? `合盤對象：${partner.name}（${partner.birthday}）。` : ''
  }嚴格輸出 JSON：{"pillars": ["年柱", "月柱", "日柱", "時柱"], "strength": "身強/身弱描述", "favorable": "喜用神", "analysis": "50-100字專業分析"}。僅 JSON，無其他文字。`;
}

function getZiweiPrompt(user: any, partner?: any) {
  return `你是紫微斗數專家。只計算用戶 ${user.name}（生日：${user.birthday}）的紫微命盤。${
    partner ? `合盤對象：${partner.name}（${partner.birthday}）。` : ''
  }輸出 JSON：{"mainStars": "主星名稱", "palace": "命宮位置", "luck": "流年運勢詳細解析"}。僅 JSON，無其他文字。`;
}

function getNameAnalysisPrompt(user: any, partner?: any) {
  return `你是姓名學專家。只計算用戶 ${user.name} 的姓名學五格。輸出 JSON：{"strokes": 總筆劃, "fiveGrids": {"heaven":數字, "man":數字, "earth":數字, "out":數字, "total":數字}, "luck81": "81數解析", "threeTalents": "三才影響"}。僅 JSON，無其他文字。`;
}

function getHumanDesignPrompt(user: any, partner?: any) {
  return `你是 Human Design 專家。只計算用戶 ${user.name}（生日：${user.birthday}）的類型。輸出 JSON：{"type": "類型", "authority": "權威", "strategy": "策略", "profile": "角色", "channels": ["通道1", "通道2"], "analysis": "50-100字靈魂藍圖解析"}。僅 JSON，無其他文字。`;
}

function getTzolkinPrompt(user: any, partner?: any) {
  return `你是卓爾金專家。只計算用戶 ${user.name}（生日：${user.birthday}）的卓爾金。輸出 JSON：{"kin": "Kin號", "totem": "圖騰", "tone": "調性", "wave": "波符", "analysis": "瑪雅曆靈性指引"}。僅 JSON，無其他文字。`;
}

function getGeneralPrompt(user: any, partner?: any) {
  return `你是玄學 AI。只計算每日建議與幸運指標。用戶：${user.name}（${user.birthday}）。${
    partner ? `合盤：${partner.name}（${partner.birthday}）。` : ''
  }輸出 JSON：{"dailyAdvice": "今日建議", "luckyIndicators": {"color": "建議色", "direction": "吉方", "action": ["具體建議行動1", "具體建議行動2"]}, "relationship": {"syncScore":數字, "harmony": "描述", "advice": "建議", "warning": "警示", "communicationTone": "語調"}}。僅 JSON，無其他文字。`;
}

// ====================== 交叉驗證 ======================
function calculateConfidence(results: any) {
  let score = 0;
  try {
    if (results.bazi?.strength?.includes('強')) score++;
    if (results.ziwei?.luck?.includes('吉')) score++;
    if (results.humanDesign?.type === 'Generator') score++;
    if (results.tzolkin?.tone?.includes('高')) score++;
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
