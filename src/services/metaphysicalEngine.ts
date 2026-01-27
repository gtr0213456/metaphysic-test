export interface MetaphysicResult {
  personal: {
    bazi: { pillars: string[]; analysis: string; elements: string };
    humanDesign: { type: string; authority: string; strategy: string; profile: string };
    tzolkin: { kin: string; totem: string; energy: string };
    numerology: { 
      lifeNum: number; grid: number[]; arrows: string[];
      name81: { strokes: number; luck: string; analysis: string };
      luckyColor: string 
    };
  };
  relationship?: any;
  dailyAdvice: string;
}

export class MetaphysicalEngine {
  static async getFullAnalysis(user: { name: string; birthday: string }, partner?: any): Promise<MetaphysicResult> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    // 🔥 遵循最新公告：使用 v1beta 端點並指定最新模型
    // 如果你想用最新的 Gemini 3，請將 model 名稱改為: gemini-3-flash-preview
    const MODEL_ID = "gemini-1.5-flash"; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`;

    const prompt = `你是一位精通玄學的 AI Aetheris。
    請分析姓名：${user.name}，生日：${user.birthday}。
    
    要求：
    1. 嚴格輸出 JSON 格式。
    2. 包含八字(四柱)、人類圖(類型/權威)、生命靈數(九宮格)、姓名學(81數)。
    
    JSON 結構：
    {"personal":{"bazi":{"pillars":["","","",""],"analysis":"","elements":""},"humanDesign":{"type":"","authority":"","strategy":"","profile":""},"tzolkin":{"kin":"","totem":"","energy":""},"numerology":{"lifeNum":5,"grid":[0,1,0,0,0,1,0,0,0,0],"arrows":[],"name81":{"strokes":20,"luck":"吉","analysis":""},"luckyColor":""}},"dailyAdvice":""}`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // 啟用最新公告中推薦的「受控輸出」模式
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`[維度坍塌] ${response.status}: ${errorData.error?.message || 'API 拒絕連結'}`);
      }

      const data = await response.json();
      
      // 提取內容並解析
      const candidates = data.candidates || [];
      if (candidates.length === 0) throw new Error("宇宙未給予回應");
      
      const rawText = candidates[0].content.parts[0].text;
      return JSON.parse(rawText) as MetaphysicResult;

    } catch (e: any) {
      console.error("Metaphysical Engine Critical Error:", e);
      throw e;
    }
  }
}
