
const monthLabels = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
];

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('budgetForm');

    if (!form) return;

    const monthSelect = document.getElementById('budgetMonth');
    const yearInput = document.getElementById('budgetYear');
    const categorySelect = document.getElementById('budgetCategory');

    const now = new Date();

    monthSelect.innerHTML = monthLabels
        .map((month, index) =>
            `<option value="${index + 1}" ${index === now.getMonth() ? 'selected' : ''}>${month}</option>`
        ).join('');

    yearInput.value = now.getFullYear();

    // Load expense categories
    await loadExpenseCategories();

    // Save budget
    form.addEventListener('submit', saveBudget);

    // Reload budgets when month or year changes
    monthSelect.addEventListener('change', loadBudgets);
    yearInput.addEventListener('change', loadBudgets);

    // Initial budget loading
    await loadBudgets();
});


// LOAD EXPENSE CATEGORIES
async function loadExpenseCategories() {
    const categorySelect = document.getElementById('budgetCategory');

    try {
        const data = await api('/categories');

        if (!data.success || !Array.isArray(data.categories)) {
            throw new Error(data.message || 'Unable to load categories.');
        }

        const expenseCategories = data.categories.filter(
            category =>
                String(category.category_type).toLowerCase() === 'expense'
        );

        categorySelect.innerHTML = `
            <option value="">Select Expense Category</option>
            ${expenseCategories.map(category => `
                <option value="${category.category_id}">
                    ${escapeHtml(category.category_name)}
                </option>
            `).join('')}
        `;

        if (expenseCategories.length === 0) {
            showMessage(
                'budgetMessage',
                'No expense categories found. Please add an expense category first.',
                'error'
            );
        }

    } catch (error) {
        console.error('Category loading error:', error);
        showMessage('budgetMessage', error.message, 'error');
    }
}


// LOAD BUDGETS
async function loadBudgets() {
    const budgetList = document.getElementById('budgetList');

    try {
        budgetList.innerHTML = '<div class="empty">Loading budgets...</div>';

        const month = document.getElementById('budgetMonth').value;
        const year = document.getElementById('budgetYear').value;

        const data = await api(`/budgets?month=${month}&year=${year}`);

        if (!data.success || !Array.isArray(data.budgets)) {
            throw new Error(data.message || 'Could not load budgets.');
        }

        if (data.budgets.length === 0) {
            budgetList.innerHTML = `
                <div class="empty">
                    No budgets found for this month. Create a budget above.
                </div>
            `;
            return;
        }

        budgetList.innerHTML = data.budgets.map(budget => {
            const spent = Number(budget.spent || 0);
            const limit = Number(budget.monthly_limit || 0);
            const percentage = limit > 0
                ? (spent / limit) * 100
                : 0;

            const progress = Math.min(100, percentage);

            return `
                <div class="budget-row">
                    <div>
                        <strong>${escapeHtml(budget.category_name)}</strong>
                        <br>
                        <small>
                            ${money(spent)} spent of ${money(limit)}
                        </small>

                        <div class="progress" style="margin-top:9px">
                            <span style="width:${progress}%"></span>
                        </div>
                    </div>

                    <div>
                        <strong>${percentage.toFixed(0)}%</strong>
                        <br>
                        <button
                            class="btn danger small"
                            type="button"
                            onclick="deleteBudget(${Number(budget.budget_id)})">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Budget loading error:', error);

        budgetList.innerHTML = `
            <div class="empty">
                ${escapeHtml(error.message)}
            </div>
        `;

        showMessage('budgetMessage', error.message, 'error');
    }
}


// SAVE BUDGET
async function saveBudget(event) {
    event.preventDefault();

    const categoryId = document.getElementById('budgetCategory').value;
    const monthlyLimit = document.getElementById('monthlyLimit').value;
    const month = document.getElementById('budgetMonth').value;
    const year = document.getElementById('budgetYear').value;

    if (!categoryId) {
        showMessage('budgetMessage', 'Please select an expense category.', 'error');
        return;
    }

    if (!monthlyLimit || Number(monthlyLimit) <= 0) {
        showMessage('budgetMessage', 'Enter a valid monthly budget amount.', 'error');
        return;
    }

    const body = {
        category_id: Number(categoryId),
        monthly_limit: Number(monthlyLimit),
        month: Number(month),
        year: Number(year)
    };

    try {
        const data = await api('/budgets', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (!data.success) {
            throw new Error(data.message || 'Could not save budget.');
        }

        showMessage('budgetMessage', data.message);

        document.getElementById('monthlyLimit').value = '';

        await loadBudgets();

    } catch (error) {
        console.error('Save budget error:', error);
        showMessage('budgetMessage', error.message, 'error');
    }
}


// DELETE BUDGET
async function deleteBudget(id) {
    if (!confirm('Are you sure you want to delete this budget?')) {
        return;
    }

    try {
        const data = await api('/budgets/' + id, {
            method: 'DELETE'
        });

        if (!data.success) {
            throw new Error(data.message || 'Could not delete budget.');
        }

        showMessage('budgetMessage', data.message);

        await loadBudgets();

    } catch (error) {
        console.error('Delete budget error:', error);
        showMessage('budgetMessage', error.message, 'error');
    }
}
