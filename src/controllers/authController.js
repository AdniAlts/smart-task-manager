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
        const { email, password, rememberMe } = req.body;

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

        // Generate token - longer expiry if remember me
        const tokenExpiry = rememberMe ? '30d' : '7d';
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: tokenExpiry }
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

// Update user profile (name, email, telegram_chat_id)
const updateProfile = async (req, res) => {
    try {
        const { name, email, telegram_chat_id } = req.body;
        
        const updates = [];
        const values = [];

        if (name !== undefined && name.trim()) {
            updates.push('username = ?');
            values.push(name.trim());
        }
        if (email !== undefined && email.trim()) {
            // Check if email is already used by another user
            const [existingUsers] = await pool.query(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, req.user.id]
            );
            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Email already used by another account' });
            }
            updates.push('email = ?');
            values.push(email.trim());
        }
        if (telegram_chat_id !== undefined) {
            updates.push('telegram_chat_id = ?');
            values.push(telegram_chat_id || null);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No profile data to update' });
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
            message: 'Profile updated successfully',
            data: users[0]
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        // Get user with password
        const [users] = await pool.query(
            'SELECT password_hash FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await pool.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Forgot password - send reset email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user
        const [users] = await pool.query(
            'SELECT id, username, email FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            // Don't reveal if email exists for security
            return res.json({ message: 'If the email exists, a reset link has been sent' });
        }

        const user = users[0];

        // Generate reset token (valid for 1 hour)
        const resetToken = jwt.sign(
            { id: user.id, email: user.email, type: 'reset' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send reset email
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // For now, we'll just send the token directly (in production, use a proper reset link)
        const resetCode = resetToken.slice(-8).toUpperCase();
        
        // Store reset code temporarily (we'll use the token's last 8 chars as verification)
        await pool.query(
            'UPDATE users SET reset_token = ? WHERE id = ?',
            [resetToken, user.id]
        );

        await transporter.sendMail({
            from: 'TaskMind <noreply@taskmind.com>',
            to: user.email,
            subject: '🔐 Reset Password - TaskMind',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1e293b; color: #f1f5f9; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #8b5cf6; margin: 0;">🔐 Reset Password</h1>
                    </div>
                    
                    <div style="background-color: #334155; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="color: #f1f5f9;">Hi <strong>${user.username}</strong>,</p>
                        <p style="color: #94a3b8;">You requested to reset your password. Use the code below:</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; color: #8b5cf6; letter-spacing: 4px; background: #1e293b; padding: 15px 30px; border-radius: 8px;">${resetCode}</span>
                        </div>
                        <p style="color: #94a3b8; font-size: 12px;">This code expires in 1 hour.</p>
                    </div>
                    
                    <div style="text-align: center; color: #64748b; font-size: 12px;">
                        <p>If you didn't request this, please ignore this email.</p>
                        <p>TaskMind</p>
                    </div>
                </div>
            `
        });

        res.json({ 
            message: 'If the email exists, a reset code has been sent',
            // In development, return the code for testing
            ...(process.env.NODE_ENV === 'development' && { resetCode })
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reset password with code
const resetPassword = async (req, res) => {
    try {
        const { email, resetCode, newPassword } = req.body;

        if (!email || !resetCode || !newPassword) {
            return res.status(400).json({ message: 'Email, reset code, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        // Find user with reset token
        const [users] = await pool.query(
            'SELECT id, reset_token FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0 || !users[0].reset_token) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }

        const user = users[0];

        // Verify reset code (last 8 chars of token)
        if (user.reset_token.slice(-8).toUpperCase() !== resetCode.toUpperCase()) {
            return res.status(400).json({ message: 'Invalid reset code' });
        }

        // Verify token is still valid
        try {
            jwt.verify(user.reset_token, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Reset code has expired' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset token
        await pool.query(
            'UPDATE users SET password_hash = ?, reset_token = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ message: 'Password reset successfully. You can now login with your new password.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { register, login, getMe, updateSettings, updateProfile, changePassword, forgotPassword, resetPassword };
