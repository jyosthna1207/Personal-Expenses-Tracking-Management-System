document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('totalIncome')) return;
    try {
        const d = await api('/reports/summary');
        const income = Number(d.summary.income), expense = Number(d.summary.expense);
        document.getElementById('totalIncome').textContent = money(income);
        document.getElementById('totalExpense').textContent = money(expense);
        document.getElementById('totalBalance').textContent = money(income - expense);
        const rows = d.recent || [];
        document.getElementById('recentTransactions').innerHTML = rows.length ? rows.map(t => `<tr><td>${String(t.transaction_date).slice(0,10)}</td><td>${escapeHtml(t.description || '—')}</td><td>${escapeHtml(t.category_name || 'Uncategorized')}</td><td><span class="pill ${t.transaction_type}">${t.transaction_type}</span></td><td>${t.transaction_type === 'income' ? '+' : '-'}${money(t.amount)}</td></tr>`).join('') : '<tr><td colspan="5" class="empty">No transactions yet. Add your first transaction.</td></tr>';
    } catch (e) { console.error(e); }
});
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
