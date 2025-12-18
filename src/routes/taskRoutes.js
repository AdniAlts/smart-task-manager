const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Base URL: /api/tasks

router.get('/', taskController.getTasks);       // Ambil semua tugas
router.post('/', taskController.createTask);    // Buat tugas baru
router.put('/:id', taskController.updateTask);  // Edit tugas
router.delete('/:id', taskController.deleteTask); // Hapus tugas

module.exports = router;