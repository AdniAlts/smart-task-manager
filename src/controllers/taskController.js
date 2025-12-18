const aiService = require('../services/tol');
const taskModel = require('../models/taskModel');

// 1. Endpoint A: Hanya untuk Preview/Analisa (Belum Save)
// Route: POST /api/tasks/analyze
const analyzeText = async (req, res) => {
    try {
        const { raw_text } = req.body;

        if (!raw_text) {
            return res.status(400).json({ message: "Teks tidak boleh kosong" });
        }

        // Panggil AI Service (Logic sama seperti sebelumnya)
        const parsedData = await aiService.parseTaskFromText(raw_text);

        // Kembalikan JSON ke Frontend untuk ditampilkan di Form
        res.status(200).json({
            message: "Analisa berhasil. Silakan konfirmasi.",
            data: parsedData 
        });

    } catch (error) {
        res.status(500).json({ message: "Gagal menganalisa teks: " + error.message });
    }
};

// 2. Endpoint B: Simpan Data Final (Manual atau Hasil AI)
// Route: POST /api/tasks
const createTask = async (req, res) => {
    try {
        // Data ini dikirim oleh Frontend setelah User klik "Simpan"
        const { user_id, title, subject, deadline, priority_level, description } = req.body;

        // Validasi Sederhana
        if (!title || !deadline) {
            return res.status(400).json({ message: "Judul dan Deadline wajib diisi." });
        }

        // Simpan ke Database (MySQL)
        const taskId = await taskModel.create({
            user_id,
            title,
            subject,
            deadline, // Pastikan format YYYY-MM-DD HH:mm:ss dari frontend
            priority_level,
            description
        });

        res.status(201).json({
            message: "Tugas berhasil disimpan!",
            task_id: taskId
        });

    } catch (error) {
        res.status(500).json({ message: "Database Error: " + error.message });
    }
};

module.exports = { analyzeText, createTask };