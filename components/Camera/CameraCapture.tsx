'use client'

import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CameraCapture() {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [photoCount, setPhotoCount] = useState(0)
  const [lastPhotoUrl, setLastPhotoUrl] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [eventId, setEventId] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Pobierz lub stwórz ID urządzenia
    let myDeviceId = localStorage.getItem('device_id')
    if (!myDeviceId) {
      myDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('device_id', myDeviceId)
    }
    setDeviceId(myDeviceId)

    // Pobierz aktywny event
    loadActiveEvent()
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [facingMode])

  const loadActiveEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error || !data) {
      console.error('No active event found')
      return
    }

    setEventId(data.id)

    // Policz zdjęcia dla tego eventu
    const { count } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', data.id)
    
    setPhotoCount(count || 0)
  }

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } }
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (e) {
      console.error('Camera error:', e)
      alert('Nie można uruchomić kamery. Sprawdź uprawnienia.')
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isUploading || !eventId) return
    
    setIsUploading(true)
    
    try {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(video, 0, 0)
      
      // Konwertuj do blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9)
      })

      // Upload do Supabase Storage (bucket "photos")
      const fileName = `${eventId}/${deviceId}_${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      // Zapisz metadata do bazy
      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          event_id: eventId,
          storage_path: fileName,
          device_id: deviceId
        })

      if (dbError) throw dbError

      // Pobierz URL zdjęcia
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

      setLastPhotoUrl(data.publicUrl)
      setPhotoCount(prev => prev + 1)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Błąd podczas zapisywania zdjęcia')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-white w-10 h-10 flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
          <div className="text-white text-center">
            <div className="font-semibold">📸 Aparat</div>
            <div className="text-sm text-white/70">Zdjęć: {photoCount}</div>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent pb-8 pt-6">
        <div className="flex items-center justify-center gap-8 px-6">
          <button onClick={() => router.push('/gallery')} className="w-14 h-14 rounded-lg border-2 border-white/50 bg-gray-800 flex items-center justify-center">
            {lastPhotoUrl ? (
              <img src={lastPhotoUrl} className="w-full h-full object-cover rounded-lg" alt="Last" />
            ) : (
              <ImageIcon className="w-6 h-6 text-white/50" />
            )}
          </button>

          <button 
            onClick={capturePhoto} 
            disabled={isUploading || !eventId}
            
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white" />
            )}
          </button>

          <button onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} className="w-14 h-14 flex items-center justify-center text-white bg-black/50 rounded-lg">
            <RotateCw className="w-6 h-6" />
          </button>
        </div>
        
        {isUploading && (
          <div className="text-center mt-4 text-white text-sm">
            Zapisywanie zdjęcia...
          </div>
        )}
      </div>
    </div>
  )
}
