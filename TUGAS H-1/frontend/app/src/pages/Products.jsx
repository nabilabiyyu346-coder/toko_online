import React, { useEffect, useState } from 'react'
import { apiFetch } from '../api'
import { useCart } from '../cart.jsx'

export default function Products(){
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name:'', price:'', stock:'', category_id:'' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name:'', price:'', stock:'', category_id:'' })

  useEffect(()=>{ load(); loadCategories() },[])

  async function load(){
    const res = await apiFetch('/products')
    if (!res.ok) return
    const data = await res.json()
    setProducts(data)
  }

  async function loadCategories(){
    const res = await apiFetch('/categories')
    if (!res.ok) return
    const data = await res.json()
    setCategories(data)
  }

  async function handleCreate(e){
    e.preventDefault()
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) }
    const res = await apiFetch('/products', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    if (res.ok){ setForm({ name:'', price:'', stock:'', category_id:'' }); load() }
    else { const err = await res.json().catch(()=>({})); alert(err.message || 'Create failed') }
  }

  function startEdit(p){
    setEditingId(p.product_id)
    setEditForm({ name:p.name, price:p.price, stock:p.stock, category_id:p.category_id || '' })
  }

  function cancelEdit(){ setEditingId(null); setEditForm({ name:'', price:'', stock:'', category_id:'' }) }

  async function saveEdit(e){
    e.preventDefault()
    const payload = { name: editForm.name, price: Number(editForm.price), stock: Number(editForm.stock), category_id: Number(editForm.category_id) }
    const res = await apiFetch(`/products/${editingId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    if (res.ok){ cancelEdit(); load() }
    else { const err = await res.json().catch(()=>({})); alert(err.message || 'Update failed') }
  }

  async function deleteProduct(id){
    if (!confirm('Hapus produk ini?')) return
    const res = await apiFetch(`/products/${id}`, { method:'DELETE' })
    if (res.ok) load()
    else { const err = await res.json().catch(()=>({})); alert(err.message || 'Delete failed') }
  }

  const { add } = useCart()

  return (
    <div>
      <section className="card">
        <h4>Create Product</h4>
        <form onSubmit={handleCreate} style={{display:'grid',gap:8}}>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
          <input placeholder="Stock" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} />
          <select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}>
            <option value="">-- Pilih Kategori --</option>
            {categories.map(c=> <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
          </select>
          <button className="btn" type="submit">Add</button>
        </form>
      </section>

      <section className="card" style={{marginTop:12}}>
        <h4>Products</h4>
        <ul className="products-list">
          {products.map(p=> (
            <li key={p.product_id}>
              {editingId === p.product_id ? (
                <form onSubmit={saveEdit} style={{display:'flex',gap:8,alignItems:'center',width:'100%'}}>
                  <input style={{flex:1}} value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} />
                  <input style={{width:100}} value={editForm.price} onChange={e=>setEditForm({...editForm,price:e.target.value})} />
                  <input style={{width:80}} value={editForm.stock} onChange={e=>setEditForm({...editForm,stock:e.target.value})} />
                  <select value={editForm.category_id} onChange={e=>setEditForm({...editForm,category_id:e.target.value})}>
                    <option value="">--</option>
                    {categories.map(c=> <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                  </select>
                  <button className="btn" type="submit">Save</button>
                  <button type="button" className="btn secondary" onClick={cancelEdit}>Cancel</button>
                </form>
              ) : (
                <>
                  <div>
                    <div className="product-name">{p.name}</div>
                    <div className="small">{p.category_name}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
                    <div className="product-price">Rp {p.price}</div>
                    <div style={{display:'flex',gap:8}}>
                      <button className="btn secondary" onClick={()=>startEdit(p)}>Edit</button>
                      <button className="btn" onClick={()=>deleteProduct(p.product_id)}>Delete</button>
                      <button className="btn" onClick={()=>add({ product_id: p.product_id, name: p.name, price: Number(p.price), quantity: 1 })}>Add to Cart</button>
                    </div>
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
