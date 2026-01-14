'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function DownloadPage({ params }: { params: { eventId: string } }) {
  const [selected, setSelected] = useState<number[]>([])
  const [photos] = useState([
    { id: 1, src: 'https://via.placeholder.com/300?text=Photo+1', table: 'Stolik 1', date: '14:32' },
    { id: 2, src: 'https://via.placeholder.com/300?text=Photo+2', table: 'Stolik 2', date: '14:35' },
    { id: 3, src: 'https://via.placeholder.com/300?text=Photo+3', table: 'Stolik 1', date: '14:38' },
    { id: 4, src: 'https://via.placeholder.com/300?text=Photo+4', table: 'Stolik 3', date: '14:41' },
    { id: 5, src: 'https://via.placeholder.com/300?text=Photo+5', table: 'Stolik 2', date: '14:44' },
    { id: 6, src: 'https://via.placeholder.com/300?text=Photo+6', table: 'Stolik 1', date: '14:47' },
  ])

  const toggleSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  const selectAll = () => {
    if (selected.length === photos.length) {
      setSelected([])
    } else {
      setSelected(photos.map(p => p.id))
    }
  }

  const downloadPhotos = () => {
    const count = selected.length || photos.length
    toast.success(`Pobieranie ${count} zdjęć jako ZIP... 📦`)
    console.log('Downloading:', count, 'photos')
  }

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              Powrót
            </Link>
            <h1 className="text-3xl font-bold text-white">⬇️ Pobierz zdjęcia</h1>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-gray-400">
              Wybrane: <span className="text-white font-bold">{selected.length} / {photos.length}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                {selected.length === photos.length ? '❌ Odznacz' : '✓ Zaznacz wszystko'}
              </button>
              <button
                onClick={downloadPhotos}
                disabled={photos.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold transition flex items-center gap-2"
              >
                📦 Pobierz ({selected.length || photos.length})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 flex-wrap">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Wszystkie</button>
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600">Stolik 1</button>
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600">Stolik 2</button>
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600">Stolik 3</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div 
              key={photo.id}
              onClick={() => toggleSelect(photo.id)}
              className={`relative rounded-lg overflow-hidden cursor-pointer transition transform hover:scale-105 ${
                selected.includes(photo.id)
                  ? 'ring-4 ring-blue-500 shadow-2xl'
                  : 'shadow-lg hover:shadow-2xl'
              }`}
            >
              <img 
                src={photo.src} 
                alt={`Photo ${photo.id}`} 
                className="w-full h-48 object-cover"
              />
              
              {selected.includes(photo.id) && (
                <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                  <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center">
                    <div className="text-white text-2xl font-bold">✓</div>
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="text-white text-xs">{photo.table}</div>
                <div className="text-gray-300 text-xs">{photo.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 p-6 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-gray-400 mb-4">
            Dostępne opcje pobierania:
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">
              📦 ZIP
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition">
              📄 PDF Album
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition">
              🖼️ Kolaż 2x2
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">
              🔗 Share Link
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
