import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Checkout from './pages/Checkout'
import { CartProvider } from './cart.jsx'
import { useState } from 'react'
import { useEffect } from 'react'
import { useCart } from './cart.jsx'

export default function App(){
  return (
    <CartProvider>
      <InnerApp />
    </CartProvider>
  )
}

function InnerApp(){
  const [open, setOpen] = useState(false)
  const { count } = useCart()

  return (
    <div>
      <header className="header container" style={{alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link to="/" style={{textDecoration:'none',color:'inherit'}}><h2>Toko Gerabah</h2></Link>
        </div>

        <nav className={`nav ${open? 'open':''}`}>
          <Link to="/products" className="btn secondary">Products</Link>
          <Link to="/categories" className="btn secondary">Categories</Link>
          <Link to="/checkout" className="btn secondary">Checkout</Link>
          <Link to="/dashboard" className="btn">Dashboard</Link>
          <Link to="/login" className="btn secondary" style={{marginLeft:8}}>Login</Link>
        </nav>

        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button className="btn secondary" onClick={()=>setOpen(v=>!v)} aria-label="menu">☰</button>
          <Link to="/checkout" style={{position:'relative'}}>
            <button className="btn" aria-label="cart">Cart</button>
            {count>0 && <span className="cart-badge">{count}</span>}
          </Link>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>
    </div>
  )
}
