'use client'
import { useState, useEffect } from 'react'

export default function PhotoGallery({ eventId, tableId }: any) {
  const [photos, setPhotos] = useState([
    { id: 1, src: 'https://via.placeholder.com/400x300?text=Zdjęcie+1', likes: 5 },
    { id: 2, src: 'https://via.placeholder.com/400x300?text=Zdjęcie+2', likes: 8 },
    { id: 3, src: 'https://via.placeholder.com/400x300?text=Zdjęcie+3', likes: 3 },
    { id: 4, src: 'https://via.placeholder.com/400x300?text=Zdjęcie+4', likes: 12 },
  ])
  const [filter, setFilter] = useState('newest')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-2">🖼️ Galeria Live</h2>
        <p className="text-lg text-gray-400">{photos.length} zdjęć • 5 osób ogląda</p>
      </div>

      <div className="flex gap-2 justify-center">
        {['newest', 'popular', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {f === 'newest' ? 'Najnowsze' : f === 'popular' ? 'Popularne' : 'Wszystkie'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map(photo => (
          <div
            key={photo.id}
            className="relative group bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition"
          >
            <img
              src={photo.src}
              alt="Photo"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-end p-3">
              <div className="text-white font-bold">❤️ {photo.likes}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
