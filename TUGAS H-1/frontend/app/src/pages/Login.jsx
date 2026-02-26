import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'

export default function Login({ onLoginSuccess }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      navigate('/')
    }
  }, [navigate])

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')
    
    if (!username || !password) {
      setMessage('Username dan password tidak boleh kosong')
      setMessageType('error')
      setLoading(false)
      return
    }

    try{
      const res = await fetch('http://localhost:5000/auth/login', {
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.message || 'Login gagal')
        setMessageType('error')
        return
      }
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
        setMessage('Login berhasil! Mengalihkan...')
        setMessageType('success')
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(data.user)
          } else {
            navigate('/dashboard')
          }
        }, 1000)
      }
    }catch(err){ 
      setMessage('Server tidak dapat dihubungi')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container card">
      <h3 style={{marginTop:0}}>🔐 Login</h3>
      <p style={{color:'#666',fontSize:'0.95rem'}}>Masuk ke akun Anda untuk melanjutkan</p>
      
      <form onSubmit={handleSubmit} style={{marginTop:'20px'}}>
        <div style={{marginBottom:'16px'}}>
          <label style={{display:'block',marginBottom:'6px',fontWeight:'500',fontSize:'0.9rem'}}>Username</label>
          <input 
            value={username} 
            onChange={e=>setUsername(e.target.value)} 
            placeholder="Masukkan username" 
            disabled={loading}
            style={{width:'100%',padding:'12px',border:'1px solid #ddd',borderRadius:'8px',fontSize:'0.95rem'}}
          />
        </div>

        <div style={{marginBottom:'16px'}}>
          <label style={{display:'block',marginBottom:'6px',fontWeight:'500',fontSize:'0.9rem'}}>Password</label>
          <div style={{position:'relative',display:'flex',alignItems:'center'}}>
            <input 
              type={showPassword ? "text" : "password"}
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="Masukkan password" 
              disabled={loading}
              style={{width:'100%',padding:'12px',border:'1px solid #ddd',borderRadius:'8px',fontSize:'0.95rem'}}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{position:'absolute',right:'12px',background:'none',border:'none',cursor:'pointer',fontSize:'1.2rem'}}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <button 
          className="btn" 
          type="submit" 
          disabled={loading}
          style={{width:'100%',opacity:loading ? 0.7 : 1}}
        >
          {loading ? '⏳ Loading...' : '🚀 Login'}
        </button>
      </form>

      {message && <div style={{
        marginTop:'16px',
        padding:'12px',
        borderRadius:'8px',
        color: messageType === 'error' ? '#b22222' : '#2d5016',
        background: messageType === 'error' ? '#ffe0e0' : '#e8f5e9',
        border: `1px solid ${messageType === 'error' ? '#ff9999' : '#a5d6a7'}`,
        fontSize:'0.9rem'
      }}>
        {messageType === 'error' ? '❌' : '✅'} {message}
      </div>}

      <div style={{marginTop:'20px',paddingTop:'20px',borderTop:'1px solid #f0f0f0',fontSize:'0.85rem',color:'#666'}}>
        <p style={{margin:0}}>Test akun:</p>
        <p style={{margin:'4px 0',fontFamily:'monospace',fontSize:'0.8rem'}}>Username: user123</p>
        <p style={{margin:'4px 0',fontFamily:'monospace',fontSize:'0.8rem'}}>Password: password123</p>
      </div>
    </div>
  )
}
