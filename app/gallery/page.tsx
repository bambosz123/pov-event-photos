'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, X, ChevronLeft, ChevronRight, Star, Image as ImageIcon } from 'lucide-react'
import { supabase, Photo } from '@/lib/supabase'

export default function GalleryPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [deviceId, setDeviceId] = useState<string>('')

  useEffect(() => {
    const id = localStorage.getItem('device_id') || ''
    setDeviceId(id)
    loadPhotos()
    setTimeout(() => setMounted(true), 100)
  }, [])

  const loadPhotos = async () => {
    setLoading(true)

    const { data: eventData } = await supabase
      .from('events')
      .select('id')
      .eq('is_active', true)
      .single()

    if (!eventData) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', eventData.id)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error loading photos:', error)
    } else {
      setPhotos(data || [])
    }

    setLoading(false)
  }

  const deletePhoto = async (photo: Photo) => {
    if (!confirm('Usunąć to zdjęcie?')) return

    const { error: storageError } = await supabase.storage
      .from('photos')
      .remove([photo.storage_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
    }

    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photo.id)

    if (dbError) {
      alert('Błąd usuwania zdjęcia')
    } else {
      setPhotos(photos.filter(p => p.id !== photo.id))
      if (selectedIndex !== null) {
        setSelectedIndex(null)
      }
    }
  }

  const canDelete = (photo: Photo) => {
    return photo.device_id === deviceId
  }

  const getPhotoUrl = (storagePath: string) => {
    if (storagePath.startsWith('http')) {
      return storagePath
    }
    const { data } = supabase.storage
      .from('photos')
      .getPublicUrl(storagePath)
    return data.publicUrl
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (selectedIndex === null) return
    
    if (direction === 'prev' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    } else if (direction === 'next' && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      
      if (e.key === 'ArrowLeft') navigatePhoto('prev')
      if (e.key === 'ArrowRight') navigatePhoto('next')
      if (e.key === 'Escape') setSelectedIndex(null)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedIndex])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-[3px] border-slate-700/30 rounded-full"></div>
          <div className="absolute inset-0 w-20 h-20 border-[3px] border-transparent border-t-slate-300 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')} 
              className="bg-slate-800/90 hover:bg-slate-700/90 p-3 rounded-2xl border border-slate-600/50 transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-slate-200" strokeWidth={2} />
            </button>
            
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-slate-600 p-2.5 rounded-xl">
                <ImageIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-white">Galeria</h1>
                <p className="text-slate-400 text-sm">{photos.length} zdjęć</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {photos.length === 0 ? (
          <div className="text-center py-24">
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-16 border border-slate-600/40 max-w-md mx-auto">
              <ImageIcon className="w-20 h-20 text-slate-600 mx-auto mb-6" strokeWidth={1.5} />
              <h2 className="text-3xl font-semibold text-white mb-3">Brak zdjęć</h2>
              <p className="text-slate-400 text-lg mb-8">Nie ma jeszcze żadnych zdjęć</p>
              <button
                onClick={() => router.push('/camera')}
                className="bg-slate-600 hover:bg-slate-500 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95"
              >
                Zrób pierwsze zdjęcie
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="group relative bg-slate-800/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-600/40 hover:border-slate-400/60 transition-all"
              >
                {/* Obraz - KLIKALNE */}
                <div 
                  className="aspect-square overflow-hidden bg-slate-900/50 cursor-pointer"
                  onClick={() => setSelectedIndex(index)}
                >
                  <img 
                    src={getPhotoUrl(photo.storage_path)} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt="Photo"
                  />
                </div>
                
                {/* Overlay - ZAWSZE WIDOCZNE */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2 flex items-end justify-end">
                  {canDelete(photo) && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePhoto(photo)
                      }} 
                      className="bg-red-900/90 hover:bg-red-800 active:bg-red-700 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg transition-all duration-300 active:scale-95 flex items-center gap-1.5 text-xs font-semibold border border-red-700/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Usuń</span>
                    </button>
                  )}
                </div>

                {/* Badge */}
                {canDelete(photo) && (
                  <div className="absolute top-2 left-2 bg-slate-700/95 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-white" strokeWidth={2} />
                    <span className="text-[10px]">Yours</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-xl p-3 rounded-full border border-white/20"
          >
            <X className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>

          {selectedIndex > 0 && (
            <button
              onClick={() => navigatePhoto('prev')}
              className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-xl p-4 rounded-full border border-white/20"
            >
              <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          )}

          {selectedIndex < photos.length - 1 && (
            <button
              onClick={() => navigatePhoto('next')}
              className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-xl p-4 rounded-full border border-white/20"
            >
              <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          )}

          <img
            src={getPhotoUrl(photos[selectedIndex].storage_path)}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
            <span className="text-white text-sm font-medium">
              {selectedIndex + 1} / {photos.length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
