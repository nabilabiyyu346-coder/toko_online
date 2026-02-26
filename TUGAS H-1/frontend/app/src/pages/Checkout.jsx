import React from 'react'
import { useCart } from '../cart.jsx'
import { apiFetch } from '../api'

export default function Checkout(){
  const { items, update, remove, clear, count } = useCart()
  const total = items.reduce((s,i)=> s + (i.price * i.quantity), 0)

  async function handleCheckout(e){
    e.preventDefault()
    if (items.length === 0) return alert('Cart kosong')
    const payload = { payment_method: 'cash', items: items.map(i=>({ product_id: i.product_id, quantity: i.quantity })) }
    const res = await apiFetch('/transactions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    if (!res.ok) {
      const err = await res.json().catch(()=>({})); alert(err.message || 'Checkout gagal'); return
    }
    const data = await res.json()
    alert('Transaksi berhasil. ID: ' + (data.transaction_id || data.transaction_id))
    clear()
  }

  return (
    <div>
      <div className="card">
        <h3>Checkout</h3>
        <p className="small">{count} item(s)</p>
        <ul className="products-list">
          {items.map(i => (
            <li key={i.product_id} style={{alignItems:'center'}}>
              <div>
                <div className="product-name">{i.name}</div>
                <div className="small">Rp {i.price}</div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input type="number" value={i.quantity} min={1} style={{width:80}} onChange={e=>update(i.product_id, Number(e.target.value))} />
                <div className="product-price">Rp {i.price * i.quantity}</div>
                <button className="btn secondary" onClick={()=>remove(i.product_id)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
          <div>
            <div className="small">Total</div>
            <div className="product-price">Rp {total}</div>
          </div>
          <div>
            <button className="btn" onClick={handleCheckout}>Pay</button>
          </div>
        </div>
      </div>
    </div>
  )
}
