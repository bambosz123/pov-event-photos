'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, QrCode, BarChart3, Download, Settings, LogOut, Users, Image as ImageIcon } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [qrUrl, setQrUrl] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [photos, setPhotos] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }
    
    // Policz zdjęcia
    const saved = sessionStorage.getItem('event_photos')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPhotos(parsed.length)
      } catch (e) {}
    }
  }, [])

  const generateQR = () => {
    const eventUrl = `${window.location.origin}/camera`
    setQrUrl(eventUrl)
    setShowQR(true)
  }

  const downloadQR = () => {
    if (!qrUrl) return
    const link = document.createElement('a')
    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrUrl)}`
    link.download = 'QR_Event_Camera.png'
    link.click()
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin')
  }

  const clearAllPhotos = () => {
    if (confirm('Czy na pewno usunąć wszystkie zdjęcia?')) {
      sessionStorage.removeItem('event_photos')
      setPhotos(0)
      alert('Wszystkie zdjęcia zostały usunięte')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-white">🛡️ Panel Admina</h1>
          </div>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
            <LogOut className="w-5 h-5" />
            Wyloguj
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Grid */}
        <h2 className="text-2xl font-bold text-white mb-6">📊 Statystyki</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700 shadow-xl">
            <ImageIcon className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="text-blue-300 text-sm mb-1">Wszystkich zdjęć</h3>
            <p className="text-4xl font-bold text-white">{photos}</p>
          </div>

          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border border-green-700 shadow-xl">
            <Users className="w-10 h-10 text-green-400 mb-3" />
            <h3 className="text-green-300 text-sm mb-1">Aktywnych użytkowników</h3>
            <p className="text-4xl font-bold text-white">1</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700 shadow-xl">
            <BarChart3 className="w-10 h-10 text-purple-400 mb-3" />
            <h3 className="text-purple-300 text-sm mb-1">Aktywnych eventów</h3>
            <p className="text-4xl font-bold text-white">1</p>
          </div>
        </div>

        {/* QR Generator */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <QrCode className="w-8 h-8 text-purple-400" />
            Generator QR
          </h2>
          <p className="text-gray-400 mb-6">Wygeneruj kod QR do aplikacji kamery dla gości</p>
          
          <button 
            onClick={generateQR}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg"
          >
            🎯 Generuj QR kod
          </button>

          {showQR && qrUrl && (
            <div className="mt-8 bg-white p-8 rounded-2xl inline-block shadow-2xl">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}`}
                alt="QR Code"
                className="w-80 h-80 mb-4"
              />
              <p className="text-center text-sm text-gray-600 mb-4 break-all max-w-md">
                {qrUrl}
              </p>
              <button 
                onClick={downloadQR}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Pobierz QR jako PNG
              </button>
            </div>
          )}
        </div>

        {/* Management */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Settings className="w-8 h-8 text-orange-400" />
            Zarządzanie
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-white font-bold mb-2">🗑️ Wyczyść zdjęcia</h3>
              <p className="text-gray-400 text-sm mb-4">Usuń wszystkie zdjęcia z eventu (akcja nieodwracalna)</p>
              <button 
                onClick={clearAllPhotos}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition"
              >
                Usuń wszystkie zdjęcia
              </button>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-white font-bold mb-2">📥 Export danych</h3>
              <p className="text-gray-400 text-sm mb-4">Eksportuj wszystkie zdjęcia jako ZIP</p>
              <Link 
                href="/download"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition"
              >
                Przejdź do pobierania
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
