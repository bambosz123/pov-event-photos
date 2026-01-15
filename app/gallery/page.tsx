'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Trash2, Image as ImageIcon } from 'lucide-react'

interface Photo {
  id: string
  dataUrl: string
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const router = useRouter()

  useEffect(() => {
    const saved = sessionStorage.getItem('event_photos')
    if (saved) {
      try {
        setPhotos(JSON.parse(saved))
      } catch (e) {
        console.error('Load error:', e)
      }
    }
  }, [])

  const deletePhoto = (id: string) => {
    const updated = photos.filter(p => p.id !== id)
    setPhotos(updated)
    sessionStorage.setItem('event_photos', JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-blue-600 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-white">
  <ArrowLeft className="w-6 h-6" />
</button>
          <div>
            <h1 className="text-2xl font-bold text-white">Galeria</h1>
            <p className="text-blue-100 text-sm">Zdjęć: {photos.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Brak zdjęć</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group aspect-square">
                <img src={photo.dataUrl} className="w-full h-full object-cover rounded-lg" />
                <button onClick={() => deletePhoto(photo.id)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
