document.addEventListener('DOMContentLoaded', () => {
    const form=document.getElementById('categoryForm'); if(!form)return;
    form.addEventListener('submit', async e=>{
        e.preventDefault();
        try { const d=await api('/categories',{method:'POST',body:JSON.stringify({category_name:document.getElementById('categoryName').value,category_type:document.getElementById('categoryType').value})}); showMessage('categoryMessage',d.message); form.reset(); await loadCategoryRows(); }
        catch(err){showMessage('categoryMessage',err.message,'error');}
    });
    loadCategoryRows();
});
async function loadCategoryRows(){
    try{
        const d=await api('/categories');
        document.getElementById('categoryRows').innerHTML=d.categories.length?d.categories.map(c=>`<tr><td>${escapeHtml(c.category_name)}</td><td><span class="pill ${c.category_type}">${c.category_type}</span></td><td><button class="btn danger small" onclick="removeCategory(${c.category_id})">Delete</button></td></tr>`).join(''):'<tr><td colspan="3" class="empty">No categories.</td></tr>';
    }catch(e){showMessage('categoryMessage',e.message,'error');}
}
async function removeCategory(id){if(!confirm('Delete this category? Related budgets will also be removed.'))return;try{const d=await api('/categories/'+id,{method:'DELETE'});showMessage('categoryMessage',d.message);await loadCategoryRows();}catch(e){showMessage('categoryMessage',e.message,'error');}}
