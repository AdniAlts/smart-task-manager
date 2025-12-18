const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register new user
const register = async (req, res) => {
    try {
        const { name, email, password, telegram_chat_id } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Name, email, and password are required' 
            });
        }

        // Check if email already exists
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE email = ?', 
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                message: 'Email already registered' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await pool.query(
            `INSERT INTO users (username, email, password_hash, telegram_chat_id, telegram_enabled, email_enabled) 
             VALUES (?, ?, ?, ?, TRUE, TRUE)`,
            [name, email, hashedPassword, telegram_chat_id || null]
        );

        // Generate token
        const token = jwt.sign(
            { id: result.insertId, email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Get user data (without password)
        const [users] = await pool.query(
            'SELECT id, username as name, email, telegram_chat_id, telegram_enabled, email_enabled FROM users WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Registration successful',
            data: {
                user: users[0],
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }

        // Find user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remove password from response
        delete user.password_hash;

        res.json({
            message: 'Login successful',
            data: {
                user,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get current user
const getMe = async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, username as name, email, telegram_chat_id, telegram_enabled, email_enabled FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User data retrieved',
            data: users[0]
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user settings (notification preferences)
const updateSettings = async (req, res) => {
    try {
        const { telegram_enabled, email_enabled, telegram_chat_id } = req.body;
        
        const updates = [];
        const values = [];

        if (telegram_enabled !== undefined) {
            updates.push('telegram_enabled = ?');
            values.push(telegram_enabled);
        }
        if (email_enabled !== undefined) {
            updates.push('email_enabled = ?');
            values.push(email_enabled);
        }
        if (telegram_chat_id !== undefined) {
            updates.push('telegram_chat_id = ?');
            values.push(telegram_chat_id);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No settings to update' });
        }

        values.push(req.user.id);

        await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Get updated user
        const [users] = await pool.query(
            'SELECT id, username as name, email, telegram_chat_id, telegram_enabled, email_enabled FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({
            message: 'Settings updated successfully',
            data: users[0]
        });

    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { register, login, getMe, updateSettings };
