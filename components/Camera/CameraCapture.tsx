'use client'

import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, Image as ImageIcon, Zap, ZapOff, AlertCircle, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const PHOTO_LIMIT = 20

const FILTERS = [
  { id: 'none', name: '✨ Brak', style: '' },
  { id: 'vintage', name: '📷 Vintage', style: 'sepia(0.5) contrast(1.2) brightness(1.1)' },
  { id: 'retro', name: '🌆 Retro', style: 'saturate(1.5) contrast(1.3) hue-rotate(-10deg)' },
  { id: 'cool', name: '❄️ Cool', style: 'saturate(0.8) brightness(1.1) hue-rotate(180deg)' },
  { id: 'warm', name: '🔥 Warm', style: 'saturate(1.3) brightness(1.1) hue-rotate(-20deg)' },
  { id: 'noir', name: '🎬 Noir', style: 'grayscale(1) contrast(1.5)' },
  { id: 'sunset', name: '🌅 Sunset', style: 'saturate(1.4) hue-rotate(-30deg) brightness(1.2)' },
  { id: 'rio', name: '🇧🇷 Rio', style: 'saturate(1.6) contrast(1.2) brightness(1.15) hue-rotate(10deg)' },
]

const OVERLAYS = [
  { id: 'none', name: 'Brak', emoji: '❌' },
  { id: 'dog', name: 'Pies 🐶', emoji: '🐶' },
  { id: 'crown', name: 'Korona 👑', emoji: '👑' },
  { id: 'fire', name: 'Ogień 🔥', emoji: '🔥' },
  { id: 'heart', name: 'Serca 💕', emoji: '💕' },
  { id: 'star', name: 'Gwiazdy ⭐', emoji: '⭐' },
  { id: 'sunglasses', name: 'Okulary 😎', emoji: '😎' },
  { id: 'rainbow', name: 'Tęcza 🌈', emoji: '🌈' },
]

