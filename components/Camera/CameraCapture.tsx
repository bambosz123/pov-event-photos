'use client'

import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, Zap, ZapOff, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CameraCapture({ eventId, tableId, tableName }: any) {
  const [count, setCount] = useState(0)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [flashEnabled, setFlashEnabled] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      console.log('Starting camera with mode:', mode)
      
      // Zatrzymaj poprzedni stream
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
        console.log('Camera started!')
      }
    } catch (e) {
      console.error('Camera error:', e)
    }
  }

  useEffect(() => {
    startCamera(facingMode)

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [facingMode])

  const toggleCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user')
  }

  const capturePhoto = () => {
    // Flash effect
    const flashDiv = document.getElementById('flash-effect')
    if (flashDiv) {
      flashDiv.classList.remove('hidden')
      setTimeout(() => flashDiv.classList.add('hidden'), 150)
    }
    
    setCount(count + 1)
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video - lustro dla przedniej kamery */}
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

      {/* Flash effect */}
      <div
        id="flash-effect"
        className="hidden absolute inset-0 bg-white pointer-events-none opacity-80"
        style={{ animation: 'flash 0.15s ease-out' }}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <div className="text-white font-semibold">{tableName}</div>
            <div className="text-white/70 text-sm">Zdjęć: {count}</div>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent pb-8 pt-6">
        {/* Top controls row */}
        <div className="flex items-center justify-center px-6 mb-6 gap-6">
          {/* Flash toggle */}
          <button
            onClick={() => setFlashEnabled(!flashEnabled)}
            className="w-12 h-12 flex items-center justify-center text-white"
          >
            {flashEnabled ? (
              <Zap className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ) : (
              <ZapOff className="w-6 h-6" />
            )}
          </button>

          {/* Rotate camera */}
          <button
            onClick={toggleCamera}
            className="w-12 h-12 flex items-center justify-center text-white"
          >
            <RotateCw className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom row - Capture button */}
        <div className="flex items-center justify-center gap-8 px-6">
          {/* Gallery preview placeholder */}
          <button className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/50 bg-gray-800 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-white/50" />
          </button>

          {/* Capture Button */}
          <button
            onClick={capturePhoto}
            className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition"
          >
            <div className="w-16 h-16 rounded-full bg-white" />
          </button>

          {/* Spacer */}
          <div className="w-12" />
        </div>
      </div>

      <style jsx>{`
        @keyframes flash {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
