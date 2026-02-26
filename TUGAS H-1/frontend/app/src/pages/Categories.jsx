import React, { useEffect, useState } from 'react'
import { apiFetch } from '../api'

export default function Categories(){
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name:'', description:'' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name:'', description:'' })

  useEffect(()=>{ load() },[])

  async function load(){
    const res = await apiFetch('/categories')
    if (!res.ok) return
    const data = await res.json()
    setCategories(data)
  }

  async function createCategory(e){
    e.preventDefault()
    const res = await apiFetch('/categories', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    if (res.ok){ setForm({ name:'', description:'' }); load() }
    else { const err = await res.json().catch(()=>({})); alert(err.message || 'Create failed') }
  }

  function startEdit(c){ setEditingId(c.category_id); setEditForm({ name:c.name, description:c.description || '' }) }
  function cancelEdit(){ setEditingId(null); setEditForm({ name:'', description:'' }) }

  async function saveEdit(e){
    e.preventDefault()
    const res = await apiFetch(`/categories/${editingId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(editForm) })
    if (res.ok){ cancelEdit(); load() }
    else { const err = await res.json().catch(()=>({})); alert(err.message || 'Update failed') }
  }

  async function deleteCategory(id){
    if (!confirm('Hapus kategori ini?')) return
    const res = await apiFetch(`/categories/${id}`, { method:'DELETE' })
    if (res.ok) load()
    else { const err = await res.json().catch(()=>({})); alert(err.message || 'Delete failed') }
  }

  return (
    <div>
      <section className="card">
        <h4>Create Category</h4>
        <form onSubmit={createCategory} style={{display:'grid',gap:8}}>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <button className="btn" type="submit">Add</button>
        </form>
      </section>

      <section className="card" style={{marginTop:12}}>
        <h4>Categories</h4>
        <ul className="products-list">
          {categories.map(c=> (
            <li key={c.category_id} style={{alignItems:'center'}}>
              {editingId === c.category_id ? (
                <form onSubmit={saveEdit} style={{display:'flex',gap:8,alignItems:'center',width:'100%'}}>
                  <input style={{flex:1}} value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} />
                  <input style={{flex:1}} value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})} />
                  <button className="btn" type="submit">Save</button>
                  <button type="button" className="btn secondary" onClick={cancelEdit}>Cancel</button>
                </form>
              ) : (
                <>
                  <div>
                    <div className="product-name">{c.name}</div>
                    <div className="small">{c.description}</div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn secondary" onClick={()=>startEdit(c)}>Edit</button>
                    <button className="btn" onClick={()=>deleteCategory(c.category_id)}>Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
