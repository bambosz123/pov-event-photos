'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, CheckSquare, Square, Loader2, Package, Sparkles } from 'lucide-react'
import { supabase, Photo } from '@/lib/supabase'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export default function DownloadPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadPhotos()
    setTimeout(() => setMounted(true), 100)
  }, [])

  const loadPhotos = async () => {
    setLoading(true)
    const { data: eventData } = await supabase
      .from('events')
      .select('id, name')
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
    if (selected.size === photos.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(photos.map(p => p.id)))
    }
  }

  const downloadSelected = async () => {
    if (selected.size === 0) {
      alert('Select photos to download')
      return
    }

    setDownloading(true)
    setProgress(0)
    const zip = new JSZip()
    const selectedPhotos = photos.filter(p => selected.has(p.id))

    for (let i = 0; i < selectedPhotos.length; i++) {
      const photo = selectedPhotos[i]
      try {
        const url = getPhotoUrl(photo.storage_path)
        const response = await fetch(url)
        const blob = await response.blob()
        zip.file(`photo_${i + 1}.jpg`, blob)
        setProgress(Math.round(((i + 1) / selectedPhotos.length) * 100))
      } catch (error) {
        console.error('Download error:', error)
      }
    }

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `POV_Photos_${Date.now()}.zip`)
    setDownloading(false)
    setProgress(0)
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden pb-32">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] right-[20%] w-[500px] h-[500px] bg-gradient-to-br from-slate-400/6 to-transparent rounded-full blur-[100px] animate-float"></div>
        <div className="absolute bottom-[25%] left-[15%] w-[600px] h-[600px] bg-gradient-to-br from-blue-400/5 to-transparent rounded-full blur-[120px] animate-float-delayed"></div>
      </div>

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(203,213,225,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(203,213,225,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Header - Sticky */}
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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white tracking-wide truncate">Pobierz</h1>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                  <Sparkles className="w-3 h-3 text-slate-400" />
                  <p className="text-slate-400 text-xs sm:text-sm tracking-wide">
                    {selected.size} of {photos.length} zaznaczonych
                  </p>
                </div>
              </div>
            </div>
            
            {photos.length > 0 && (
              <button
                onClick={selectAll}
                className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 hover:from-slate-700/90 hover:to-slate-800/90 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium border border-slate-600/50 transition-all duration-300 active:scale-95 text-xs sm:text-sm whitespace-nowrap"
              >
                {selected.size === photos.length ? 'Deselect' : 'Select All'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Zawartość */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        {photos.length === 0 ? (
          <div className={`text-center py-16 sm:py-24 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="inline-block bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 backdrop-blur-2xl p-10 sm:p-16 rounded-[32px] border border-slate-600/50 mb-6 sm:mb-8 shadow-[0_16px_64px_rgba(15,23,42,0.6)]">
              <Package className="w-20 h-20 sm:w-24 sm:h-24 text-slate-600 mx-auto" strokeWidth={1.3} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2 sm:mb-3">Żadnych zdjęć do pobrania</h2>
            <p className="text-slate-400 text-base sm:text-lg">Zdobądź najpierw jakieś ciekawe wspomnienia</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {photos.map((photo, index) => {
              const isSelected = selected.has(photo.id)
              return (
                <div
                  key={photo.id}
                  onClick={() => toggleSelect(photo.id)}
                  className={`group relative cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 active:scale-95 ${
                    isSelected 
                      ? 'ring-[3px] sm:ring-4 ring-slate-400 ring-offset-2 sm:ring-offset-4 ring-offset-[#0f172a] scale-95' 
                      : 'hover:scale-105'
                  } ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                  style={{ transitionDelay: `${Math.min(index * 30, 600)}ms` }}
                >
                  <div className="aspect-square relative bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 backdrop-blur-xl border border-slate-600/40">
                    <img 
                      src={getPhotoUrl(photo.storage_path)} 
                      className="w-full h-full object-cover" 
                      alt="Photo"
                      loading="lazy"
                    />
                    
                    {/* Overlay - zawsze widoczny na mobile gdy zaznaczony */}
                    <div className={`absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
                      isSelected ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
                    }`}>
                      <div className={`rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSelected 
                          ? 'w-14 h-14 sm:w-16 sm:h-16 bg-slate-400 scale-100 shadow-[0_0_40px_rgba(148,163,184,0.6)]' 
                          : 'w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md scale-90 border-2 border-white/30'
                      }`}>
                        {isSelected ? (
                          <CheckSquare className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                        ) : (
                          <Square className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sticky download button - mobile optimized */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
          <div className="max-w-md mx-auto">
            <button
              onClick={downloadSelected}
              disabled={downloading}
              className="group relative w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 sm:gap-4 shadow-[0_12px_48px_rgba(100,116,139,0.5)] hover:shadow-[0_16px_64px_rgba(148,163,184,0.7)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 active:scale-95 border border-slate-500/40 disabled:active:scale-100 min-h-[56px] sm:min-h-[64px]"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" strokeWidth={2.5} />
                  <div className="flex flex-col items-start">
                    <span>Downloading...</span>
                    <span className="text-xs sm:text-sm font-normal text-slate-300">{progress}%</span>
                  </div>
                </>
              ) : (
                <>
                  <Download className="w-6 h-6 group-hover:animate-bounce" strokeWidth={2.5} />
                  <span>
                    Download {selected.size} {selected.size === 1 ? 'Photo' : 'Photos'}
                  </span>
                </>
              )}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
