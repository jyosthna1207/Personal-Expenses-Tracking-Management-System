const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT t.*, c.category_name FROM transactions t
             LEFT JOIN categories c ON t.category_id = c.category_id
             WHERE t.user_id = ? ORDER BY t.transaction_date DESC, t.transaction_id DESC`,
            [req.session.userId]
        );
        res.json({ success: true, transactions: rows });
    } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Could not load transactions.' }); }
});

router.post('/', async (req, res) => {
    try {
        const { category_id, amount, transaction_type, description, transaction_date } = req.body;
        if (!(Number(amount) > 0) || !['income', 'expense'].includes(transaction_type) || !transaction_date) {
            return res.status(400).json({ success: false, message: 'Enter a positive amount, type and date.' });
        }
        let safeCategory = category_id || null;
        if (safeCategory) {
            const [c] = await db.query('SELECT category_id FROM categories WHERE category_id = ? AND user_id = ? AND category_type = ?', [safeCategory, req.session.userId, transaction_type]);
            if (!c.length) return res.status(400).json({ success: false, message: 'Choose a category matching the transaction type.' });
        }
        const [r] = await db.query(
            'INSERT INTO transactions (user_id, category_id, amount, transaction_type, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?)',
            [req.session.userId, safeCategory, amount, transaction_type, description || '', transaction_date]
        );
        res.json({ success: true, transaction_id: r.insertId, message: 'Transaction saved.' });
    } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Could not save transaction.' }); }
});

router.put('/:id', async (req, res) => {
    try {
        const { category_id, amount, transaction_type, description, transaction_date } = req.body;
        const [r] = await db.query(
            `UPDATE transactions SET category_id=?, amount=?, transaction_type=?, description=?, transaction_date=?
             WHERE transaction_id=? AND user_id=?`,
            [category_id || null, amount, transaction_type, description || '', transaction_date, req.params.id, req.session.userId]
        );
        if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Transaction not found or unchanged.' });
        res.json({ success: true, message: 'Transaction updated.' });
    } catch (e) { res.status(500).json({ success: false, message: 'Could not update transaction.' }); }
});

router.delete('/:id', async (req, res) => {
    try {
        const [r] = await db.query('DELETE FROM transactions WHERE transaction_id=? AND user_id=?', [req.params.id, req.session.userId]);
        if (!r.affectedRows) return res.status(404).json({ success: false, message: 'Transaction not found.' });
        res.json({ success: true, message: 'Transaction deleted.' });
    } catch (e) { res.status(500).json({ success: false, message: 'Could not delete transaction.' }); }
});
module.exports = router;
