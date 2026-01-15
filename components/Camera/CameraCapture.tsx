'use client'

import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, Zap, ZapOff, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Photo {
  id: string
  dataUrl: string
  timestamp: Date
}

const MAX_PHOTOS_PER_SESSION = 20

export default function CameraCapture() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [photoCount, setPhotoCount] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  // Załaduj zdjęcia
  useEffect(() => {
    const saved = sessionStorage.getItem('event_photos')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPhotos(parsed)
        setPhotoCount(parsed.length)
      } catch (e) {
        console.error('Error loading photos:', e)
      }
    }
  }, [])

  // Uruchom kamerę
  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [facingMode])

  // Przyciski głośności
  useEffect(() => {
    const handleVolumeButton = (e: KeyboardEvent) => {
      const volumeKeys = [
        'VolumeUp', 'VolumeDown', 
        'AudioVolumeUp', 'AudioVolumeDown',
        'MediaVolumeUp', 'MediaVolumeDown'
      ]

      if (volumeKeys.includes(e.key) || volumeKeys.includes(e.code)) {
        e.preventDefault()
        e.stopPropagation()
        
        if (photoCount >= MAX_PHOTOS_PER_SESSION) {
          toast.error(`Osiągnięto limit ${MAX_PHOTOS_PER_SESSION} zdjęć!`)
          return
        }
        
        capturePhoto()
      }
    }

    window.addEventListener('keydown', handleVolumeButton, { capture: true })
    window.addEventListener('keyup', handleVolumeButton, { capture: true })

    return () => {
      window.removeEventListener('keydown', handleVolumeButton, { capture: true })
      window.removeEventListener('keyup', handleVolumeButton, { capture: true })
    }
  }, [isCapturing, photoCount, photos])

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

  // Tap-to-Focus
  const handleScreenTap = async (e: React.TouchEvent<HTMLDivElement>) => {
    if (!videoRef.current || !stream) return

    const video = videoRef.current
    const rect = video.getBoundingClientRect()
    
    const x = (e.touches[0].clientX - rect.left) / rect.width
    const y = (e.touches[0].clientY - rect.top) / rect.height

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

    try {
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities() as any

      const constraints: any = { advanced: [] }

      if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
        constraints.advanced.push({ focusMode: 'continuous' })
      }

      if ('pointsOfInterest' in capabilities) {
        constraints.advanced.push({
          pointsOfInterest: [{ x, y }]
        })
      }

      if (capabilities.exposureMode && capabilities.exposureMode.includes('continuous')) {
        constraints.advanced.push({ exposureMode: 'continuous' })
      }

      if (constraints.advanced.length > 0) {
        await track.applyConstraints(constraints)
      }

      toast.success('Ostrość ustawiona', { duration: 1000 })
    } catch (err) {
      console.log('Focus/Exposure not fully supported:', err)
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return

    if (photoCount >= MAX_PHOTOS_PER_SESSION) {
      toast.error(`Osiągnięto limit ${MAX_PHOTOS_PER_SESSION} zdjęć na sesję!`, {
        duration: 3000,
        icon: '🚫'
      })
      return
    }

    setIsCapturing(true)

    try {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Cannot get canvas context')
      }

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

      const updated = [newPhoto, ...photos]
      setPhotos(updated)
      setPhotoCount(updated.length)

      sessionStorage.setItem('event_photos', JSON.stringify(updated))

      const remaining = MAX_PHOTOS_PER_SESSION - updated.length
      if (remaining <= 3 && remaining > 0) {
        toast.success(`✅ Zapisano! Pozostało ${remaining} zdjęć`)
      } else {
        toast.success('✅ Zdjęcie zapisane!')
      }

    } catch (error) {
      console.error('Capture error:', error)
      toast.error('Błąd podczas zapisywania zdjęcia')
    } finally {
      setIsCapturing(false)
    }
  }

  const goToGallery = () => {
    sessionStorage.setItem('event_photos', JSON.stringify(photos))
    router.push('/gallery')
  }

  const lastPhoto = photos.length > 0 ? photos[0] : null
  const remaining = MAX_PHOTOS_PER_SESSION - photoCount

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div 
        onTouchStart={handleScreenTap}
        className="absolute inset-0 touch-none"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div
        id="flash-effect"
        className="hidden absolute inset-0 bg-white pointer-events-none"
      />

      <div
        id="focus-ring"
        className="hidden absolute w-20 h-20 border-2 border-yellow-400 rounded-full pointer-events-none"
        style={{ transform: 'translate(-50%, -50%)' }}
      />

      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <div className="text-white font-semibold">📸 Event Photos</div>
            <div className="text-white/70 text-sm">
              {photoCount}/{MAX_PHOTOS_PER_SESSION} • Pozostało: {remaining}
            </div>
          </div>
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

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent pb-8 pt-6">
        <div className="flex items-center justify-center gap-8 px-6">
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

          <button
            onClick={capturePhoto}
            disabled={isCapturing || photoCount >= MAX_PHOTOS_PER_SESSION}
            className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50 disabled:border-red-500"
          >
            <div className="w-16 h-16 rounded-full bg-white" />
            {isCapturing && (
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping" />
            )}
            {photoCount >= MAX_PHOTOS_PER_SESSION && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/80 rounded-full">
                <span className="text-white text-xs font-bold">MAX</span>
              </div>
            )}
          </button>

          <button
            onClick={toggleCamera}
            className="w-14 h-14 flex items-center justify-center text-white bg-black/50 rounded-lg border border-white/30 hover:bg-black/70 transition"
          >
            <RotateCw className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center text-white/70 text-sm mt-4">
          Dotknij ekran aby ustawić ostrość • Użyj głośności do zdjęć
        </div>
      </div>
    </div>
  )
}
