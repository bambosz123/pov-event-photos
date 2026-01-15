'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, CheckSquare, Square } from 'lucide-react'

interface Photo {
  id: string
  dataUrl: string
}

export default function DownloadPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    const saved = sessionStorage.getItem('event_photos')
    if (saved) {
      try {
        setPhotos(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const selectAll = () => {
    setSelected(new Set(photos.map(p => p.id)))
  }

  const downloadSelected = () => {
    photos.filter(p => selected.has(p.id)).forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = photo.dataUrl
        link.download = `foto_${index + 1}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, index * 300)
    })
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-green-600 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Pobierz</h1>
              <p className="text-green-100 text-sm">Zaznaczono: {selected.size}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={selectAll} className="bg-white text-green-600 px-4 py-2 rounded-lg font-bold">
              Zaznacz wszystkie
            </button>
            <button onClick={downloadSelected} disabled={selected.size === 0} className="bg-green-800 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50">
              <Download className="w-5 h-5 inline mr-2" />
              Pobierz ({selected.size})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div key={photo.id} onClick={() => toggleSelect(photo.id)} className="relative cursor-pointer group">
              <img src={photo.dataUrl} className="w-full aspect-square object-cover rounded-lg" />
              <div className="absolute top-2 right-2">
                {selected.has(photo.id) ? (
                  <CheckSquare className="w-8 h-8 text-green-500 bg-white rounded" />
                ) : (
                  <Square className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
