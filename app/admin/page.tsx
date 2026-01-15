'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Loader2, AlertTriangle, QrCode, Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { QRCodeSVG } from 'qrcode.react' // ← ZMIANA!

const ADMIN_PASSWORD = 'zuziek'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [photoCount, setPhotoCount] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const router = useRouter()

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in')
    if (isLoggedIn === 'true') {
      setIsAuthenticated(true)
      loadPhotoCount()
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_logged_in', 'true')
      loadPhotoCount()
    } else {
      alert('❌ Nieprawidłowe hasło!')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin_logged_in')
    setPassword('')
  }

  const loadPhotoCount = async () => {
    const { data: eventData } = await supabase
      .from('events')
      .select('id')
      .eq('is_active', true)
      .single()

    if (!eventData) return

    const { count } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventData.id)

    setPhotoCount(count || 0)
  }

  const deleteAllPhotos = async () => {
    setLoading(true)

    const { data: eventData } = await supabase
      .from('events')
      .select('id')
      .eq('is_active', true)
      .single()

    if (!eventData) {
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('event_id', eventData.id)

    if (error) {
      console.error('Delete error:', error)
      alert('❌ Błąd podczas usuwania')
    } else {
      alert('✅ Usunięto wszystkie zdjęcia!')
      setPhotoCount(0)
    }

    setLoading(false)
    setShowConfirm(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">🔐 Panel Admina</h1>
            <p className="text-gray-400">Wprowadź hasło aby kontynuować</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Hasło administratora"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold transition"
            >
              Zaloguj się
            </button>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition"
            >
              Powrót
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-orange-600 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">🔐 Panel Admina</h1>
              <p className="text-orange-100 text-sm">Zarządzanie zdjęciami</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            🚪 Wyloguj
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-white text-xl font-bold mb-2">📊 Statystyki</h2>
          <p className="text-gray-400">
            Zdjęć w galerii: <span className="text-white font-bold text-2xl">{photoCount}</span>
          </p>
        </div>

        {/* QR Code Generator */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-2">
              <QrCode className="w-6 h-6" />
              Generator QR Code
            </h2>
            <button
              onClick={() => setShowQR(!showQR)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              {showQR ? 'Ukryj' : 'Pokaż'}
            </button>
          </div>

          {showQR && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl flex flex-col items-center">
                <QRCodeSVG value={appUrl} size={256} /> {/* ← ZMIANA! */}
                <p className="text-gray-700 mt-4 text-sm font-mono break-all text-center">
                  {appUrl}
                </p>
              </div>
              <p className="text-gray-400 text-sm text-center">
                Zeskanuj kodem QR aby otworzyć aplikację na telefonie
              </p>
              <button
                onClick={() => window.print()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
              >
                🖨️ Drukuj QR Code
              </button>
            </div>
          )}
        </div>

        <div className="bg-red-900/20 border-2 border-red-500 rounded-xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h2 className="text-white text-xl font-bold mb-2">⚠️ Strefa niebezpieczna</h2>
              <p className="text-gray-400 mb-4">
                Ta akcja usunie <span className="text-red-400 font-bold">WSZYSTKIE {photoCount} zdjęć</span> z galerii. 
                Nie można tego cofnąć!
              </p>
            </div>
          </div>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={photoCount === 0}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Usuń wszystkie zdjęcia
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-yellow-400 font-bold text-center">
                ⚠️ NA PEWNO? To usunie {photoCount} zdjęć!
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition"
                >
                  ❌ Anuluj
                </button>
                <button
                  onClick={deleteAllPhotos}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Usuwanie...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      TAK, USUŃ
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/camera')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
          >
            📸 Aparat
          </button>
          <button
            onClick={() => router.push('/gallery')}
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition"
          >
            🖼️ Galeria
          </button>
          <button
            onClick={() => router.push('/download')}
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition"
          >
            📥 Pobierz
          </button>
        </div>
      </div>
    </div>
  )
}
