const pool = require('../config/database');

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.query.user_id || 1; // Dummy user

        // 1. Statistik per Prioritas (Untuk Pie Chart)
        // Hitung jumlah tugas yang BELUM selesai berdasarkan prioritas
        const [priorityStats] = await pool.query(`
            SELECT priority_level, COUNT(*) as total
            FROM tasks
            WHERE user_id = ? AND is_completed = FALSE
            GROUP BY priority_level
        `, [userId]);

        // 2. Statistik Beban Minggu Ini (Untuk Bar Chart)
        // Hitung tugas 7 hari ke depan
        const [weeklyStats] = await pool.query(`
            SELECT DATE(deadline) as date, COUNT(*) as count
            FROM tasks
            WHERE user_id = ? 
            AND is_completed = FALSE
            AND deadline BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(deadline)
            ORDER BY date ASC
        `, [userId]);

        // 3. Ringkasan Total
        const [summary] = await pool.query(`
            SELECT 
                COUNT(*) as total_pending,
                SUM(CASE WHEN priority_level = 'do_first' THEN 1 ELSE 0 END) as total_urgent
            FROM tasks 
            WHERE user_id = ? AND is_completed = FALSE
        `, [userId]);

        res.json({
            message: "Data dashboard berhasil diambil",
            data: {
                priority_distribution: priorityStats,
                weekly_load: weeklyStats,
                summary: summary[0]
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };