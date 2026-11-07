const API = '/api';
const money = value => Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
async function api(url, options = {}) {
    const response = await fetch(API + url, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        if (response.status === 401 && !location.pathname.endsWith('login.html') && !location.pathname.endsWith('register.html')) location.href = 'login.html';
        throw new Error(data.message || 'Something went wrong.');
    }
    return data;
}
function showMessage(id, message, type = 'success') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message; el.className = `message show ${type}`;
}
function dateToday() {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
async function loadUser() {
    try {
        const data = await api('/auth/me');
        const name = data.user.name || 'My Account';
        const nameEl = document.getElementById('userName');
        const initial = document.getElementById('userInitial');
        if (nameEl) nameEl.textContent = name;
        if (initial) initial.textContent = name.charAt(0).toUpperCase();
    } catch (e) { if (!location.pathname.endsWith('login.html') && !location.pathname.endsWith('register.html')) location.href = 'login.html'; }
}
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav a').forEach(a => {
        const file = location.pathname.split('/').pop() || 'index.html';
        if (a.getAttribute('href') === file) a.classList.add('active');
    });
    const logout = document.getElementById('logoutBtn');
    if (logout) logout.addEventListener('click', async () => { try { await api('/auth/logout', { method: 'POST' }); location.href = 'login.html'; } catch(e) { alert(e.message); } });
    if (document.querySelector('.app')) loadUser();
});

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
