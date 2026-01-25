'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Camera, 
  RotateCcw, 
  Zap, 
  ZapOff,
  Grid3x3,
  Loader2,
  Check,
  X,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export default function CameraPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [flash, setFlash] = useState(false)
  const [grid, setGrid] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null)
  
  // ZOOM STATE
  const [zoom, setZoom] = useState(1)
  const [minZoom, setMinZoom] = useState(1)
  const [maxZoom, setMaxZoom] = useState(3)
  const [hasNativeZoom, setHasNativeZoom] = useState(false)
  const [showZoomSlider, setShowZoomSlider] = useState(false)
  
  // Pinch-to-zoom state
  const [initialDistance, setInitialDistance] = useState(0)
  const [initialZoom, setInitialZoom] = useState(1)

  useEffect(() => {
    setMounted(true)
    initCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode])

  useEffect(() => {
    applyFlashlight()
  }, [flash])

  const initCamera = async () => {
    try {
      setError(null)
      stopCamera()

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setIsCameraReady(true)
        }
      }

      // SPRAWDŹ WSPARCIE ZOOM
      const videoTrack = stream.getVideoTracks()[0]
      const capabilities = videoTrack.getCapabilities?.() as any
      
      if (capabilities?.zoom) {
        setHasNativeZoom(true)
        setMinZoom(capabilities.zoom.min || 1)
        setMaxZoom(capabilities.zoom.max || 3)
        setZoom(capabilities.zoom.min || 1)
      } else {
        // Digital zoom - defaults
        setHasNativeZoom(false)
        setMinZoom(1)
        setMaxZoom(3)
        setZoom(1)
      }

    } catch (err) {
      console.error('Camera error:', err)
      setError('Dostęp do kamery odrzucony. Proszę zezwól na dostęp do kamery.')
      setIsCameraReady(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }
    setIsCameraReady(false)
  }

  const applyFlashlight = async () => {
    if (!streamRef.current) return

    const videoTrack = streamRef.current.getVideoTracks()[0]
    const capabilities = videoTrack.getCapabilities() as any

    if (capabilities.torch) {
      try {
        await videoTrack.applyConstraints({
          advanced: [{ torch: flash } as any]
        })
      } catch (err) {
        console.log('Torch not supported on this device')
      }
    }
  }

  // ZOOM - natywny (Android) lub digital (iOS)
  const applyZoom = async (newZoom: number) => {
    const clampedZoom = Math.min(maxZoom, Math.max(minZoom, newZoom))
    setZoom(clampedZoom)
    
    if (hasNativeZoom && streamRef.current) {
      // Android - natywny zoom API
      const videoTrack = streamRef.current.getVideoTracks()[0]
      try {
        await videoTrack.applyConstraints({
          advanced: [{ zoom: clampedZoom } as any]
        })
      } catch (err) {
        console.log('Zoom constraint failed, using digital zoom')
      }
    }
    // iOS - digital zoom przez CSS (automatycznie w render)
  }

  // Pinch-to-zoom gestures
