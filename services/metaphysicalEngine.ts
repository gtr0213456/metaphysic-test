static async getFullAnalysis(user: any, partner?: any): Promise<any> {
  const isRel = !!partner;
  const prompt = `
    你是一位靈性科技導師。請根據以下數據進行 JSON 格式分析：
    - 主體：${user.name} (${user.birthday})
    ${isRel ? `- 對象：${partner.name} (${partner.birthday})` : ''}

    請嚴格回傳以下 JSON 格式：
    {
      "bazi": { "pillars": ["年柱", "月柱", "日柱", "時柱"], "insight": "八字五行解析" },
      "humanDesign": { "type": "類型", "authority": "權威", "profile": "人生角色" },
      "tzolkin": { "kin": "KIN編號", "totem": "圖騰名稱" },
      "relationship": ${isRel ? '{ "score": 85, "harmony": "共振描述" }' : 'null'},
      "dailyAdvice": "今日能量指引"
    }
    注意：不要有任何 Markdown 代碼塊標籤，直接給出 JSON。
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // 移除 AI 可能加上的 ```json 標籤
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("解析失敗", e);
    return null;
  }
}
