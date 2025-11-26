// Đây là mã Serverless Function được triển khai trên Vercel/Netlify

const { GoogleGenAI } = require("@google/genai");

// Lấy Key API dài hạn từ Biến Môi Trường (Environment Variable)
// KHÓA NÀY ĐƯỢC BẢO VỆ TUYỆT ĐỐI VÀ KHÔNG HẾT HẠN SAU 24 GIỜ
const apiKey = process.env.GEMINI_API_KEY; 

// Khởi tạo Gen AI client
const ai = new GoogleGenAI({ apiKey });

/**
 * Hàm xử lý chính cho Serverless Function.
 * @param {object} req - Đối tượng yêu cầu (Request object)
 * @param {object} res - Đối tượng phản hồi (Response object)
 */
module.exports = async (req, res) => {
    // Thiết lập CORS để cho phép Client (GitHub Pages) gọi đến
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Xử lý preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Chỉ chấp nhận phương thức POST." });
    }

    if (!apiKey) {
        return res.status(500).json({ error: "Thiếu GEMINI_API_KEY trong biến môi trường server. Hãy kiểm tra cài đặt Vercel." });
    }

    try {
        const { systemPrompt, userQuery } = req.body; 

        if (!userQuery) {
            return res.status(400).json({ error: "Thiếu tham số 'userQuery' trong body yêu cầu." });
        }

        // Gọi API Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-09-2025',
            systemInstruction: { parts: [{ text: systemPrompt || "Bạn là một trợ lý AI hữu ích." }] },
            contents: [{ parts: [{ text: userQuery }] }],
        });

        const generatedText = response.text;

        // Trả kết quả về cho Client
        return res.status(200).json({ text: generatedText });

    } catch (error) {
        console.error("Lỗi khi gọi API Gemini:", error);
        // Trả lỗi về cho Client
        return res.status(500).json({ error: "Lỗi nội bộ khi gọi API Gemini. Có thể Key đã bị thu hồi hoặc đã hết hạn." });
    }
};