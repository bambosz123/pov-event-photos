'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Image as ImageIcon, Lock } from 'lucide-react'

interface Photo {
  id: string
  dataUrl: string
  deviceId: string
  timestamp: number
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [deviceId, setDeviceId] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Pobierz ID urządzenia
    const myDeviceId = localStorage.getItem('device_id') || ''
    setDeviceId(myDeviceId)

    // Załaduj zdjęcia
    const saved = sessionStorage.getItem('event_photos')
    if (saved) {
      try {
        setPhotos(JSON.parse(saved))
      } catch (e) {
        console.error('Load error:', e)
      }
    }
  }, [])

  const deletePhoto = (photo: Photo) => {
    // Sprawdź czy to zdjęcie należy do tego urządzenia
    if (photo.deviceId !== deviceId) {
      alert('❌ Nie możesz usunąć tego zdjęcia!\n\nMożesz usuwać tylko swoje zdjęcia.')
      return
    }

    if (confirm('Czy na pewno usunąć to zdjęcie?')) {
      const updated = photos.filter(p => p.id !== photo.id)
      setPhotos(updated)
      sessionStorage.setItem('event_photos', JSON.stringify(updated))
    }
  }

  const canDelete = (photo: Photo) => {
    return photo.deviceId === deviceId
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-purple-600 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">🖼️ Galeria</h1>
            <p className="text-purple-100 text-sm">Zdjęć: {photos.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Brak zdjęć</p>
            <p className="text-gray-500">Wróć do aparatu i zrób zdjęcie</p>
          </div>
        ) : (
          <>
            <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-blue-200 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Możesz usuwać tylko swoje zdjęcia. Zdjęcia innych użytkowników są chronione.</span>
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map(photo => (
                <div key={photo.id} className="relative group aspect-square bg-gray-800 rounded-lg overflow-hidden">
                  <img src={photo.dataUrl} className="w-full h-full object-cover" alt="Photo" />
                  
                  {/* Badge - czy to moje zdjęcie */}
                  {canDelete(photo) && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      📱 Twoje
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    {canDelete(photo) ? (
                      <button 
                        onClick={() => deletePhoto(photo)} 
                        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition"
                        title="Usuń swoje zdjęcie"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="bg-gray-700 text-white p-3 rounded-lg flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        <span className="text-sm">Chronione</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
