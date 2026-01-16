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
    } catch (err) {
      console.error('Camera error:', err)
      setError('Camera access denied. Please allow camera permissions.')
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

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const handleFocus = async (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!streamRef.current || !videoRef.current) return

    const rect = videoRef.current.getBoundingClientRect()
    
    // Obsługa zarówno myszy jak i touch
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

    // Pokaż animację focusa
    setFocusPoint({ x: clientX - rect.left, y: clientY - rect.top })
    setTimeout(() => setFocusPoint(null), 1000)

    // Ustaw focus w kamerze
    const videoTrack = streamRef.current.getVideoTracks()[0]
    const capabilities = videoTrack.getCapabilities() as any

    // Spróbuj single-shot autofocus
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

    // Fallback - continuous autofocus
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

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

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
            <h2 className="text-2xl font-semibold text-white mb-3">Camera Access Required</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="relative w-full h-screen">
        {/* VIDEO Z TAP-TO-FOCUS */}
        <div 
          className="absolute inset-0 overflow-hidden"
          onClick={handleFocus}
          onTouchStart={handleFocus}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
          
          {/* Focus indicator - animowany okrąg */}
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
                {/* Zewnętrzny pierścień */}
                <div className="w-20 h-20 border-2 border-white rounded-full animate-focus-ring"></div>
                {/* Wewnętrzny pierścień */}
                <div className="absolute inset-0 w-20 h-20 border-2 border-yellow-400 rounded-full animate-focus-pulse"></div>
                {/* Krzyżyk */}
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

        {/* Bottom Controls - WYŻEJ OD DOŁU */}
        <div className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent pb-safe px-6 sm:px-8 pb-24 sm:pb-32 transition-all duration-700 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between">
              {/* Galeria (lewo) */}
              <button
                onClick={() => router.push('/gallery')}
                className="group relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/40 hover:border-white/60 active:border-white/70 transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
              </button>

              {/* Środek - przycisk zdjęcia */}
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

              {/* Prawo - switch kamery */}
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
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />
            </div>

            {/* Success message */}
            {uploadSuccess && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                <div className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-2xl">
                  <Check className="w-6 h-6" strokeWidth={3} />
                  <span>Uploaded!</span>
                </div>
              </div>
            )}

            {/* Action Buttons - WYŻEJ OD DOŁU */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-32 pb-safe pb-20 sm:pb-24 px-6">
              <div className="max-w-md mx-auto flex gap-4">
                <button
                  onClick={retakePhoto}
                  disabled={uploading}
                  className="flex-1 bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-xl text-white px-6 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 border border-white/30 transition-all duration-300 active:scale-95 disabled:opacity-50 min-h-[64px] shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <X className="w-6 h-6" strokeWidth={2.5} />
                  <span>Retake</span>
                </button>

                <button
                  onClick={uploadPhoto}
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 active:from-slate-400 active:to-slate-500 text-white px-6 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(100,116,139,0.5)] hover:shadow-[0_0_60px_rgba(148,163,184,0.7)] transition-all duration-500 active:scale-95 disabled:opacity-50 min-h-[64px] border border-slate-500/50 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" strokeWidth={2.5} />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-6 h-6" strokeWidth={2.5} />
                      <span>Use Photo</span>
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
