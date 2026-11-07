let allCategories = [], allTransactions = [];
document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('transactionForm'); if (!form) return;
    document.getElementById('transactionDate').value = dateToday();
    document.getElementById('transactionType').addEventListener('change', fillCategoryOptions);
    document.getElementById('clearTransaction').addEventListener('click', () => { document.getElementById('transactionId').value=''; setTimeout(() => { document.getElementById('transactionDate').value=dateToday(); fillCategoryOptions(); },0); });
    form.addEventListener('submit', saveTransaction);
    await loadCategories(); await loadTransactions();
});
async function loadCategories() {
    const d = await api('/categories'); allCategories = d.categories; fillCategoryOptions();
}
function fillCategoryOptions() {
    const type = document.getElementById('transactionType').value;
    const select = document.getElementById('categoryId');
    select.innerHTML = '<option value="">Select category</option>' + allCategories.filter(c => c.category_type === type).map(c => `<option value="${c.category_id}">${escapeHtml(c.category_name)}</option>`).join('');
}
async function loadTransactions() {
    const d = await api('/transactions'); allTransactions = d.transactions;
    document.getElementById('transactionRows').innerHTML = allTransactions.length ? allTransactions.map(t => `<tr><td>${String(t.transaction_date).slice(0,10)}</td><td>${escapeHtml(t.description||'—')}</td><td>${escapeHtml(t.category_name||'—')}</td><td><span class="pill ${t.transaction_type}">${t.transaction_type}</span></td><td>${money(t.amount)}</td><td><button class="btn secondary small" onclick="editTransaction(${t.transaction_id})">Edit</button> <button class="btn danger small" onclick="deleteTransaction(${t.transaction_id})">Delete</button></td></tr>`).join('') : '<tr><td colspan="6" class="empty">No transactions found.</td></tr>';
}
async function saveTransaction(e) {
    e.preventDefault();
    const id = document.getElementById('transactionId').value;
    const body = { category_id: document.getElementById('categoryId').value, amount: document.getElementById('amount').value, transaction_type: document.getElementById('transactionType').value, description: document.getElementById('description').value, transaction_date: document.getElementById('transactionDate').value };
    try {
        const d = await api('/transactions' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
        showMessage('transactionMessage', d.message); e.target.reset(); document.getElementById('transactionId').value=''; document.getElementById('transactionDate').value=dateToday(); fillCategoryOptions(); await loadTransactions();
    } catch (err) { showMessage('transactionMessage', err.message, 'error'); }
}
function editTransaction(id) {
    const t = allTransactions.find(x => x.transaction_id === id); if (!t) return;
    document.getElementById('transactionId').value=t.transaction_id;
    document.getElementById('transactionType').value=t.transaction_type; fillCategoryOptions();
    document.getElementById('categoryId').value=t.category_id || '';
    document.getElementById('amount').value=t.amount; document.getElementById('description').value=t.description||'';
    document.getElementById('transactionDate').value=String(t.transaction_date).slice(0,10);
    window.scrollTo({top:0,behavior:'smooth'});
}
async function deleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return;
    try { const d=await api('/transactions/'+id,{method:'DELETE'}); showMessage('transactionMessage',d.message); await loadTransactions(); } catch(e){showMessage('transactionMessage',e.message,'error');}
}
