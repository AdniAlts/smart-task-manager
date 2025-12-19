const db = require('../config/database');

const TaskModel = {
    // Ambil semua tugas milik user tertentu
    getAllByUserId: async (userId) => {
        const result = await db.query(
            'SELECT * FROM tasks WHERE user_id = $1 ORDER BY deadline ASC', 
            [userId]
        );
        return result.rows;
    },

    // Ambil detail satu tugas (untuk keperluan edit/detail)
    getById: async (id) => {
        const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
        return result.rows[0];
    },

    // Tambah tugas baru
    create: async (data) => {
        const { user_id, title, subject, description, deadline, priority_level } = data;
        const result = await db.query(
            `INSERT INTO tasks (user_id, title, subject, description, deadline, priority_level) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [user_id, title, subject, description, deadline, priority_level]
        );
        return result.rows[0].id;
    },

    // Update tugas - only update fields that are provided
    update: async (id, data) => {
        // Build dynamic update query based on provided fields
        const fields = [];
        const values = [];
        let paramCount = 1;
        
        if (data.title !== undefined) {
            fields.push(`title = $${paramCount++}`);
            values.push(data.title);
        }
        if (data.subject !== undefined) {
            fields.push(`subject = $${paramCount++}`);
            values.push(data.subject);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${paramCount++}`);
            values.push(data.description);
        }
        if (data.deadline !== undefined) {
            fields.push(`deadline = $${paramCount++}`);
            values.push(data.deadline);
        }
        if (data.priority_level !== undefined) {
            fields.push(`priority_level = $${paramCount++}`);
            values.push(data.priority_level);
        }
        if (data.is_completed !== undefined) {
            fields.push(`is_completed = $${paramCount++}`);
            values.push(data.is_completed);
        }
        
        if (fields.length === 0) {
            return 0; // Nothing to update
        }
        
        values.push(id);
        
        const result = await db.query(
            `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCount}`,
            values
        );
        return result.rowCount;
    },

    // Hapus tugas
    delete: async (id) => {
        const result = await db.query('DELETE FROM tasks WHERE id = $1', [id]);
        return result.rowCount;
    }
};

module.exports = TaskModel;