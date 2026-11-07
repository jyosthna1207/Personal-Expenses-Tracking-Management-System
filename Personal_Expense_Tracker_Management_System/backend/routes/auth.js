const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

const starterCategories = [
    ['Salary', 'income'], ['Freelance', 'income'], ['Other Income', 'income'],
    ['Food', 'expense'], ['Transport', 'expense'], ['Shopping', 'expense'],
    ['Bills', 'expense'], ['Health', 'expense'], ['Education', 'expense'],
    ['Entertainment', 'expense'], ['Other Expense', 'expense']
];

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Enter your name, a valid email and a password of at least 6 characters.' });
        }
        const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existing.length) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });

        const hash = await bcrypt.hash(password, 10);
        const [result] = await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name.trim(), email.trim().toLowerCase(), hash]);
        const values = starterCategories.map(c => [result.insertId, c[0], c[1]]);
        await db.query('INSERT INTO categories (user_id, category_name, category_type) VALUES ?', [values]);
        req.session.userId = result.insertId;
        req.session.userName = name.trim();
        res.json({ success: true, message: 'Account created successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not create account.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [(email || '').trim().toLowerCase()]);
        if (!rows.length || !(await bcrypt.compare(password || '', rows[0].password))) {
            return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
        }
        req.session.userId = rows[0].user_id;
        req.session.userName = rows[0].name;
        res.json({ success: true, message: 'Logged in successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Login failed.' });
    }
});

router.get('/me', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ success: false });
    res.json({ success: true, user: { user_id: req.session.userId, name: req.session.userName } });
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true, message: 'Logged out.' }));
});

module.exports = router;
