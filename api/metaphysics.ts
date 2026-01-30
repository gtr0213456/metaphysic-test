import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ... 你原有 CORS 和 method 檢查

  const { user, partner } = req.body;

  try {
    // 先用公式算靜態數字
    const numerologyStatic = calculateNumerology(user.birthday); // 生命靈數公式
    const nameAnalysisStatic = calculateNameAnalysis(user.name); // 81靈動公式

    // 再呼叫 Groq，只生成描述
    const bazi = await callGroq(apiKey, getBaziPrompt(user, partner));
    const ziwei = await callGroq(apiKey, getZiweiPrompt(user, partner));
    const nameAnalysisDesc = await callGroq(apiKey, getNameAnalysisDescPrompt(user, nameAnalysisStatic)); // 只生成描述
    const humanDesign = await callGroq(apiKey, getHumanDesignPrompt(user, partner));
    const numerologyDesc = await callGroq(apiKey, getNumerologyDescPrompt(user, numerologyStatic)); // 只生成描述
    const tzolkin = await callGroq(apiKey, getTzolkinPrompt(user, partner));

    // 交叉驗證
    const confidence = calculateConfidence({ bazi, ziwei, humanDesign, tzolkin });

    const result = {
      personal: {
        eastern: {
          bazi,
          ziwei,
          nameAnalysis: { ...nameAnalysisStatic, ...nameAnalysisDesc } // 合併公式 + 描述
        },
        western: {
          humanDesign,
          numerology: { ...numerologyStatic, ...numerologyDesc }, // 合併
          tzolkin
        }
      },
      // ... 其他
      confidence
    };

    return res.status(200).json(result);
  } catch (err: any) {
    // ... 錯誤處理
  }
}

// 新增公式函式（生命靈數）
function calculateNumerology(birthday: string) {
  const [year, month, day] = birthday.split('-').map(Number);
  let sum = year + month + day;
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((a, b) => Number(a) + Number(b), 0);
  }
  return { lifeNum: sum, grid: [], arrows: [], personalYear: '' }; // grid/arrows/personalYear 暫空，後續加
}

// 新增公式函式（姓名學 + 81靈動）
function calculateNameAnalysis(name: string) {
  // 假設簡體中文筆劃計算（需實際筆劃表）
  const strokes = name.split('').reduce((total, char) => total + getStrokes(char), 0); // getStrokes 是筆劃函式
  const heaven = /* 姓筆劃 + 1 */;
  const man = /* 姓末 + 名首 */;
  const earth = /* 名筆劃 */;
  const out = /* 名末 + 1 */;
  const total = heaven + man + earth;
  const luck81 = get81Luck(total % 81); // 81表查詢函式

  return {
    strokes,
    fiveGrids: { heaven, man, earth, out, total },
    luck81: '', // 公式算數字，AI生成描述
    threeTalents: ''
  };
}

// 範例筆劃/81表函式（你可擴充）
function getStrokes(char: string) { // 簡易表，實際用完整字典
  const strokesTable: { [key: string]: number } = { '王': 4, '小': 3 /* ... */ };
  return strokesTable[char] || 0;
}

function get81Luck(num: number) { // 81表簡例
  if (num === 1) return '大吉';
  if (num === 81) return '中下運'; // 你的例子
  return '未知';
}

// 修改子 Prompt（AI 只生成描述，不算數字）
function getNumerologyDescPrompt(user: any, staticData: any) {
  return `你是數字命理專家。只生成用戶 ${user.name} 的生命靈數描述。已知 lifeNum: ${staticData.lifeNum}。輸出 JSON：{"personalYear": "今年流年解析", "analysis": "50-100字"}。僅 JSON。`;
}

function getNameAnalysisDescPrompt(user: any, staticData: any) {
  return `你是姓名學專家。只生成用戶 ${user.name} 的姓名學描述。已知 fiveGrids: ${JSON.stringify(staticData.fiveGrids)}。輸出 JSON：{"luck81": "靈動數解析", "threeTalents": "三才影響"}。僅 JSON。`;
}

// ... 其他子 Prompt 類似，只生成 "analysis" 或 "luck" 描述

// 交叉驗證函式（保留）
function calculateConfidence(results: any) {
  // ... 你原有邏輯
}
