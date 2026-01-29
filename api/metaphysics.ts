import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS 設置
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: '尚未設定 GROQ_API_KEY' });

  const { user, partner } = req.body;

  // 💡 關鍵：給予極其嚴格的格式範例
  const formatExample = {
    personal: {
      eastern: {
        bazi: { pillars: ["甲子", "乙丑", "丙寅", "丁卯"], strength: "中和", favorable: "水木", analysis: "..." },
        ziwei: { mainStars: "紫微天府", palace: "命宮", luck: "大吉" },
        nameAnalysis: { strokes: 25, fiveGrids: { heaven: 10, man: 15, earth: 10, out: 5, total: 25 }, luck81: "吉", threeTalents: "平" }
      },
      western: {
        humanDesign: { type: "生產者", authority: "薦骨", strategy: "等待回應", profile: "4/6", channels: ["10-57"] },
        numerology: { lifeNum: 7, grid: [1, 2, 3], arrows: ["123"], personalYear: "2026" },
        tzolkin: { kin: "Kin 1", totem: "紅龍", tone: "磁性", wave: "紅龍波" }
      }
    },
    dailyAdvice: "宜專注",
    luckyIndicators: { color: "紅色", direction: "東方", action: ["閱讀", "冥想"] }
  };

  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${partner?.name ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：你必須「嚴格」按照以下 JSON 結構輸出分析結果，不可增減欄位：
    ${JSON.stringify(formatExample)}
    
    請直接回傳 JSON 物件，不要有任何 Markdown 標籤或解釋。`;

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
          { role: "system", content: "You are a metaphysics expert. Output ONLY raw JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5, // 降低隨機性，讓格式更穩定
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message });

    let content = data.choices[0]?.message?.content;
    
    // 雙重保險：如果 AI 還是吐了 Markdown
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsedData = JSON.parse(content);

    // 🛑 最終檢查：如果缺少關鍵欄位，補上預設值防止前端噴錯
    if (!parsedData.luckyIndicators) {
      parsedData.luckyIndicators = { color: "未知", direction: "未知", action: [] };
    }

    return res.status(200).json(parsedData);

  } catch (err: any) {
    console.error("解析失敗:", err.message);
    return res.status(500).json({ error: '數據解析異常，請再試一次' });
  }
}
