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
    // ==================== 純公式計算（固定不變） ====================
    const nameAnalysisStatic = calculateNameGrids(user.name);
    const numerologyStatic = calculateLifeNumber(user.birthday);

    // ==================== AI 只負責描述 ====================
    const bazi = await safeCallGroq(apiKey, getBaziPrompt(user, partner));
    const ziwei = await safeCallGroq(apiKey, getZiweiPrompt(user, partner));
    const humanDesign = await safeCallGroq(apiKey, getHumanDesignPrompt(user, partner));
    const tzolkin = await safeCallGroq(apiKey, getTzolkinPrompt(user, partner));
    const general = await safeCallGroq(apiKey, getGeneralPrompt(user, partner));

    // 姓名學 + 生命靈數：公式結果 + AI 描述合併
    const nameAnalysis = {
      ...nameAnalysisStatic,
      analysis: general.nameAnalysis?.analysis || "姓名學分析"
    };

    const numerology = {
      ...numerologyStatic,
      personalYear: general.numerology?.personalYear || "今年流年解析",
      analysis: general.numerology?.analysis || "生命靈數解析"
    };

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
          numerology,
          tzolkin
        }
      },
      relationship: general.relationship || {},
      dailyAdvice: general.dailyAdvice || "暫時無法生成建議，請稍後重試",
      luckyIndicators: general.luckyIndicators || { color: "未知", direction: "未知", action: ["請重試"] },
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
          { role: "system", content: "You are Aetheris. Respond ONLY with valid JSON, no extra text." },
          { role: "user", content: prompt }
        ],
        temperature: 0.35,
        max_tokens: 600,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error(`Groq ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (e) {
    console.error('safeCallGroq failed:', e);
    return {};
  }
}

// ====================== 純公式計算 ======================

// 1. 生命靈數（固定）
function calculateLifeNumber(birthday: string) {
  const digits = birthday.replace(/[^0-9]/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && ![11, 22, 33].includes(sum)) {
    sum = sum.toString().split('').reduce((a, b) => a + Number(b), 0);
  }
  return { lifeNum: sum };
}

// 2. 姓名學五格 + 81靈動（固定）
function calculateNameGrids(name: string) {
  // 目前簡易版（只支援常見字），後續可擴充完整筆劃表
  const strokesTable: { [key: string]: number } = {
    '張': 11, '少': 4, '榮': 14, '王': 4, '李': 7, '陳': 16, '林': 8,
    '黃': 12, '劉': 15, '楊': 13, /* 可繼續補充 */
  };

  let totalStrokes = 0;
  for (const char of name) {
    totalStrokes += strokesTable[char] || 0;
  }

  const heaven = (strokesTable[name[0]] || 0) + 1;
  const man = (strokesTable[name[0]] || 0) + (strokesTable[name[1]] || 0);
  const earth = totalStrokes - (strokesTable[name[0]] || 0);
  const out = (strokesTable[name[name.length - 1]] || 0) + 1;
  const total = heaven + man + earth - 1;   // 標準總格

  return {
    strokes: totalStrokes,
    fiveGrids: { heaven, man, earth, out, total },
    luck81: get81Luck(total),
    threeTalents: `${heaven % 10}-${man % 10}-${earth % 10}`
  };
}

// 81數理吉凶簡易表（可後續補完整）
function get81Luck(total: number) {
  const table: { [key: number]: string } = {
    29: '吉（智謀出眾，貴人相助）',
    15: '大吉',
    24: '大吉',
    81: '中下運',
    // 可繼續補
  };
  return table[total] || `中性（數理 ${total}）`;
}

// ====================== 子 Prompt（AI 只生成描述） ======================
function getBaziPrompt(user: any, partner?: any) { /* ... */ return `...`; }
function getZiweiPrompt(user: any, partner?: any) { /* ... */ return `...`; }
function getHumanDesignPrompt(user: any, partner?: any) { /* ... */ return `...`; }
function getTzolkinPrompt(user: any, partner?: any) { /* ... */ return `...`; }
function getGeneralPrompt(user: any, partner?: any) { /* ... */ return `...`; }

// ====================== 交叉驗證 ======================
function calculateConfidence(results: any) {
  let score = 0;
  if (results.bazi?.strength?.includes('強')) score++;
  if (results.ziwei?.luck?.includes('吉')) score++;
  if (results.humanDesign?.type === 'Generator') score++;
  if (results.tzolkin?.tone?.includes('高')) score++;

  let level = '低';
  let msg = '僅1系統支持，僅供參考';
  if (score >= 3) { level = '高'; msg = '3+ 系統一致，強建議'; }
  else if (score === 2) { level = '中'; msg = '2 系統一致，中度建議'; }

  return { level, score, msg };
}
