// Vercel Serverless Function (Node.js runtime)
export default async function handler(req: any, res: any) {
  // 只允許 POST 請求
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY; // 🔒 注意：這裡不用 VITE_ 前綴，更安全
  const { user, partner } = req.body;

  const isRel = !!(partner && partner.name);
  const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner.name}，生日：${partner.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式，包含完整玄學分析。`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.8 }
        })
      }
    );

    const data = await response.json();
    
    // 如果 Google 報錯，我們只回傳簡短訊息，保護內部細節
    if (!response.ok) throw new Error(data.error?.message || "Google API Error");

    const rawText = data.candidates[0].content.parts[0].text;
    res.status(200).json(JSON.parse(rawText));

  } catch (error: any) {
    console.error("Backend Error:", error.message);
    res.status(500).json({ error: "維度連結中斷，請聯繫管理員" });
  }
}
