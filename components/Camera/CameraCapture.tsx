'use client'

import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, Zap, ZapOff, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Photo {
  id: string
  dataUrl: string
  timestamp: Date
}

export default function CameraCapture({ eventId }: any) {
  const [count, setCount] = useState(0)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [flashEnabled, setFlashEnabled] = useState(true)
  const [photos, setPhotos] = useState<Photo[]>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (e) {
      console.error('Camera error:', e)
      alert('Brak dostępu do kamery')
    }
  }

  useEffect(() => {
    startCamera(facingMode)

    // Volume button handling
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'VolumeUp' || e.key === 'VolumeDown') {
        e.preventDefault()
        capturePhoto()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [facingMode, flashEnabled])

  const toggleCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user')
  }

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Flash dla tylnej kamery
      if (flashEnabled && facingMode === 'environment' && streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0]
        const capabilities = track.getCapabilities() as any

        if (capabilities.torch) {
          try {
            await track.applyConstraints({
              advanced: [{ torch: true }] as any
            })
            await new Promise(resolve => setTimeout(resolve, 200))
            await track.applyConstraints({
              advanced: [{ torch: false }] as any
            })
          } catch (e) {
            console.log('Torch not supported')
          }
        }
      }

      // Flash dla przedniej kamery
      if (flashEnabled && facingMode === 'user') {
        const flashDiv = document.getElementById('flash-effect')
        if (flashDiv) {
          flashDiv.classList.remove('hidden')
          setTimeout(() => flashDiv.classList.add('hidden'), 150)
        }
      }

      // Rysuj obraz
      if (facingMode === 'user') {
        ctx.scale(-1, 1)
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
      } else {
        ctx.drawImage(video, 0, 0)
      }

      // Konwertuj do Data URL i zapisz
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
      
      const newPhoto: Photo = {
        id: `photo_${Date.now()}`,
        dataUrl,
        timestamp: new Date()
      }

      // Zaktualizuj state
      const updated = [newPhoto, ...photos]
      setPhotos(updated)
      setCount(prev => prev + 1)

      // ZAPISZ DO sessionStorage
      sessionStorage.setItem(`photos_${eventId}`, JSON.stringify(updated))

    } catch (error) {
      console.error('Capture error:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
        }}
      />

      {/* Canvas - hidden */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Flash effect */}
      <div
        id="flash-effect"
        className="hidden absolute inset-0 bg-white pointer-events-none opacity-90"
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <div className="text-white font-semibold">📸 Aparat</div>
            <div className="text-white/70 text-sm">Zdjęć: {count}</div>
          </div>
          {/* Flash button */}
          <button
            onClick={toggleFlash}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition"
          >
            {flashEnabled ? (
              <Zap className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ) : (
              <ZapOff className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-8 pt-12">
        <div className="flex items-center justify-between px-6 mb-4">
          {/* Galeria button */}
          <button
            onClick={() => {
              sessionStorage.setItem(`photos_${eventId}`, JSON.stringify(photos))
              router.push(`/gallery?eventId=${eventId}`)
            }}
            className="w-14 h-14 rounded-lg overflow-hidden border-2 border-white/50 bg-gray-800 flex items-center justify-center hover:border-white transition relative"
          >
            {photos.length > 0 ? (
              <>
                <img src={photos[0].dataUrl} alt="Last" className="w-full h-full object-cover" />
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl font-bold">
                  {photos.length}
                </div>
              </>
            ) : (
              <ImageIcon className="w-6 h-6 text-white/50" />
            )}
          </button>

          {/* Capture Button */}
          <button
            onClick={capturePhoto}
            className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition"
          >
            <div className="w-16 h-16 rounded-full bg-white" />
          </button>

          {/* Rotate camera */}
          <button
            onClick={toggleCamera}
            className="w-14 h-14 flex items-center justify-center text-white bg-black/50 rounded-lg border border-white/30 hover:bg-black/70 transition"
          >
            <RotateCw className="w-6 h-6" />
          </button>
        </div>

        {/* Info */}
        <div className="text-center text-white/70 text-sm">
          💡 Naciśnij przycisk głośności lub kliknij koło
        </div>
      </div>
    </div>
  )
}
