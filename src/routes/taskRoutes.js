const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Route untuk Parse AI (Preview)
router.post('/analyze', taskController.analyzeText);

// Route untuk Simpan ke DB (Commit)
router.post('/', taskController.createTask); 

// Route lain (Get, Update, Delete)...
// router.get('/', taskController.getAllTasks);

module.exports = router;