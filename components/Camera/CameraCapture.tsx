'use client'

import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Photo {
  id: string
  dataUrl: string
}

export default function CameraCapture() {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [photos, setPhotos] = useState<Photo[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  useEffect(() => {
    const saved = sessionStorage.getItem('event_photos')
    if (saved) {
      try {
        setPhotos(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [facingMode])

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

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    const newPhoto = { id: `photo_${Date.now()}`, dataUrl }
    const updated = [newPhoto, ...photos]
    setPhotos(updated)
    sessionStorage.setItem('event_photos', JSON.stringify(updated))
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
            <div className="text-sm text-white/70">Zdjęć: {photos.length}</div>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent pb-8 pt-6">
        <div className="flex items-center justify-center gap-8 px-6">
          <button onClick={() => router.push('/gallery')} className="w-14 h-14 rounded-lg border-2 border-white/50 bg-gray-800 flex items-center justify-center">
            {photos[0] ? (
              <img src={photos[0].dataUrl} className="w-full h-full object-cover rounded-lg" alt="Last" />
            ) : (
              <ImageIcon className="w-6 h-6 text-white/50" />
            )}
          </button>

          <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white" />
          </button>

          <button onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} className="w-14 h-14 flex items-center justify-center text-white bg-black/50 rounded-lg">
            <RotateCw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
