'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function PendingUploader() {
  const [pendingCount, setPendingCount] = useState(0)
  const [currentUpload, setCurrentUpload] = useState(0)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    uploadNext()
    const interval = setInterval(uploadNext, 2000) // Co 2s sprawdź
    return () => clearInterval(interval)
  }, [])

  const uploadNext = async () => {
    if (isProcessingRef.current) {
      console.log('⏸️ Już uploading')
      return
    }

    const pending = JSON.parse(localStorage.getItem('pending_photos') || '[]')
    setPendingCount(pending.length)

    if (pending.length === 0) {
      setCurrentUpload(0)
      return
    }

    isProcessingRef.current = true

    // ← WEŹ PIERWSZE ZDJĘCIE
    const photo = pending[0]
    setCurrentUpload(1)

    try {
      console.log('📤 Uploading photo:', photo.id)

      // Konwertuj base64 → blob
      const res = await fetch(photo.data)
      const blob = await res.blob()

      // Upload do Cloudinary
      const formData = new FormData()
      formData.append('file', blob, `${photo.device_id}_${photo.timestamp}.jpg`)

      const uploadRes = await fetch('/api/upload-cloudinary', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error('Cloudinary upload failed')
      }

      const { url } = await uploadRes.json()
      console.log('✅ Cloudinary OK:', url)

      // Zapisz w bazie
      const { error } = await supabase.from('photos').insert({
        event_id: photo.event_id,
        storage_path: url,
        device_id: photo.device_id
      })

      if (error) {
        console.error('❌ DB error:', error)
        
        // Jeśli duplikat - usuń z pending
        if (error.code === '23505') {
          console.log('🚫 Duplikat - usuwam')
          removeFromPending(photo.id)
        }
      } else {
        console.log('✅ Zapisano w bazie')
        removeFromPending(photo.id)
      }

    } catch (err) {
      console.error('❌ Upload error:', err)
      // Usuń problematyczne zdjęcie po 3 próbach
      const failCount = (photo.failCount || 0) + 1
      if (failCount >= 3) {
        console.log('🗑️ 3 błędy - usuwam zdjęcie')
        removeFromPending(photo.id)
      } else {
        // Zaznacz próbę
        pending[0].failCount = failCount
        localStorage.setItem('pending_photos', JSON.stringify(pending))
      }
    }

    isProcessingRef.current = false
  }

  const removeFromPending = (photoId: string) => {
    const pending = JSON.parse(localStorage.getItem('pending_photos') || '[]')
    const filtered = pending.filter((p: any) => p.id !== photoId)
    localStorage.setItem('pending_photos', JSON.stringify(filtered))
    setPendingCount(filtered.length)
    console.log('🗑️ Usunięto z pending, zostało:', filtered.length)
  }

  if (pendingCount === 0) return null

  return (
    <div className="fixed top-20 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-xl z-50">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <div>
          <p className="text-sm font-bold">📤 Wysyłanie {pendingCount}</p>
          <p className="text-xs opacity-90">Nie zamykaj strony</p>
        </div>
      </div>
    </div>
  )
}

