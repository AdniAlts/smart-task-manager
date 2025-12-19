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

    // Update tugas - only update fields that are provided
    update: async (id, data) => {
        // Build dynamic update query based on provided fields
        const fields = [];
        const values = [];
        
        if (data.title !== undefined) {
            fields.push('title = ?');
            values.push(data.title);
        }
        if (data.subject !== undefined) {
            fields.push('subject = ?');
            values.push(data.subject);
        }
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }
        if (data.deadline !== undefined) {
            fields.push('deadline = ?');
            values.push(data.deadline);
        }
        if (data.priority_level !== undefined) {
            fields.push('priority_level = ?');
            values.push(data.priority_level);
        }
        if (data.is_completed !== undefined) {
            fields.push('is_completed = ?');
            values.push(data.is_completed);
        }
        
        if (fields.length === 0) {
            return 0; // Nothing to update
        }
        
        values.push(id);
        
        const [result] = await db.query(
            `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
            values
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