'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function GalleryPage({ params }: { params: { eventId: string } }) {
  const [photos] = useState([
    { id: 1, src: 'https://via.placeholder.com/400x300?text=Zdjęcie+1', likes: 12, views: 45 },
    { id: 2, src: 'https://via.placeholder.com/400x300?text=Zdjęcie+2', likes: 8, views: 32 },
    { id: 3, src: 'https://via.placeholder.com/400x300?text=Zdjęcie+3', likes: 15, views: 58 },
    { id: 4, src: 'https://via.placeholder.com/400x300?text=Zdjęcie+4', likes: 5, views: 21 },
    { id: 5, src: 'https://via.placeholder.com/400x300?text=Zdjęcie+5', likes: 20, views: 72 },
    { id: 6, src: 'https://via.placeholder.com/400x300?text=Zdjęcie+6', likes: 11, views: 41 },
  ])
  const [filter, setFilter] = useState('all')

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Powrót
              </Link>
              <h1 className="text-3xl font-bold text-white">🖼️ Galeria Live</h1>
            </div>
            <div className="text-gray-400 text-sm">
              {photos.length} zdjęć • 7 osób ogląda 🔴
            </div>
          </div>

          <div className="flex gap-2">
            {['all', 'popular', 'newest'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {f === 'all' ? 'Wszystkie' : f === 'popular' ? 'Popularne' : 'Najnowsze'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div
              key={photo.id}
              className="relative group bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition shadow-lg hover:shadow-2xl"
            >
              <img
                src={photo.src}
                alt="Photo"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                <div className="text-white font-bold text-lg">❤️ {photo.likes}</div>
                <div className="text-gray-300 text-sm">👁️ {photo.views} views</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