export default function CameraCapture() {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [photoCount, setPhotoCount] = useState(0)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [lastPhotoUrl, setLastPhotoUrl] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [eventId, setEventId] = useState('')
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('none')
  const [selectedOverlay, setSelectedOverlay] = useState('none')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isCapturingRef = useRef(false)
  const lastCaptureTime = useRef(0)
  const captureCounter = useRef(0)
  const router = useRouter()

  useEffect(() => {
    let myDeviceId = localStorage.getItem('device_id')
    if (!myDeviceId) {
      myDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('device_id', myDeviceId)
    }
    setDeviceId(myDeviceId)
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

    const pendingPhotos = JSON.parse(localStorage.getItem('pending_photos') || '[]')
    setPhotoCount(pendingPhotos.length)

    const myDeviceId = localStorage.getItem('device_id')
    if (myDeviceId) {
      const { count } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', data.id)
        .eq('device_id', myDeviceId)

      setUploadedCount(count || 0)
    }
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

      if (flashEnabled && facingMode === 'environment') {
        applyFlash(true)
      }
    } catch (e) {
      console.error('Camera error:', e)
      alert('Nie można uruchomić kamery. Sprawdź uprawnienia.')
    }
  }

  const applyFlash = async (enabled: boolean) => {
    if (!streamRef.current) return
    
    const track = streamRef.current.getVideoTracks()[0]
    const capabilities = track.getCapabilities() as any

    if (!capabilities.torch) return

    try {
      await track.applyConstraints({
        // @ts-ignore
        advanced: [{ torch: enabled }]
      })
    } catch (error) {
      console.error('Flash error:', error)
    }
  }

  const toggleFlash = async () => {
    if (facingMode === 'user') return
    const newFlashState = !flashEnabled
    setFlashEnabled(newFlashState)
    await applyFlash(newFlashState)
  }

  const capturePhoto = async () => {
    const totalPhotos = photoCount + uploadedCount

    if (totalPhotos >= PHOTO_LIMIT) {
      setShowLimitWarning(true)
      setTimeout(() => setShowLimitWarning(false), 3000)
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])
      return
    }

    const now = Date.now()
    
    if (now - lastCaptureTime.current < 300) {
      console.warn('⚠️ Za szybko!')
      return
    }

    if (isCapturingRef.current || !videoRef.current || !canvasRef.current || !eventId) return
    
    isCapturingRef.current = true
    lastCaptureTime.current = now
    captureCounter.current += 1
    
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      isCapturingRef.current = false
      return
    }

    // Narysuj video
    ctx.drawImage(video, 0, 0)
    
    // Zastosuj filtr
    const filter = FILTERS.find(f => f.id === selectedFilter)
    if (filter && filter.style) {
      ctx.filter = filter.style
      ctx.drawImage(canvas, 0, 0)
      ctx.filter = 'none'
    }

    // Dodaj overlay
    if (selectedOverlay !== 'none') {
      const overlay = OVERLAYS.find(o => o.id === selectedOverlay)
      if (overlay) {
        ctx.font = `${canvas.height / 4}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Różne pozycje dla różnych overlays
        if (selectedOverlay === 'dog' || selectedOverlay === 'crown' || selectedOverlay === 'sunglasses') {
          // Nad głową (góra obrazu)
          ctx.fillText(overlay.emoji, canvas.width / 2, canvas.height / 5)
        } else if (selectedOverlay === 'fire' || selectedOverlay === 'heart') {
          // Wokół (4 rogi)
          ctx.fillText(overlay.emoji, canvas.width * 0.2, canvas.height * 0.2)
          ctx.fillText(overlay.emoji, canvas.width * 0.8, canvas.height * 0.2)
          ctx.fillText(overlay.emoji, canvas.width * 0.2, canvas.height * 0.8)
          ctx.fillText(overlay.emoji, canvas.width * 0.8, canvas.height * 0.8)
        } else {
          // Centrum
          ctx.fillText(overlay.emoji, canvas.width / 2, canvas.height / 2)
        }
      }
    }
    
    const photoData = canvas.toDataURL('image/jpeg', 0.9)
    const uniqueId = `${now}_${captureCounter.current}_${Math.random().toString(36).substr(2, 9)}`
    
    const pendingPhotos = JSON.parse(localStorage.getItem('pending_photos') || '[]')
    
    const newPhoto = {
      id: uniqueId,
      data: photoData,
      event_id: eventId,
      device_id: deviceId,
      timestamp: now
    }
    
    pendingPhotos.push(newPhoto)
    localStorage.setItem('pending_photos', JSON.stringify(pendingPhotos))
    
    setLastPhotoUrl(photoData)
    setPhotoCount(pendingPhotos.length)
    
    if (navigator.vibrate) navigator.vibrate(50)
    
    setTimeout(() => {
      isCapturingRef.current = false
    }, 300)
  }

  const totalPhotos = photoCount + uploadedCount
  const photosLeft = PHOTO_LIMIT - totalPhotos
  const currentFilter = FILTERS.find(f => f.id === selectedFilter)

  return (
    <div className="fixed inset-0 bg-black z-50">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="absolute inset-0 w-full h-full object-cover" 
        style={{ filter: currentFilter?.style }}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* OVERLAY PREVIEW */}
      {selectedOverlay !== 'none' && (
        <div className="absolute inset-0 pointer-events-none">
          {(() => {
            const overlay = OVERLAYS.find(o => o.id === selectedOverlay)
            if (!overlay) return null
            
            if (selectedOverlay === 'dog' || selectedOverlay === 'crown' || selectedOverlay === 'sunglasses') {
              return <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-9xl">{overlay.emoji}</div>
            } else if (selectedOverlay === 'fire' || selectedOverlay === 'heart') {
              return (
                <>
                  <div className="absolute top-[15%] left-[15%] text-6xl">{overlay.emoji}</div>
                  <div className="absolute top-[15%] right-[15%] text-6xl">{overlay.emoji}</div>
                  <div className="absolute bottom-[25%] left-[15%] text-6xl">{overlay.emoji}</div>
                  <div className="absolute bottom-[25%] right-[15%] text-6xl">{overlay.emoji}</div>
                </>
              )
            } else {
              return <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl">{overlay.emoji}</div>
            }
          })()}
        </div>
      )}

      {/* OSTRZEŻENIE O LIMICIE */}
      {showLimitWarning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-red-600 text-white px-8 py-6 rounded-2xl shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8" />
            <div>
              <p className="text-xl font-bold">⛔ Osiągnięto limit!</p>
              <p className="text-sm">Możesz zrobić max {PHOTO_LIMIT} zdjęć</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-white w-10 h-10 flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
          <div className="text-white text-center">
            <div className="font-semibold">📸 Aparat</div>
            <div className={`text-sm ${photosLeft <= 5 ? 'text-red-400 font-bold' : 'text-white/70'}`}>
              Pozostało: {photosLeft}/{PHOTO_LIMIT}
            </div>
          </div>
          <button 
            onClick={toggleFlash} 
            className="text-white w-10 h-10 flex items-center justify-center"
            disabled={facingMode === 'user'}
          >
            {flashEnabled ? (
              <Zap className="w-6 h-6 text-yellow-400" fill="currentColor" />
            ) : (
              <ZapOff className="w-6 h-6 opacity-70" />
            )}
          </button>
        </div>
      </div>

      {/* FILTRY PANEL */}
      {showFilters && (
        <div className="absolute left-0 right-0 bottom-32 z-20 bg-black/80 backdrop-blur-sm p-4">
          <h3 className="text-white text-sm font-bold mb-3">🎨 Filtry:</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-semibold transition ${
                  selectedFilter === filter.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/20 text-white'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>

          <h3 className="text-white text-sm font-bold mb-3 mt-4">✨ Nakładki:</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {OVERLAYS.map(overlay => (
              <button
                key={overlay.id}
                onClick={() => setSelectedOverlay(overlay.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-semibold transition ${
                  selectedOverlay === overlay.id
                    ? 'bg-pink-600 text-white'
                    : 'bg-white/20 text-white'
                }`}
              >
                {overlay.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS */}
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
            disabled={!eventId || totalPhotos >= PHOTO_LIMIT}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50 disabled:border-red-500"
          >
            <div className={`w-16 h-16 rounded-full ${totalPhotos >= PHOTO_LIMIT ? 'bg-red-500' : 'bg-white'}`} />
          </button>

          <button onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} className="w-14 h-14 flex items-center justify-center text-white bg-black/50 rounded-lg">
            <RotateCw className="w-6 h-6" />
          </button>
        </div>

        {/* PRZYCISK FILTRÓW */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 backdrop-blur-sm transition"
          >
            <Sparkles className="w-5 h-5" />
            {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
          </button>
        </div>

        {/* OSTRZEŻENIE */}
        {photosLeft <= 5 && photosLeft > 0 && (
          <div className="text-center mt-4">
            <p className="text-yellow-400 text-sm font-bold">
              ⚠️ Zostało tylko {photosLeft} {photosLeft === 1 ? 'zdjęcie' : 'zdjęcia'}!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
