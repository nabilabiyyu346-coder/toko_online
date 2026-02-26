import React, { useEffect, useState } from 'react'
import { apiFetch } from '../api'

export default function Dashboard(){
  const [products, setProducts] = useState([])

  useEffect(()=>{
    async function load(){
      const res = await apiFetch('/products')
      if (!res.ok) return
      const data = await res.json()
      setProducts(data)
    }
    load()
  },[])

  function logout(){
    const access = localStorage.getItem('accessToken')
    const refresh = localStorage.getItem('refreshToken')
    fetch('http://localhost:5000/auth/logout', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+access}, body: JSON.stringify({ refreshToken: refresh }) }).catch(()=>{})
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <div>
      <div className="header card">
        <h3>Dashboard</h3>
        <button className="btn" onClick={logout}>Logout</button>
      </div>

      <section className="card" style={{marginTop:12}}>
        <h4>Latest Products</h4>
        <ul className="products-list">
          {products.map(p=> (
            <li key={p.product_id}>
              <div>
                <div className="product-name">{p.name}</div>
                <div className="small">{p.category_name || ''}</div>
              </div>
              <div className="product-price">Rp {p.price}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
