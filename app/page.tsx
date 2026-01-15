'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === '1921') {
      localStorage.setItem('admin_token', 'authenticated')
      router.push('/admin/dashboard')
    } else {
      alert('Błędne hasło!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Admin Panel</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Hasło..." className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" autoFocus />
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Zaloguj się</button>
        </form>
      </div>
    </div>
  )
}
