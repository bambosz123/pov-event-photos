'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Image as ImageIcon, Lock, X, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { supabase, Photo } from '@/lib/supabase'
import PendingUploader from '@/components/PendingUploader'

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [deviceId, setDeviceId] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    const myDeviceId = localStorage.getItem('device_id') || ''
    setDeviceId(myDeviceId)
    loadPhotos()
    setTimeout(() => setMounted(true), 100)

    const channel = supabase
      .channel('photos-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'photos' 
      }, () => {
        loadPhotos()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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
      console.error('Load error:', error)
    } else {
      setPhotos(data || [])
    }
    setLoading(false)
  }

  const deletePhoto = async (photo: Photo) => {
    if (photo.device_id !== deviceId) {
      alert('❌ You can only delete your own photos')
      return
    }

    if (confirm('Delete this photo?')) {
      await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id)

      loadPhotos()
      setSelectedIndex(null)
    }
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

  const canDelete = (photo: Photo) => photo.device_id === deviceId

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
    if (isRightSwipe && selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }

    touchStartX.current = 0
    touchEndX.current = 0
  }

  const nextPhoto = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-[3px] border-slate-700/30 rounded-full"></div>
          <div className="absolute inset-0 w-20 h-20 border-[3px] border-transparent border-t-slate-300 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-[3px] border-slate-400/20 rounded-full blur-md"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-gradient-to-br from-slate-400/6 to-transparent rounded-full blur-[100px] animate-float"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-400/5 to-transparent rounded-full blur-[120px] animate-float-delayed"></div>
        
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-slate-400 rounded-full opacity-20 animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(203,213,225,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(203,213,225,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <PendingUploader />
      
      {/* Header Premium */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-2xl border-b border-slate-700/50 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <button 
                onClick={() => router.push('/')} 
                className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 hover:from-slate-700/90 hover:to-slate-800/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-600/50 transition-all duration-300 active:scale-95 shadow-lg shrink-0"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-200 group-hover:-translate-x-0.5 transition-transform duration-300" strokeWidth={2} />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white tracking-wide truncate">Galeria</h1>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"></div>
                  <p className="text-slate-400 text-xs sm:text-sm tracking-wide">{photos.length} Zdjęć</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zawartość */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10 pb-24">
        {photos.length === 0 ? (
          <div className={`text-center py-16 sm:py-24 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="inline-block bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 backdrop-blur-2xl p-10 sm:p-16 rounded-[32px] border border-slate-600/50 mb-6 sm:mb-8 shadow-[0_16px_64px_rgba(15,23,42,0.6)] relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700/10 to-transparent rounded-[32px]"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-400/5 via-blue-400/5 to-slate-400/5 blur-2xl rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <ImageIcon className="w-20 h-20 sm:w-24 sm:h-24 text-slate-600 mx-auto relative" strokeWidth={1.3} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2 sm:mb-3">Nie ma jeszcze żadnych zdjęć</h2>
            <p className="text-slate-400 text-base sm:text-lg mb-6 sm:mb-8">Zacznij zdobywać niezapomniane momenty </p>
            <button
              onClick={() => router.push('/camera')}
              className="group relative bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-semibold shadow-[0_0_40px_rgba(29,78,216,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] transition-all duration-500 active:scale-95 text-sm sm:text-base"
            >
              <span className="relative z-10">Otwórz Kamerę</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </div>
        ) : (
          <>
            {/* Info box */}
            <div className={`bg-gradient-to-r from-blue-900/15 via-slate-800/15 to-blue-900/15 backdrop-blur-sm border border-blue-800/30 rounded-2xl sm:rounded-3xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-[0_4px_24px_rgba(30,58,138,0.2)] transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="flex items-start sm:items-center gap-3">
                <div className="shrink-0 bg-gradient-to-br from-blue-600 to-blue-800 p-2 rounded-lg">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
                </div>
                <p className="text-blue-200 text-xs sm:text-sm tracking-wide leading-relaxed">
                  Tap any photo to view. Swipe to navigate. You can delete only your photos.
                </p>
              </div>
            </div>

            {/* Galeria - masonry grid */}
            <div className="columns-2 lg:columns-3 xl:columns-4 gap-3 sm:gap-4 lg:gap-6 space-y-3 sm:space-y-4 lg:space-y-6">
              {photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className={`group relative break-inside-avoid transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                  style={{ transitionDelay: `${Math.min(index * 50, 800)}ms` }}
                >
                  <div className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-600/40 group-hover:border-slate-400/60 transition-all duration-500 shadow-[0_8px_32px_rgba(15,23,42,0.4)] group-hover:shadow-[0_16px_48px_rgba(100,116,139,0.3)]">
                    
                    {/* Obraz */}
                    <div className="relative overflow-hidden">
                      <img 
                        src={getPhotoUrl(photo.storage_path)} 
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" 
                        alt="Photo"
                        loading="lazy"
                      />
                      
                      {/* Overlay - zawsze widoczne przyciski */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-transparent opacity-100 flex items-end p-3 sm:p-4">
                        <div className="flex gap-2 w-full">
                          {/* Przycisk Zobacz - ZAWSZE */}
                          <button
                            onClick={() => setSelectedIndex(index)}
                            className="flex-1 bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-md text-white py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-white/20 text-sm active:scale-95 min-h-[48px]"
                          >
                            <span>Zobacz</span>
                          </button>
                          
                          {/* Przycisk Usuń - TYLKO TWOJE */}
                          {canDelete(photo) && (
                            <button 
                              onClick={() => deletePhoto(photo)} 
                              className="bg-red-900/80 hover:bg-red-800 active:bg-red-700 backdrop-blur-md text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 border border-red-700/50 active:scale-95 min-h-[48px] font-semibold text-sm flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={2} />
                              <span className="hidden sm:inline">Usuń</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badge - Twoje zdjęcie */}
                    {canDelete(photo) && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-slate-700/95 to-slate-600/95 backdrop-blur-md text-white text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold shadow-lg border border-slate-500/50 flex items-center gap-1.5">
                        <Star className="w-3 h-3 fill-white" strokeWidth={2} />
                        <span>Yours</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal pełnego zdjęcia - z SWIPE */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-50 flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-xl p-3 sm:p-3.5 rounded-full transition-all duration-300 border border-slate-600/50 shadow-[0_4px_24px_rgba(0,0,0,0.6)] active:scale-95 z-20 min-w-[48px] min-h-[48px] flex items-center justify-center"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
          </button>

          {/* Navigation arrows - desktop */}
          {selectedIndex > 0 && (
            <button
              onClick={prevPhoto}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-xl p-3 rounded-full transition-all duration-300 border border-slate-600/50 active:scale-95 z-20"
            >
              <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          )}
          
          {selectedIndex < photos.length - 1 && (
            <button
              onClick={nextPhoto}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-xl p-3 rounded-full transition-all duration-300 border border-slate-600/50 active:scale-95 z-20"
            >
              <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          )}
          
          {/* Image container */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={getPhotoUrl(photos[selectedIndex].storage_path)}
              className="max-w-full max-h-full object-contain rounded-2xl sm:rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] border border-slate-700/50"
              alt="Full size"
            />
          </div>

          {/* Counter + Delete button - bottom */}
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4 px-4">
            <div className="bg-slate-800/90 backdrop-blur-xl px-4 py-2 rounded-full border border-slate-600/50 text-white text-sm font-medium">
              {selectedIndex + 1} / {photos.length}
            </div>
            
            {canDelete(photos[selectedIndex]) && (
              <button
                onClick={() => deletePhoto(photos[selectedIndex])}
                className="bg-red-900/90 hover:bg-red-800 backdrop-blur-xl text-white px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 border border-red-700/50 transition-all duration-300 active:scale-95 min-h-[48px] text-sm shadow-lg"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