const getDistance = (touches: React.TouchList) => {    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const distance = getDistance(e.touches)
      setInitialDistance(distance)
      setInitialZoom(zoom)
    } else if (e.touches.length === 1) {
      // Single touch - focus
      handleFocus(e)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && initialDistance > 0) {
      e.preventDefault()
      
      const currentDistance = getDistance(e.touches)
      const scale = currentDistance / initialDistance
      const newZoom = initialZoom * scale
      
      applyZoom(newZoom)
      setShowZoomSlider(true)
    }
  }

  const handleTouchEnd = () => {
    setInitialDistance(0)
    if (showZoomSlider) {
      setTimeout(() => setShowZoomSlider(false), 2000)
    }
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    setZoom(1) // Reset zoom przy przełączeniu kamery
  }

  const handleFocus = async (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!streamRef.current || !videoRef.current) return

    const rect = videoRef.current.getBoundingClientRect()
    
    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100

    setFocusPoint({ x: clientX - rect.left, y: clientY - rect.top })
    setTimeout(() => setFocusPoint(null), 1000)

    const videoTrack = streamRef.current.getVideoTracks()[0]
    const capabilities = videoTrack.getCapabilities() as any

    if (capabilities.focusMode && capabilities.focusMode.includes('single-shot')) {
      try {
        await videoTrack.applyConstraints({
          advanced: [{
            focusMode: 'single-shot',
            pointsOfInterest: [{ x: x / 100, y: y / 100 }]
          }] as any
        })
        return
      } catch (err) {
        console.log('Single-shot focus failed')
      }
    }

    if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
      try {
        await videoTrack.applyConstraints({
          advanced: [{ focusMode: 'continuous' }] as any
        })
      } catch (err) {
        console.log('Continuous focus failed')
      }
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (flash) {
      const flashDiv = document.getElementById('flash-effect')
      if (flashDiv) {
        flashDiv.style.opacity = '1'
        setTimeout(() => {
          flashDiv.style.opacity = '0'
        }, 100)
      }
    }

    // ZASTOSUJ DIGITAL ZOOM przy robieniu zdjęcia (jeśli iOS)
    if (!hasNativeZoom && zoom > 1) {
      context.save()
      context.translate(canvas.width / 2, canvas.height / 2)
      context.scale(zoom, zoom)
      context.translate(-canvas.width / 2, -canvas.height / 2)
    }

    // Mirror dla selfie
    if (facingMode === 'user') {
      context.save()
      context.scale(-1, 1)
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
      context.restore()
    } else {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
    }

    if (!hasNativeZoom && zoom > 1) {
      context.restore()
    }

    const imageData = canvas.toDataURL('image/jpeg', 0.95)
    setCapturedImage(imageData)
  }

  const handleCapture = () => {
    capturePhoto()
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setUploadSuccess(false)
  }

  const uploadPhoto = async () => {
    if (!capturedImage) return

    setUploading(true)

    try {
      const { data: eventData } = await supabase
        .from('events')
        .select('id')
        .eq('is_active', true)
        .single()

      if (!eventData) {
        alert('No active event found')
        setUploading(false)
        return
      }

      const response = await fetch(capturedImage)
      const blob = await response.blob()
      const fileName = `${Date.now()}_${generateUUID()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      let deviceId = localStorage.getItem('device_id')
      if (!deviceId) {
        deviceId = generateUUID()
        localStorage.setItem('device_id', deviceId)
      }

      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          event_id: eventData.id,
          storage_path: fileName,
          device_id: deviceId
        })

      if (dbError) throw dbError

      setUploadSuccess(true)
      setTimeout(() => {
        setCapturedImage(null)
        setUploadSuccess(false)
      }, 1500)

    } catch (err) {
      console.error('Upload error:', err)
      alert('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 backdrop-blur-2xl p-12 rounded-[32px] border border-slate-600/50 mb-6 shadow-[0_16px_64px_rgba(15,23,42,0.6)]">
            <Camera className="w-20 h-20 text-slate-600 mx-auto mb-4" strokeWidth={1.3} />
            <h2 className="text-2xl font-semibold text-white mb-3">Wymagany dostęp do kamery</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300"
            >
              Wróć
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="relative w-full h-screen">
        {/* VIDEO Z TAP-TO-FOCUS I PINCH-TO-ZOOM */}
        <div 
          className="absolute inset-0 overflow-hidden touch-none"
          onClick={handleFocus}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transition-transform duration-100"
            style={{ 
              transform: hasNativeZoom 
                ? (facingMode === 'user' ? 'scaleX(-1)' : 'none')
                : (facingMode === 'user' 
                    ? `scaleX(-1) scale(${zoom})` 
                    : `scale(${zoom})`)
            }}
          />
          
          {/* Focus indicator */}
          {focusPoint && (
            <div
              className="absolute pointer-events-none z-30"
              style={{
                left: focusPoint.x,
                top: focusPoint.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative">
                <div className="w-20 h-20 border-2 border-white rounded-full animate-focus-ring"></div>
                <div className="absolute inset-0 w-20 h-20 border-2 border-yellow-400 rounded-full animate-focus-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-5 bg-white"></div>
                  <div className="absolute w-5 h-0.5 bg-white"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />

        <div
          id="flash-effect"
          className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-100 opacity-0 z-40"
        />

        {grid && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/30" />
              ))}
            </div>
          </div>
        )}

        {/* ZOOM SLIDER - pokazuje się przy pinch lub na stałe */}
        <div className={`absolute top-24 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ${
          showZoomSlider || zoom > 1.1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="bg-black/60 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 shadow-lg">
            <div className="flex items-center gap-4">
              <span className="text-white text-sm font-bold min-w-[3rem] text-center">
                {zoom.toFixed(1)}x
              </span>
              <input
                type="range"
                min={minZoom}
                max={maxZoom}
                step="0.1"
                value={zoom}
                onChange={(e) => {
                  applyZoom(Number(e.target.value))
                  setShowZoomSlider(true)
                }}
                onTouchStart={() => setShowZoomSlider(true)}
                className="w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* ZOOM BUTTONS (prawy bok) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3">
          <button
            onClick={() => {
              applyZoom(Math.min(maxZoom, zoom + 0.5))
              setShowZoomSlider(true)
              setTimeout(() => setShowZoomSlider(false), 2000)
            }}
            className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-white font-bold text-xl hover:bg-black/70 active:bg-black/80 transition-all duration-200 active:scale-95 shadow-lg"
          >
            <ZoomIn className="w-6 h-6 mx-auto" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => {
              applyZoom(Math.max(minZoom, zoom - 0.5))
              setShowZoomSlider(true)
              setTimeout(() => setShowZoomSlider(false), 2000)
            }}
            className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-white font-bold text-xl hover:bg-black/70 active:bg-black/80 transition-all duration-200 active:scale-95 shadow-lg"
          >
            <ZoomOut className="w-6 h-6 mx-auto" strokeWidth={2.5} />
          </button>
        </div>

        {/* Top Controls */}
        <div className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/90 via-black/50 to-transparent pt-safe p-4 sm:p-6 transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="group bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-xl p-3.5 rounded-full border border-white/20 transition-all duration-300 active:scale-95 min-w-[48px] min-h-[48px] focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-0.5 transition-transform duration-300" strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFlash(!flash)}
                className={`p-3.5 rounded-full backdrop-blur-xl border transition-all duration-300 active:scale-95 min-w-[48px] min-h-[48px] focus:outline-none focus:ring-2 focus:ring-white/50 ${
                  flash 
                    ? 'bg-yellow-500/90 border-yellow-400/60 shadow-[0_0_24px_rgba(234,179,8,0.6)]' 
                    : 'bg-white/10 border-white/20 hover:bg-white/20 active:bg-white/25'
                }`}
              >
                {flash ? (
                  <Zap className="w-5 h-5 text-white" strokeWidth={2.5} fill="white" />
                ) : (
                  <ZapOff className="w-5 h-5 text-white" strokeWidth={2.5} />
                )}
              </button>

              <button
                onClick={() => setGrid(!grid)}
                className={`p-3.5 rounded-full backdrop-blur-xl border transition-all duration-300 active:scale-95 min-w-[48px] min-h-[48px] focus:outline-none focus:ring-2 focus:ring-white/50 ${
                  grid 
                    ? 'bg-white/20 border-white/40' 
                    : 'bg-white/10 border-white/20 hover:bg-white/20 active:bg-white/25'
                }`}
              >
                <Grid3x3 className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent pb-safe px-6 sm:px-8 pb-24 sm:pb-32 transition-all duration-700 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between">
              <button
                onClick={() => router.push('/gallery')}
                className="group relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/40 hover:border-white/60 active:border-white/70 transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
              </button>

              <button
                onClick={handleCapture}
                disabled={!isCameraReady}
                className="group relative disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 mb-2 focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white/40 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white group-hover:bg-slate-200 group-active:bg-slate-300 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.5)] group-hover:shadow-[0_0_60px_rgba(255,255,255,0.7)] flex items-center justify-center">
                      <Camera className="w-10 h-10 text-black" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-20" />
                </div>
              </button>

              <button
                onClick={switchCamera}
                className="bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-xl p-3.5 rounded-full border border-white/20 transition-all duration-300 active:scale-95 min-w-[56px] min-h-[56px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <RotateCcw className="w-6 h-6 text-white" strokeWidth={2.5} />
              </button>
            </div>

            {!isCameraReady && (
              <div className="text-center mt-4">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
                  <Loader2 className="w-4 h-4 text-white animate-spin" strokeWidth={2.5} />
                  <span className="text-white text-sm font-medium">Initializing...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {capturedImage && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="flex-1 relative">
              <img
                src={capturedImage}
                alt="Captured"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {uploadSuccess && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                <div className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-2xl">
                  <Check className="w-6 h-6" strokeWidth={3} />
                  <span>Uploaded!</span>
                </div>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-32 pb-safe pb-20 sm:pb-24 px-6">
              <div className="max-w-md mx-auto flex gap-4">
                <button
                  onClick={retakePhoto}
                  disabled={uploading}
                  className="flex-1 bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-xl text-white px-6 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 border border-white/30 transition-all duration-300 active:scale-95 disabled:opacity-50 min-h-[64px] shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <X className="w-6 h-6" strokeWidth={2.5} />
                  <span>Powtórz</span>
                </button>

                <button
                  onClick={uploadPhoto}
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 active:from-slate-400 active:to-slate-500 text-white px-6 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(100,116,139,0.5)] hover:shadow-[0_0_60px_rgba(148,163,184,0.7)] transition-all duration-500 active:scale-95 disabled:opacity-50 min-h-[64px] border border-slate-500/50 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" strokeWidth={2.5} />
                      <span>Przesyłanie...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-6 h-6" strokeWidth={2.5} />
                      <span>Użyj zdjęcia</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        button:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
        }
        
        button:active {
          transform: scale(0.95);
        }
        
        @keyframes focus-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        
        @keyframes focus-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(0.85);
          }
        }
        
        .animate-focus-ring {
          animation: focus-ring 1s ease-out;
        }
        
        .animate-focus-pulse {
          animation: focus-pulse 0.6s ease-in-out;
        }
      `}</style>
    </div>
  )
}
