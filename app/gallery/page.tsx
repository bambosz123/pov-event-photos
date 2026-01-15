'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Image as ImageIcon, Lock, Loader2 } from 'lucide-react'
import { supabase, Photo } from '@/lib/supabase'
import PendingUploader from '@/components/PendingUploader'

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [deviceId, setDeviceId] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const myDeviceId = localStorage.getItem('device_id') || ''
    setDeviceId(myDeviceId)
    loadPhotos()

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
      alert('❌ Możesz usuwać tylko swoje zdjęcia!')
      return
    }

    setDeletingId(photo.id)

    // Usuń z bazy
    await supabase
      .from('photos')
      .delete()
      .eq('id', photo.id)

    setDeletingId(null)
    loadPhotos()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <PendingUploader />
      
      <div className="bg-purple-600 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">🖼️ Galeria</h1>
            <p className="text-purple-100 text-sm">Zdjęć: {photos.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Brak zdjęć</p>
            <p className="text-gray-500">Wróć do aparatu i zrób zdjęcie</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group bg-gray-800 rounded-lg overflow-hidden">
                <div className="aspect-square">
                  <img 
                    src={getPhotoUrl(photo.storage_path)} 
                    className="w-full h-full object-cover" 
                    alt="Photo"
                    loading="lazy"
                  />
                </div>
                
                {/* KOSZ W ROGU - ZAWSZE WIDOCZNY DLA SWOICH ZDJĘĆ */}
                {canDelete(photo) && (
                  <button
                    onClick={() => deletePhoto(photo)}
                    disabled={deletingId === photo.id}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition disabled:opacity-50 z-10"
                  >
                    {deletingId === photo.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}

                {/* BADGE "TWOJE" */}
                {canDelete(photo) && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    📱 Twoje
                  </div>
                )}

                {/* IKONA ZAMKA DLA CUDZYCH */}
                {!canDelete(photo) && (
                  <div className="absolute top-2 right-2 bg-gray-700 text-white p-2 rounded-full">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
