// Đây là mã Serverless Function được triển khai trên Vercel/Netlify

// Sử dụng phiên bản ổn định mới nhất của thư viện
const { GoogleGenAI } = require("@google/genai");

// Lấy Key API dài hạn từ Biến Môi Trường (Environment Variable)
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
        // Vercel tự động phân tích JSON body
        const { systemPrompt, userQuery } = req.body; 

        if (!userQuery) {
            return res.status(400).json({ error: "Thiếu tham số 'userQuery' trong body yêu cầu." });
        }

        // Tạo cấu trúc contents
        const contents = [{ parts: [{ text: userQuery }] }];
        
        // Tạo cấu trúc generationConfig
        const config = {
            systemInstruction: { parts: [{ text: systemPrompt || "Bạn là một trợ lý AI hữu ích." }] }
        };

        // Gọi API Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-09-2025',
            ...config,
            contents: contents,
        });

        // Lấy nội dung từ phản hồi
        const generatedText = response.text;

        // Trả kết quả về cho Client
        return res.status(200).json({ text: generatedText });

    } catch (error) {
        console.error("Lỗi khi gọi API Gemini:", error);
        // Trả lỗi về cho Client
        return res.status(500).json({ error: "Lỗi nội bộ khi gọi API Gemini. Vui lòng kiểm tra Key API và quota." });
    }
};