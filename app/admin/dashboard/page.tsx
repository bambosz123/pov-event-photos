'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) router.push('/admin')
  }, [])

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-black border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Panel Admina</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Statystyki</h2>
          <p className="text-gray-400">Panel administracyjny działa poprawnie</p>
        </div>
      </div>
    </div>
  )
}
