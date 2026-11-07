
const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// GET: Load budgets for selected month and year
router.get('/', async (req, res) => {
    try {
        const month = Number(req.query.month) || new Date().getMonth() + 1;
        const year = Number(req.query.year) || new Date().getFullYear();

        const [rows] = await db.query(
            `SELECT
                b.budget_id,
                b.category_id,
                b.monthly_limit,
                b.month,
                b.year,
                c.category_name,
                COALESCE((
                    SELECT SUM(t.amount)
                    FROM transactions t
                    WHERE t.user_id = b.user_id
                    AND t.category_id = b.category_id
                    AND LOWER(t.transaction_type) = 'expense'
                    AND MONTH(t.transaction_date) = b.month
                    AND YEAR(t.transaction_date) = b.year
                ), 0) AS spent
            FROM budgets b
            INNER JOIN categories c
                ON b.category_id = c.category_id
                AND c.user_id = b.user_id
            WHERE b.user_id = ?
            AND b.month = ?
            AND b.year = ?
            ORDER BY c.category_name`,
            [req.session.userId, month, year]
        );

        res.json({
            success: true,
            budgets: rows
        });

    } catch (error) {
        console.error('Load budgets error:', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST: Save a new budget or update an existing budget
router.post('/', async (req, res) => {
    try {
        const { category_id, monthly_limit, month, year } = req.body;

        const categoryId = Number(category_id);
        const limit = Number(monthly_limit);
        const selectedMonth = Number(month);
        const selectedYear = Number(year);

        if (
            !Number.isInteger(categoryId) ||
            categoryId <= 0 ||
            !Number.isFinite(limit) ||
            limit <= 0 ||
            !Number.isInteger(selectedMonth) ||
            selectedMonth < 1 ||
            selectedMonth > 12 ||
            !Number.isInteger(selectedYear) ||
            selectedYear < 2000
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid category, budget amount, month and year.'
            });
        }

        const [categories] = await db.query(
            `SELECT category_id
             FROM categories
             WHERE category_id = ?
             AND user_id = ?
             AND LOWER(category_type) = 'expense'`,
            [categoryId, req.session.userId]
        );

        if (categories.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please select a valid expense category.'
            });
        }

        await db.query(
            `INSERT INTO budgets
                (user_id, category_id, monthly_limit, month, year)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                monthly_limit = VALUES(monthly_limit)`,
            [
                req.session.userId,
                categoryId,
                limit,
                selectedMonth,
                selectedYear
            ]
        );

        res.json({
            success: true,
            message: 'Budget saved successfully.'
        });

    } catch (error) {
        console.error('Save budget error:', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE: Delete a budget
router.delete('/:id', async (req, res) => {
    try {
        const budgetId = Number(req.params.id);

        const [result] = await db.query(
            `DELETE FROM budgets
             WHERE budget_id = ?
             AND user_id = ?`,
            [budgetId, req.session.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Budget not found.'
            });
        }

        res.json({
            success: true,
            message: 'Budget deleted successfully.'
        });

    } catch (error) {
        console.error('Delete budget error:', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
