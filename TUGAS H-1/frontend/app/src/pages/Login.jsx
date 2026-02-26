import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e){
    e.preventDefault()
    try{
      const res = await fetch('http://localhost:5000/auth/login', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) return setMessage(data.message || 'Login gagal')
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    }catch(err){ setMessage('Server tidak dapat dihubungi') }
  }

  return (
    <div className="login-container card">
      <h3>Login</h3>
      <form onSubmit={handleSubmit}>
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button className="btn" type="submit">Login</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  )
}
