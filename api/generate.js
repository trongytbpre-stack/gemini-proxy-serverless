const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

    try {
        const { systemPrompt, userQuery } = req.body;

        if (!userQuery)
            return res.status(400).json({ error: "Missing userQuery in body" });

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash", 

            system_instruction: {
                role: "system",
                parts: [{ text: systemPrompt || "Bạn là trợ lý AI." }]
            },

            contents: [
                {
                    role: "user",
                    parts: [{ text: userQuery }]
                }
            ],

            generation_config: {
                temperature: 0.7
            }
        });

        const text =
            response.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return res.status(200).json({ text });

    } catch (err) {
        console.error("Gemini error:", err);
        return res.status(500).json({ error: "Gemini API error" });
    }
};
