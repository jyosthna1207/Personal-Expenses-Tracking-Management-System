const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories WHERE user_id = ? ORDER BY category_type, category_name', [req.session.userId]);
        res.json({ success: true, categories: rows });
    } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Could not load categories.' }); }
});

router.post('/', async (req, res) => {
    try {
        const { category_name, category_type } = req.body;
        if (!category_name || !['income', 'expense'].includes(category_type)) return res.status(400).json({ success: false, message: 'Enter a category name and valid type.' });
        const [r] = await db.query('INSERT INTO categories (user_id, category_name, category_type) VALUES (?, ?, ?)', [req.session.userId, category_name.trim(), category_type]);
        res.json({ success: true, category_id: r.insertId, message: 'Category added.' });
    } catch (e) { res.status(500).json({ success: false, message: 'Category may already exist.' }); }
});

router.delete('/:id', async (req, res) => {
    try {
        const [r] = await db.query('DELETE FROM categories WHERE category_id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Category not found.' });
        res.json({ success: true, message: 'Category deleted.' });
    } catch (e) { res.status(500).json({ success: false, message: 'Could not delete category.' }); }
});
module.exports = router;
