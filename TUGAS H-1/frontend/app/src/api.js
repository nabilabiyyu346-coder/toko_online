const BASE_URL = 'http://localhost:5000'

function getAccessToken(){ return localStorage.getItem('accessToken') }
function setAccessToken(t){ localStorage.setItem('accessToken', t) }
function getRefreshToken(){ return localStorage.getItem('refreshToken') }

async function refreshAccessToken(){
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  try{
    const res = await fetch(BASE_URL + '/auth/refresh', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ refreshToken })
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.accessToken) setAccessToken(data.accessToken)
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
    return data.accessToken
  }catch(e){ return null }
}

export async function apiFetch(path, options={}){
  const url = path.startsWith('http') ? path : BASE_URL + path
  options.headers = options.headers || {}
  const token = getAccessToken()
  if (token) options.headers['Authorization'] = 'Bearer ' + token

  let res = await fetch(url, options)
  if (res.status === 401){
    const newToken = await refreshAccessToken()
    if (newToken){
      options.headers['Authorization'] = 'Bearer ' + newToken
      res = await fetch(url, options)
    }
  }
  return res
}

export { BASE_URL }
