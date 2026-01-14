'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Download, Trash2, ArrowLeft, Image as ImageIcon } from 'lucide-react'

interface Photo {
  id: string
  dataUrl: string
  timestamp: Date
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const eventId = searchParams.get('eventId') || 'unknown'

  useEffect(() => {
    // Załaduj zdjęcia z sessionStorage
    const saved = sessionStorage.getItem(`photos_${eventId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPhotos(parsed)
      } catch (e) {
        console.error('Error loading photos:', e)
      }
    }
  }, [eventId])

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a')
    link.href = photo.dataUrl
    link.download = `foto_${photo.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const deletePhoto = (id: string) => {
    const updated = photos.filter(p => p.id !== id)
    setPhotos(updated)
    sessionStorage.setItem(`photos_${eventId}`, JSON.stringify(updated))
  }

  const downloadAll = () => {
    photos.forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = photo.dataUrl
        link.download = `foto_${index + 1}_${photo.id}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, index * 500)
    })
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">📸 Galeria</h1>
              <p className="text-blue-100 text-sm">Event: {eventId}</p>
            </div>
          </div>
          {photos.length > 0 && (
            <button
              onClick={downloadAll}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Pobierz wszystko ({photos.length})
            </button>
          )}
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-6xl mx-auto p-4">
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Brak zdjęć</p>
            <p className="text-gray-500 text-sm">Wróć do aparatu i zrób zdjęcie</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition">
                <div className="relative aspect-square group">
                  <img
                    src={photo.dataUrl}
                    alt="Photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => downloadPhoto(photo)}
                      className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                      title="Pobierz"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition"
                      title="Usuń"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-gray-700">
                  <p className="text-white text-sm">{photo.id}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(photo.timestamp).toLocaleString('pl-PL')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
