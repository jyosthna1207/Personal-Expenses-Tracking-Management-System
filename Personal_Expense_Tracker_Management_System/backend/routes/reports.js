const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

router.get('/summary', async (req, res) => {
    try {
        const month = Number(req.query.month) || new Date().getMonth() + 1;
        const year = Number(req.query.year) || new Date().getFullYear();
        const [totals] = await db.query(
            `SELECT
             COALESCE(SUM(CASE WHEN transaction_type='income' THEN amount ELSE 0 END),0) AS income,
             COALESCE(SUM(CASE WHEN transaction_type='expense' THEN amount ELSE 0 END),0) AS expense
             FROM transactions WHERE user_id=? AND MONTH(transaction_date)=? AND YEAR(transaction_date)=?`,
            [req.session.userId, month, year]
        );
        const [byCategory] = await db.query(
            `SELECT c.category_name, SUM(t.amount) AS total
             FROM transactions t LEFT JOIN categories c ON t.category_id=c.category_id
             WHERE t.user_id=? AND t.transaction_type='expense'
             AND MONTH(t.transaction_date)=? AND YEAR(t.transaction_date)=?
             GROUP BY c.category_name ORDER BY total DESC`,
            [req.session.userId, month, year]
        );
        const [recent] = await db.query(
            `SELECT t.*, c.category_name FROM transactions t
             LEFT JOIN categories c ON t.category_id=c.category_id
             WHERE t.user_id=? ORDER BY transaction_date DESC, transaction_id DESC LIMIT 6`,
            [req.session.userId]
        );
        res.json({ success: true, summary: totals[0], byCategory, recent });
    } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Could not load reports.' }); }
});
module.exports = router;
