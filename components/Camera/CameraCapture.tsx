'use client'

import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, Zap, ZapOff, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface CameraCaptureProps {
  eventId: string
  tableId: string
  tableName: string
}

interface Photo {
  id: string
  dataUrl: string
  timestamp: Date
}

export default function CameraCapture({ eventId, tableId, tableName }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [photoCount, setPhotoCount] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  // Załaduj zdjęcia z sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(`photos_${eventId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPhotos(parsed)
        setPhotoCount(parsed.length)
      } catch (e) {
        console.error('Error loading photos:', e)
      }
    }
  }, [eventId])

  // Uruchom kamerę
  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [facingMode])

  // ✅ OBSŁUGA PRZYCISKU GŁOŚNOŚCI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Przyciski głośności mają kody: VolumeUp, VolumeDown, AudioVolumeUp, AudioVolumeDown
      if (e.key === 'VolumeUp' || e.key === 'VolumeDown' || 
          e.key === 'AudioVolumeUp' || e.key === 'AudioVolumeDown' ||
          e.code === 'VolumeUp' || e.code === 'VolumeDown') {
        e.preventDefault()
        capturePhoto()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCapturing, videoRef, canvasRef, photos])

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })

      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Camera error:', error)
      toast.error('Nie można uruchomić kamery')
    }
  }

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const toggleFlash = () => {
    setFlashEnabled(prev => !prev)
  }

  // ✅ FOCUS NA DOTYK EKRANU
  const handleScreenTap = async (e: React.TouchEvent<HTMLDivElement>) => {
    if (!videoRef.current || !stream) return

    const video = videoRef.current
    const rect = video.getBoundingClientRect()
    const x = (e.touches[0].clientX - rect.left) / rect.width
    const y = (e.touches[0].clientY - rect.top) / rect.height

    // Pokaż animację focus
    const focusRing = document.getElementById('focus-ring')
    if (focusRing) {
      focusRing.style.left = `${e.touches[0].clientX}px`
      focusRing.style.top = `${e.touches[0].clientY}px`
      focusRing.classList.remove('hidden')
      focusRing.classList.add('animate-focus')
      
      setTimeout(() => {
        focusRing.classList.add('hidden')
        focusRing.classList.remove('animate-focus')
      }, 1000)
    }

    // Ustaw focus na urządzeniu (jeśli obsługiwane)
    try {
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      
      if ('focusMode' in capabilities) {
        await track.applyConstraints({
          advanced: [{ focusMode: 'single-shot' } as any]
        })
      }
    } catch (err) {
      console.log('Focus not supported:', err)
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return

    setIsCapturing(true)

    try {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Flash effect
      if (flashEnabled) {
        const flashDiv = document.getElementById('flash-effect')
        if (flashDiv) {
          flashDiv.classList.remove('hidden')
          setTimeout(() => flashDiv.classList.add('hidden'), 200)
        }
      }

      ctx.drawImage(video, 0, 0)

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
      
      const newPhoto: Photo = {
        id: `photo_${Date.now()}`,
        dataUrl,
        timestamp: new Date()
      }

      // Dodaj do listy
      const updated = [newPhoto, ...photos]
      setPhotos(updated)
      setPhotoCount(updated.length)

      // Zapisz do sessionStorage
      sessionStorage.setItem(`photos_${eventId}`, JSON.stringify(updated))

      toast.success('✅ Zdjęcie zapisane!')

    } catch (error) {
      console.error('Capture error:', error)
      toast.error('Błąd podczas zapisywania')
    } finally {
      setIsCapturing(false)
    }
  }

  const goToGallery = () => {
    sessionStorage.setItem(`photos_${eventId}`, JSON.stringify(photos))
    router.push(`/gallery?eventId=${eventId}`)
  }

  const lastPhoto = photos.length > 0 ? photos[0] : null

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video stream - DOTYK = FOCUS */}
      <div 
        onTouchStart={handleScreenTap}
        className="absolute inset-0"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Canvas - hidden */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Flash effect */}
      <div
        id="flash-effect"
        className="hidden absolute inset-0 bg-white pointer-events-none"
      />

      {/* Focus ring */}
      <div
        id="focus-ring"
        className="hidden absolute w-20 h-20 border-2 border-yellow-400 rounded-full pointer-events-none"
        style={{ transform: 'translate(-50%, -50%)' }}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 flex items-center justify-center text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <div className="text-white font-semibold">{tableName}</div>
            <div className="text-white/70 text-sm">{photoCount} zdjęć</div>
          </div>
          <button
            onClick={toggleFlash}
            className="w-10 h-10 flex items-center justify-center text-white"
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
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent pb-8 pt-6">
        <div className="flex items-center justify-center gap-8 px-6">
          {/* Gallery preview - KLIKALNE */}
          <button 
            onClick={goToGallery}
            className="w-14 h-14 rounded-lg overflow-hidden border-2 border-white/50 bg-gray-800 flex items-center justify-center hover:border-white transition relative"
          >
            {lastPhoto ? (
              <>
                <img src={lastPhoto.dataUrl} alt="Last" className="w-full h-full object-cover" />
                {photoCount > 1 && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                    {photoCount}
                  </div>
                )}
              </>
            ) : (
              <ImageIcon className="w-6 h-6 text-white/50" />
            )}
          </button>

          {/* Capture Button */}
          <button
            onClick={capturePhoto}
            disabled={isCapturing}
            className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-full bg-white" />
            {isCapturing && (
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping" />
            )}
          </button>

          {/* Rotate camera */}
          <button
            onClick={toggleCamera}
            className="w-14 h-14 flex items-center justify-center text-white bg-black/50 rounded-lg border border-white/30 hover:bg-black/70 transition"
          >
            <RotateCw className="w-6 h-6" />
          </button>
        </div>
        
        {/* Hint */}
        <div className="text-center text-white/70 text-sm mt-4">
          Naciśnij głośność lub dotknij ekranu
        </div>
      </div>
    </div>
  )
}

