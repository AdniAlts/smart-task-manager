const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inisialisasi API dengan Key dari .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseTaskFromText = async (userText) => {
    try {
        // Gunakan model yang cepat dan hemat (Gemini 1.5 Flash)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Dapatkan tanggal hari ini untuk konteks AI (agar 'besok' valid)
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        const currentDay = new Date().toLocaleDateString('id-ID', { weekday: 'long' });

        // Prompt Engineering: Instruksi agar AI patuh
        const prompt = `
            Act as a Task Extraction API.
            Current context: Today is ${currentDay}, ${today}.
            
            User Input: "${userText}"
            
            Task: Extract task details into a STRICT JSON format.
            Rules:
            1. 'subject': Infer the course name/subject. If unclear, use 'General'.
            2. 'title': Short summary of the task.
            3. 'deadline': Convert relative dates (e.g., 'besok', 'jumat depan', 'minggu depan') to 'YYYY-MM-DD HH:mm:ss'. 
               - If time is missing, assume '23:59:00'.
               - If no date is mentioned, set it to tomorrow's date.
            4. 'priority_level': Analyze urgency words.
               - 'do_first': (penting, segera, ujian, besar, susah, mendesak, gila, ga masuk akal)
               - 'schedule': (standar, kumpul minggu depan)
               - 'delegate': (kelompok, mudah)
               - 'eliminate': (catatan, opsional)
               - Default: 'schedule'
            5. 'description': Keep original details or summary.

            Output ONLY raw JSON string (no markdown, no \`\`\`).
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Bersihkan formatting jika AI masih bandel ngasih markdown
        const cleanJson = text.replace(/```json|```/g, '').trim();
        
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("AI Service Error:", error);
        // Fallback jika AI error/limit habis, kembalikan data kosong agar tidak crash
        return {
            title: userText.substring(0, 20) + "...",
            subject: "General",
            deadline: new Date().toISOString().slice(0, 19).replace('T', ' '),
            priority_level: "schedule",
            description: "Manual check required. AI failed to parse."
        };
    }
};

module.exports = { parseTaskFromText };