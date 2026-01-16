'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, X, ChevronLeft, ChevronRight, Star, Image as ImageIcon, Loader2 } from 'lucide-react'
import { supabase, Photo } from '@/lib/supabase'

export default function GalleryPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [deviceId, setDeviceId] = useState<string>('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  const PHOTOS_PER_PAGE = 20

  useEffect(() => {
    const id = localStorage.getItem('device_id') || ''
    setDeviceId(id)
    setTimeout(() => setMounted(true), 100)
    loadPhotos(0)
  }, [])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore()
        }
      },
      { threshold: 0.5 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore])

  const loadPhotos = async (pageNum: number) => {
    if (pageNum === 0) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    const { data: eventData } = await supabase
      .from('events')
      .select('id')
      .eq('is_active', true)
      .single()

    if (!eventData) {
      setLoading(false)
      setLoadingMore(false)
      return
    }

    const from = pageNum * PHOTOS_PER_PAGE
    const to = from + PHOTOS_PER_PAGE - 1

    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', eventData.id)
      .order('uploaded_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error loading photos:', error)
    } else {
      if (pageNum === 0) {
        setPhotos(data || [])
      } else {
        setPhotos(prev => [...prev, ...(data || [])])
      }
      setHasMore((data || []).length === PHOTOS_PER_PAGE)
    }

    setLoading(false)
    setLoadingMore(false)
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadPhotos(nextPage)
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
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-gradient-to-br from-slate-400/6 to-transparent rounded-full blur-[100px] animate-float"></div>
        <div className="absolute bottom-[20%] right-[15%] w-[600px] h-[600px] bg-gradient-to-br from-blue-400/5 to-transparent rounded-full blur-[120px] animate-float-delayed"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(203,213,225,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(203,213,225,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-2xl border-b border-slate-700/50 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <button 
                onClick={() => router.push('/')} 
                className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 hover:from-slate-700/90 hover:to-slate-800/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-600/50 transition-all duration-300 active:scale-95 shadow-lg shrink-0"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-200" strokeWidth={2} />
              </button>
              
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <div className="relative bg-gradient-to-br from-slate-500 to-slate-700 p-2 sm:p-2.5 rounded-xl">
                    <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white tracking-wide truncate">Galeria</h1>
                  <p className="text-slate-400 text-xs sm:text-sm truncate">{photos.length} zdjęć</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        
        {photos.length === 0 ? (
          <div className={`text-center py-16 sm:py-24 transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 backdrop-blur-2xl rounded-3xl p-12 sm:p-16 border border-slate-600/40 shadow-[0_8px_32px_rgba(15,23,42,0.4)] max-w-md mx-auto">
              <ImageIcon className="w-20 h-20 text-slate-600 mx-auto mb-6" strokeWidth={1.5} />
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">Brak zdjęć</h2>
              <p className="text-slate-400 text-base sm:text-lg mb-8">Nie ma jeszcze żadnych zdjęć w galerii</p>
              <button
                onClick={() => router.push('/camera')}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_0_40px_rgba(100,116,139,0.4)] transition-all duration-500 active:scale-95"
              >
                Zrób pierwsze zdjęcie
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Masonry grid */}
            <div className="columns-2 lg:columns-3 xl:columns-4 gap-3 sm:gap-4 lg:gap-6 space-y-3 sm:space-y-4 lg:space-y-6">
              {photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className={`group relative break-inside-avoid transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                  style={{ transitionDelay: `${Math.min(index * 30, 600)}ms` }}
                >
                  <div className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-600/40 group-hover:border-slate-400/60 transition-all duration-500 shadow-[0_8px_32px_rgba(15,23,42,0.4)] group-hover:shadow-[0_16px_48px_rgba(100,116,139,0.3)]">
                    
                    {/* Obraz */}
                    <div className="relative overflow-hidden bg-slate-900/50">
                      <img 
                        src={getPhotoUrl(photo.storage_path)} 
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" 
                        alt="Photo"
                        loading="lazy"
                        decoding="async"
                        onLoad={(e) => {
                          e.currentTarget.style.opacity = '1'
                        }}
                        style={{ opacity: 0, transition: 'opacity 0.5s ease-in-out' }}
                      />
                    </div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-transparent opacity-100 flex items-end p-3 sm:p-4">
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => setSelectedIndex(index)}
                          className="flex-1 bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-md text-white py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-white/20 text-sm active:scale-95 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                          <span>Zobacz</span>
                        </button>
                        
                        {canDelete(photo) && (
                          <button 
                            onClick={() => deletePhoto(photo)} 
                            className="bg-red-900/80 hover:bg-red-800 active:bg-red-700 backdrop-blur-md text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 border border-red-700/50 active:scale-95 min-h-[48px] font-semibold text-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={2} />
                            <span className="hidden sm:inline">Usuń</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Badge */}
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

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="h-20 flex items-center justify-center mt-8">
              {loadingMore && (
                <div className="flex items-center gap-3 bg-slate-800/60 backdrop-blur-xl px-6 py-3 rounded-full border border-slate-600/50">
                  <Loader2 className="w-5 h-5 text-slate-300 animate-spin" strokeWidth={2} />
                  <span className="text-slate-300 text-sm font-medium">Ładowanie...</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-xl p-3 rounded-full border border-white/20 transition-all duration-300 active:scale-95"
          >
            <X className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>

          {/* Navigation buttons */}
          {selectedIndex > 0 && (
            <button
              onClick={() => navigatePhoto('prev')}
              className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-xl p-4 rounded-full border border-white/20 transition-all duration-300 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          )}

          {selectedIndex < photos.length - 1 && (
            <button
              onClick={() => navigatePhoto('next')}
              className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-xl p-4 rounded-full border border-white/20 transition-all duration-300 active:scale-95"
            >
              <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          )}

          {/* Image */}
          <img
            src={getPhotoUrl(photos[selectedIndex].storage_path)}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
            <span className="text-white text-sm font-medium">
              {selectedIndex + 1} / {photos.length}
            </span>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 20px); }
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
