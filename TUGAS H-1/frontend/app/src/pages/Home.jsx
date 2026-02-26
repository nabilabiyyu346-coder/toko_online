import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api'

export default function Home(){
  const [products, setProducts] = useState([])

  useEffect(()=>{ async function l(){ const r = await apiFetch('/products'); if (r.ok) setProducts(await r.json()) } l() },[])

  return (
    <div>
      <section className="hero card">
        <div className="container hero-inner">
          <div>
            <h1>Kerajinan gerabah tradisional, langsung dari pengrajin</h1>
            <p className="lead">Produk handmade berkualitas, diproduksi dengan teknik turun-temurun.</p>
            <div style={{marginTop:16}}>
              <Link to="/products" className="btn">Lihat Produk</Link>
              <Link to="/categories" className="btn secondary" style={{marginLeft:8}}>Kategori</Link>
            </div>
          </div>
          <div className="hero-image card">
            <img src="/hero.svg" alt="hero" style={{width:'100%',borderRadius:8}} />
          </div>
        </div>
      </section>

      <section className="container" style={{marginTop:20}}>
        <h3>Produk Pilihan</h3>
        <div className="grid-products">
          {products.slice(0,6).map(p => (
            <div key={p.product_id} className="product-card card">
              <div style={{height:120,background:'#f6f6f8',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <img src={p.image_url || '/placeholder.svg'} alt="product" style={{maxHeight:110}} />
              </div>
              <div style={{paddingTop:8}}>
                <div className="product-name">{p.name}</div>
                <div className="small">Rp {p.price}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{marginTop:32,padding:20,textAlign:'center',color:'#666'}}>
        © {new Date().getFullYear()} Toko Gerabah — All rights reserved
      </footer>
    </div>
  )
}
