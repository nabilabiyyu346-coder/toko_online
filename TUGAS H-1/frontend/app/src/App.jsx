import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import { CartProvider } from './cart.jsx'
import { useState, useEffect } from 'react'
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
  const [user, setUser] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const { count } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    setShowLoginModal(false)
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setShowLoginModal(false)
  }

  return (
    <div>
      <header className="header container" style={{alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link to="/" style={{textDecoration:'none',color:'inherit'}}><h2>Toko Gerabah</h2></Link>
        </div>

        <nav className={`nav ${open? 'open':''}`}>
          <Link to="/products" className="btn secondary">Products</Link>
          <Link to="/categories" className="btn secondary">Categories</Link>
          <Link to="/dashboard" className="btn">Dashboard</Link>
        </nav>

        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <button className="btn secondary" onClick={()=>setOpen(v=>!v)} aria-label="menu">☰</button>
          
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button 
              className="btn secondary" 
              aria-label="cart" 
              onClick={() => setShowCartModal(true)}
              style={{position:'relative',padding:'8px 12px',fontSize:'20px',cursor:'pointer'}}
              title="Lihat keranjang belanja"
            >
              🛒
              {count>0 && <span className="cart-badge">{count}</span>}
            </button>

            {user ? (
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:'0.9rem',color:'#666'}}>{user.username}</span>
                <button className="btn secondary" onClick={handleLogout} style={{fontSize:'0.85rem',padding:'8px 12px'}}>Logout</button>
              </div>
            ) : (
              <button className="btn secondary" onClick={() => setShowLoginModal(true)} style={{padding:'8px 12px'}}>Login</button>
            )}
          </div>
        </div>
      </header>

      {showLoginModal && !user && (
        <LoginModal onClose={() => setShowLoginModal(false)} onSuccess={handleLoginSuccess} />
      )}

      {showCartModal && (
        <CartModal onClose={() => setShowCartModal(false)} />
      )}

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </main>
    </div>
  )
}

function LoginModal({ onClose, onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) return setMessage(data.message || 'Login gagal')
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
        onSuccess(data.user)
      }
    } catch (err) {
      setMessage('Server tidak dapat dihubungi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div className="card" style={{maxWidth:'400px',width:'90%',padding:'28px'}}>
        <h3>Login</h3>
        <form onSubmit={handleSubmit}>
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="Username" 
            disabled={loading}
            style={{width:'100%',padding:'10px',margin:'10px 0',border:'1px solid #eee',borderRadius:'8px'}}
          />
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Password" 
            disabled={loading}
            style={{width:'100%',padding:'10px',margin:'10px 0',border:'1px solid #eee',borderRadius:'8px'}}
          />
          <button className="btn" type="submit" disabled={loading} style={{width:'100%',padding:'10px',marginTop:'8px',borderRadius:'999px'}}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        {message && <p style={{color:'#b22222',marginTop:'8px'}}>{message}</p>}
        <button className="btn secondary" onClick={onClose} style={{width:'100%',marginTop:'12px'}}>Close</button>
      </div>
    </div>
  )
}

function CartModal({ onClose }) {
  const { items, update, remove, clear, count } = useCart()
  const total = items.reduce((s,i)=> s + (i.price * i.quantity), 0)

  async function handleCheckout(e){
    e.preventDefault()
    if (items.length === 0) return alert('Cart kosong')
    const payload = { payment_method: 'cash', items: items.map(i=>({ product_id: i.product_id, quantity: i.quantity })) }
    try {
      const res = await fetch('http://localhost:5000/transactions', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('accessToken')}`},
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json().catch(()=>({}))
        alert(err.message || 'Checkout gagal')
        return
      }
      const data = await res.json()
      alert('Transaksi berhasil. ID: ' + (data.transaction_id || data.id))
      clear()
      onClose()
    } catch (err) {
      alert('Gagal melakukan checkout: ' + err.message)
    }
  }

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div className="card" style={{maxWidth:'500px',width:'90%',padding:'28px',maxHeight:'80vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h3 style={{margin:0}}>🛒 Keranjang Belanja</h3>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'24px',cursor:'pointer',color:'#666'}}>✕</button>
        </div>

        {items.length === 0 ? (
          <p style={{textAlign:'center',color:'#666',padding:'40px 0'}}>Keranjang Anda kosong</p>
        ) : (
          <>
            <ul className="products-list" style={{marginBottom:'20px'}}>
              {items.map(i => (
                <li key={i.product_id} style={{alignItems:'center'}}>
                  <div>
                    <div className="product-name">{i.name}</div>
                    <div className="small">Rp {i.price.toLocaleString('id-ID')}</div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <input 
                      type="number" 
                      value={i.quantity} 
                      min={1} 
                      style={{width:60,padding:'6px',border:'1px solid #ddd',borderRadius:'4px'}} 
                      onChange={e=>update(i.product_id, Number(e.target.value))} 
                    />
                    <div className="product-price">Rp {(i.price * i.quantity).toLocaleString('id-ID')}</div>
                    <button className="btn secondary" onClick={()=>remove(i.product_id)} style={{fontSize:'0.85rem',padding:'6px 10px'}}>❌</button>
                  </div>
                </li>
              ))}
            </ul>

            <div style={{background:'#f9f9f9',padding:'16px',borderRadius:'8px',marginBottom:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div className="small">Total ({count} item)</div>
                  <div className="product-price" style={{fontSize:'1.4rem'}}>Rp {total.toLocaleString('id-ID')}</div>
                </div>
              </div>
            </div>

            <div style={{display:'flex',gap:'8px'}}>
              <button className="btn" onClick={handleCheckout} style={{flex:1}}>💳 Bayar Sekarang</button>
              <button className="btn secondary" onClick={() => clear()} style={{padding:'10px 14px'}}>Kosongkan</button>
            </div>
          </>
        )}

        <button className="btn secondary" onClick={onClose} style={{width:'100%',marginTop:'12px'}}>Tutup</button>
      </div>
    </div>
  )
}
