'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, CheckSquare, Square, Loader2 } from 'lucide-react'
import { supabase, Photo } from '@/lib/supabase'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export default function DownloadPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadPhotos()
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
      alert('Zaznacz zdjęcia do pobrania!')
      return
    }

    setDownloading(true)
    const zip = new JSZip()
    const selectedPhotos = photos.filter(p => selected.has(p.id))

    try {
      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i]
        const url = getPhotoUrl(photo.storage_path)
        
        // Pobierz zdjęcie
        const response = await fetch(url)
        const blob = await response.blob()
        
        // Dodaj do ZIP
        const fileName = `zdjecie_${i + 1}_${photo.id}.jpg`
        zip.file(fileName, blob)
      }

      // Generuj i pobierz ZIP
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `zdjecia_${Date.now()}.zip`)
      
      alert(`✅ Pobrano ${selected.size} zdjęć!`)
    } catch (error) {
      console.error('Download error:', error)
      alert('❌ Błąd podczas pobierania')
    }

    setDownloading(false)
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* HEADER */}
      <div className="bg-green-600 p-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/')} className="text-white">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">📥 Pobierz zdjęcia</h1>
                <p className="text-green-100 text-sm">
                  Zaznaczono: {selected.size} / {photos.length}
                </p>
              </div>
            </div>

            <button
              onClick={selectAll}
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
            >
              {selected.size === photos.length ? '❌ Odznacz' : '✅ Zaznacz wszystko'}
            </button>
          </div>
        </div>
      </div>

      {/* PRZYCISK POBIERANIA - STICKY */}
      {selected.size > 0 && (
        <div className="sticky top-20 z-10 bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={downloadSelected}
              disabled={downloading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Pobieranie {selected.size} zdjęć...
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  Pobierz {selected.size} {selected.size === 1 ? 'zdjęcie' : 'zdjęć'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* GALERIA */}
      <div className="max-w-6xl mx-auto p-4">
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <Download className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Brak zdjęć do pobrania</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => {
              const isSelected = selected.has(photo.id)
              return (
                <div
                  key={photo.id}
                  onClick={() => toggleSelect(photo.id)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden transition transform hover:scale-105 ${
                    isSelected ? 'ring-4 ring-green-500' : 'ring-2 ring-gray-700'
                  }`}
                >
                  <div className="aspect-square">
                    <img
                      src={getPhotoUrl(photo.storage_path)}
                      className="w-full h-full object-cover"
                      alt="Photo"
                      loading="lazy"
                    />
                  </div>

                  {/* CHECKBOX OVERLAY */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                      isSelected ? 'bg-green-500' : 'bg-white/20 backdrop-blur-sm'
                    }`}>
                      {isSelected ? (
                        <CheckSquare className="w-8 h-8 text-white" />
                      ) : (
                        <Square className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
