const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inisialisasi API (API Key simpan di .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseTaskFromText = async (userText) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Prompt Engineering (Kunci keberhasilan AI)
        const prompt = `
            Act as a Task Parser API. 
            Current date: ${today}.
            
            Extract task details from this text: "${userText}".
            
            Rules:
            1. Convert relative time (besok, lusa, jumat depan) to specific 'YYYY-MM-DD HH:mm:ss'.
            2. If no time provided, default to '23:59:00'.
            3. Classify 'priority_level': 
               - 'do_first' (urgent words detected), 
               - 'schedule' (default), 
               - 'delegate' (trivial), 
               - 'eliminate'.
            
            Return ONLY a raw JSON string (no markdown, no backticks) with keys: 
            title, subject, deadline, priority_level.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Bersihkan string jika AI menambahkan format markdown json
        const cleanJson = text.replace(/```json|```/g, '').trim();
        
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("AI Parsing Error:", error);
        throw new Error("Gagal memproses teks tugas.");
    }
};

module.exports = { parseTaskFromText };