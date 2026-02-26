import React, { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }){
  const [items, setItems] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('cart')||'[]') }catch(e){return []}
  })

  useEffect(()=>{ localStorage.setItem('cart', JSON.stringify(items)) },[items])

  function add(item){
    setItems(prev=>{
      const found = prev.find(p=>p.product_id===item.product_id)
      if (found) return prev.map(p=> p.product_id===item.product_id ? {...p, quantity: p.quantity + item.quantity} : p)
      return [...prev, item]
    })
  }
  function remove(product_id){ setItems(prev => prev.filter(p=>p.product_id !== product_id)) }
  function update(product_id, qty){ setItems(prev => prev.map(p=> p.product_id===product_id ? {...p, quantity: qty} : p)) }
  function clear(){ setItems([]) }
  const count = items.reduce((s,i)=>s + (i.quantity||0), 0)

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(){ return useContext(CartContext) }
