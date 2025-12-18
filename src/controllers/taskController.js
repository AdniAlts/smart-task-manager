const taskModel = require('../models/taskModel');
const aiService = require('../services/aiService');

// 1. GET ALL TASKS
const getTasks = async (req, res) => {
    try {
        // Nanti user_id ini diambil dari token login. 
        // Untuk sekarang kita ambil dari query params atau hardcode 1 (dummy user)
        const userId = req.query.user_id || 1; 
        
        const tasks = await taskModel.getAllByUserId(userId);
        res.json({ data: tasks });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. CREATE TASK (Manual Input & Save AI Result)
const createTask = async (req, res) => {
    try {
        const { user_id, title, subject, description, deadline, priority_level } = req.body;

        // Validasi sederhana
        if (!title || !deadline) {
            return res.status(400).json({ message: "Judul dan Deadline wajib diisi" });
        }

        const newId = await taskModel.create({
            user_id: user_id || 1, // Default ke user 1 jika tidak ada
            title, 
            subject, 
            description, 
            deadline, 
            priority_level: priority_level || 'schedule'
        });

        // Return the created task data
        res.status(201).json({ 
            message: "Tugas berhasil dibuat", 
            data: {
                id: newId,
                user_id: user_id || 1,
                title,
                subject: subject || null,
                description: description || null,
                deadline,
                priority_level: priority_level || 'schedule',
                is_completed: false,
                created_at: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal membuat tugas", error: error.message });
    }
};

// 3. UPDATE TASK
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subject, description, deadline, priority_level, is_completed } = req.body;

        const affected = await taskModel.update(id, { 
            title, subject, description, deadline, priority_level, is_completed 
        });

        if (affected === 0) {
            return res.status(404).json({ message: "Tugas tidak ditemukan" });
        }

        // Return the updated fields
        res.json({ 
            message: "Tugas berhasil diupdate",
            data: { 
                id: parseInt(id),
                ...(title !== undefined && { title }),
                ...(subject !== undefined && { subject }),
                ...(description !== undefined && { description }),
                ...(deadline !== undefined && { deadline }),
                ...(priority_level !== undefined && { priority_level }),
                ...(is_completed !== undefined && { is_completed })
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal update tugas", error: error.message });
    }
};

// 4. DELETE TASK
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const affected = await taskModel.delete(id);

        if (affected === 0) {
            return res.status(404).json({ message: "Tugas tidak ditemukan" });
        }

        res.json({ message: "Tugas berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal hapus tugas", error: error.message });
    }
};

const analyzeText = async (req, res) => {
    try {
        const { raw_text } = req.body;

        if (!raw_text) {
            return res.status(400).json({ message: "Teks raw_text wajib diisi" });
        }

        console.log("Menganalisa teks:", raw_text); // Debugging log

        // Panggil AI
        const parsedData = await aiService.parseTaskFromText(raw_text);

        // Kembalikan hasil ke user (TIDAK SAVE KE DB)
        res.json({
            message: "Analisa AI selesai",
            data: parsedData
        });

    } catch (error) {
        res.status(500).json({ message: "Gagal memproses AI", error: error.message });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    analyzeText
};