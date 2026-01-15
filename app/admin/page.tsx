'use client'

import { useRouter } from 'next/navigation'
import { Camera, Images, Download, Shield } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            📸 POV Event Photos
          </h1>
          <p className="text-xl text-gray-300">
            Wspólna galeria dla wszystkich gości
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Aparat */}
          <button
            onClick={() => router.push('/camera')}
            className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Camera className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Zrób zdjęcie</h2>
            <p className="text-blue-100">Otwórz aparat i dodaj foto</p>
          </button>

          {/* Galeria Live - NAPRAWIONY ROUTING */}
          <button
            onClick={() => router.push('/gallery')}
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Images className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Galeria Live</h2>
            <p className="text-purple-100">Zobacz wszystkie zdjęcia</p>
          </button>

          {/* Pobierz wszystko */}
          <button
            onClick={() => {
              const photos = sessionStorage.getItem('event_photos')
              if (photos) {
                const parsed = JSON.parse(photos)
                parsed.forEach((photo: any, index: number) => {
                  setTimeout(() => {
                    const link = document.createElement('a')
                    link.href = photo.dataUrl
                    link.download = `event_photo_${index + 1}.jpg`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }, index * 500)
                })
              }
            }}
            className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Download className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Pobierz</h2>
            <p className="text-green-100">Zapisz wszystkie zdjęcia</p>
          </button>

          {/* Admin Panel */}
          <button
            onClick={() => router.push('/admin')}
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Admin</h2>
            <p className="text-gray-300">Panel administratora</p>
          </button>
        </div>

        {/* Info */}
        <div className="mt-16 text-center text-gray-400">
          <p className="mb-2">Limit: 20 zdjęć na osobę</p>
          <p className="text-sm">Użyj przycisków głośności do robienia zdjęć</p>
        </div>
      </div>
    </div>
  )
}
