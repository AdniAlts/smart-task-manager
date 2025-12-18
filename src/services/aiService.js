const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inisialisasi API dengan Key dari .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseTaskFromText = async (userText) => {
    try {
        // Gunakan model yang cepat dan hemat (Gemini 2.5 Flash)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Dapatkan konteks waktu lengkap untuk AI
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // Format YYYY-MM-DD
        const currentDay = now.toLocaleDateString('id-ID', { weekday: 'long' });
        const currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const currentMonth = now.toLocaleDateString('id-ID', { month: 'long' });
        const currentYear = now.getFullYear();

        // Advanced Prompt Engineering dengan Chain-of-Thought
        const prompt = `
You are an intelligent Task Parser AI for a Smart Student Task Manager app. Your job is to extract structured task information from natural language input in Bahasa Indonesia or English.

## CURRENT CONTEXT
- Today: ${currentDay}, ${today}
- Current Time: ${currentTime}
- Month: ${currentMonth} ${currentYear}

## USER INPUT
"${userText}"

## EXTRACTION RULES

### 1. SUBJECT (Mata Kuliah/Subject)
Identify the academic subject or category. Use context clues:
- Course names: "Algoritma", "Kalkulus", "PBO", "Basis Data", "Jarkom", "AI", "Web Programming", "Mobile Dev", etc.
- Keywords mapping:
  * "coding/program/function/class/OOP" → "Programming"
  * "matematika/integral/turunan/limit" → "Matematika"  
  * "database/SQL/query/tabel" → "Basis Data"
  * "jaringan/network/IP/router" → "Jaringan Komputer"
  * "essay/paper/jurnal/artikel" → "Penulisan Ilmiah"
  * "presentasi/PPT/slides" → Based on topic or "Presentation"
- If no clear subject, use "General"

### 2. TITLE (Judul Task)
Create a concise, actionable title (3-8 words):
- Start with action verb when possible: "Kerjakan", "Buat", "Pelajari", "Review", "Submit"
- Include key deliverable: "Tugas 3 Algoritma", "Quiz Basis Data", "Laporan Praktikum"
- Remove filler words but keep essential info

### 3. DEADLINE (Tenggat Waktu) → Format: "YYYY-MM-DD HH:mm:ss"
Parse relative dates intelligently:
- "hari ini/today" → ${today}
- "besok/tomorrow" → tomorrow's date
- "lusa" → day after tomorrow
- "minggu depan/next week" → +7 days
- "jumat depan" → next Friday from today
- "tanggal 20" → 20th of current/next month (whichever is future)
- "akhir bulan" → last day of current month
- "2 hari lagi" → +2 days

Time parsing:
- "pagi" → 08:00:00
- "siang" → 12:00:00  
- "sore" → 16:00:00
- "malam" → 20:00:00
- "jam 10" → 10:00:00
- "sebelum jam 3" → 14:59:00
- No time mentioned → 23:59:00 (end of day)
- No date mentioned → tomorrow 23:59:00

### 4. PRIORITY_LEVEL (Eisenhower Matrix)
Analyze urgency AND importance:

**"do_first"** (Urgent + Important) - Keywords:
- Urgency: "segera", "ASAP", "hari ini", "besok pagi", "deadline mepet", "telat"
- Importance: "ujian", "UTS", "UAS", "nilai besar", "wajib", "crucial", "50%", "final"
- Difficulty: "susah banget", "kompleks", "butuh waktu lama"
- Emotional: "stress", "panik", "gawat", "mampus", "bahaya"

**"schedule"** (Important, Not Urgent) - Default for most tasks:
- "minggu depan", "bulan depan", "masih lama"
- Regular assignments without urgency markers
- "tugas mingguan", "project semester"

**"delegate"** (Urgent, Less Important) - Can get help:
- "kelompok", "tim", "bareng", "bagi tugas"
- "gampang", "mudah", "simple", "cuma..."
- Tasks that can be split or shared

**"eliminate"** (Neither Urgent nor Important):
- "opsional", "bonus", "tambahan nilai"
- "kalau sempat", "kalau mau"
- "catatan", "notes", "referensi"
- "nanti aja", "kapan-kapan"

### 5. DESCRIPTION (Deskripsi)
Create a helpful description:
- Preserve specific requirements from input (pages, format, topics)
- Add inferred context if helpful
- Include any mentioned resources or references
- Keep it concise but complete (1-3 sentences)

## OUTPUT FORMAT
Return ONLY a valid JSON object with these exact keys:
{
  "subject": "string",
  "title": "string", 
  "deadline": "YYYY-MM-DD HH:mm:ss",
  "priority_level": "do_first|schedule|delegate|eliminate",
  "description": "string"
}

No markdown, no code blocks, no explanation. Just the JSON object.
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