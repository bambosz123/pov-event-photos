'use client'

import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CameraCapture({ eventId, tableId, tableName }: any) {
  const [count, setCount] = useState(0)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [zoom, setZoom] = useState<number>(1)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      console.log('Starting camera:', mode)
      
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
    setZoom(1) // Reset zoom
  }

  const toggleZoom = () => {
    // Przełącz między 0.5x (oddal) i 1x (normalny)
    setZoom(zoom === 1 ? 0.5 : 1)
  }

  const capturePhoto = async () => {
    // Flash dla TYLNEJ kamery (LED latarka)
    if (facingMode === 'environment' && streamRef.current) {
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
          console.log('Torch not supported:', e)
        }
      }
    }

    // Flash dla PRZEDNIEJ kamery (biały ekran)
    if (facingMode === 'user') {
      const flashDiv = document.getElementById('flash-effect')
      if (flashDiv) {
        flashDiv.classList.remove('hidden')
        setTimeout(() => flashDiv.classList.add('hidden'), 150)
      }
    }

    setCount(count + 1)
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300"
        style={{ 
          transform: facingMode === 'user' 
            ? `scaleX(-1) scale(${zoom})` 
            : `scale(${zoom})`
        }}
      />

      <div
        id="flash-effect"
        className="hidden absolute inset-0 bg-white pointer-events-none opacity-90"
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
        
        {/* Przycisk zoom - ŚRODEK GÓRA - tylko dla tylnej */}
        {facingMode === 'environment' && (
          <div className="flex justify-center mb-6">
            <button
              onClick={toggleZoom}
              className="bg-black/50 rounded-full px-5 py-2 text-white font-bold text-base border border-white/30 active:scale-95 transition"
            >
              {zoom === 1 ? '1x' : '0.5x'}
            </button>
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between px-6">
          {/* Gallery preview - LEWY */}
          <button className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/50 bg-gray-800 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-white/50" />
          </button>

          {/* Capture Button - ŚRODEK */}
          <button
            onClick={capturePhoto}
            className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition"
          >
            <div className="w-16 h-16 rounded-full bg-white" />
          </button>

          {/* Rotate camera - PRAWY */}
          <button
            onClick={toggleCamera}
            className="w-12 h-12 flex items-center justify-center text-white bg-black/50 rounded-full border border-white/30"
          >
            <RotateCw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
