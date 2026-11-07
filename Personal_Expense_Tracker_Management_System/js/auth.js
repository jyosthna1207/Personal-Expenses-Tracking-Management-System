document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('authForm');
    if (!form) return;
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const action = form.dataset.action;
        const body = { email: document.getElementById('email').value, password: document.getElementById('password').value };
        if (action === 'register') body.name = document.getElementById('name').value;
        try {
            const result = await api('/auth/' + action, { method: 'POST', body: JSON.stringify(body) });
            showMessage('authMessage', result.message, 'success');
            setTimeout(() => location.href = 'index.html', 500);
        } catch (err) { showMessage('authMessage', err.message, 'error'); }
    });
});
