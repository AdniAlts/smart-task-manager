const db = require('../config/database');

const TaskModel = {
    // Ambil semua tugas milik user tertentu
    getAllByUserId: async (userId) => {
        const [rows] = await db.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY deadline ASC', 
            [userId]
        );
        return rows;
    },

    // Ambil detail satu tugas (untuk keperluan edit/detail)
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        return rows[0];
    },

    // Tambah tugas baru
    create: async (data) => {
        const { user_id, title, subject, description, deadline, priority_level } = data;
        const [result] = await db.query(
            `INSERT INTO tasks (user_id, title, subject, description, deadline, priority_level) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, title, subject, description, deadline, priority_level]
        );
        return result.insertId;
    },

    // Update tugas
    update: async (id, data) => {
        const { title, subject, description, deadline, priority_level, is_completed } = data;
        // Kita gunakan COALESCE atau logika sederhana agar field yang tidak dikirim tidak menjadi NULL (opsional), 
        // tapi untuk simpelnya kita update semua field yang dikirim.
        const [result] = await db.query(
            `UPDATE tasks 
             SET title=?, subject=?, description=?, deadline=?, priority_level=?, is_completed=? 
             WHERE id=?`,
            [title, subject, description, deadline, priority_level, is_completed, id]
        );
        return result.affectedRows;
    },

    // Hapus tugas
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = TaskModel;