'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import CameraCapture from '@/components/Camera/CameraCapture'
import PhotoGallery from '@/components/Gallery/PhotoGallery'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EventTablePage() {
  const params = useParams()
  const eventId = params?.eventId as string
  const tableId = params?.tableId as string
  const [view, setView] = useState<'camera' | 'gallery'>('camera')

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Powrót
            </Link>
            <h1 className="text-2xl font-bold text-white">📸 POV Event Photos</h1>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 flex">
          <button
            onClick={() => setView('camera')}
            className={`px-6 py-4 font-bold text-lg transition border-b-4 ${
              view === 'camera'
                ? 'text-blue-400 border-b-blue-400 bg-gray-700'
                : 'text-gray-400 border-b-transparent hover:text-white hover:bg-gray-700'
            }`}
          >
            📷 Aparat
          </button>
          <button
            onClick={() => setView('gallery')}
            className={`px-6 py-4 font-bold text-lg transition border-b-4 ${
              view === 'gallery'
                ? 'text-blue-400 border-b-blue-400 bg-gray-700'
                : 'text-gray-400 border-b-transparent hover:text-white hover:bg-gray-700'
            }`}
          >
            🖼️ Galeria Live
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-6">
        {/* APARAT - pokazuje się TYLKO gdy view === 'camera' */}
        {view === 'camera' && (
          <div className="animate-fadeIn">
            <CameraCapture 
              eventId={eventId} 
              tableId={tableId}
              tableName={`Stolik ${tableId}`}
            />
          </div>
        )}

        {/* GALERIA - pokazuje się TYLKO gdy view === 'gallery' */}
        {view === 'gallery' && (
          <div className="animate-fadeIn">
            <PhotoGallery 
              eventId={eventId} 
              tableId={tableId}
            />
          </div>
        )}
      </div>
    </main>
  )
}
