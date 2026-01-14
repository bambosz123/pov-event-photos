'use client'

import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, Zap, ZapOff, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface CameraCaptureProps {
  eventId: string
  tableId: string
  tableName: string
}

// Inicjalizacja Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CameraCapture({ eventId, tableId, tableName }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [isCapturing, setIsCapturing] = useState(false)
  const [lastPhoto, setLastPhoto] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [facingMode])

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

      if (flashEnabled) {
        const flashDiv = document.getElementById('flash-effect')
        if (flashDiv) {
          flashDiv.classList.remove('hidden')
          setTimeout(() => flashDiv.classList.add('hidden'), 200)
        }
      }

      ctx.drawImage(video, 0, 0)

      canvas.toBlob(async (blob) => {
        if (!blob) return

        const fileName = `${eventId}_${tableId}_${Date.now()}.jpg`

        const { error: uploadError } = await supabase.storage
          .from('event-photos')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600'
          })

        if (uploadError) {
          throw uploadError
        }

        const { error: dbError } = await supabase
          .from('photos')
          .insert({
            event_id: eventId,
            table_id: tableId,
            file_path: fileName,
            uploaded_by: tableId
          })

        if (dbError) {
          throw dbError
        }

        const photoUrl = URL.createObjectURL(blob)
        setLastPhoto(photoUrl)

        toast.success('✅ Zdjęcie zapisane!')
      }, 'image/jpeg', 0.9)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Błąd podczas zapisywania')
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: `scale(${zoom})` }}
      />

      <canvas ref={canvasRef} className="hidden" />

      <div
        id="flash-effect"
        className="hidden absolute inset-0 bg-white pointer-events-none"
      />

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
            <div className="text-white/70 text-sm">Event: {eventId}</div>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent pb-8 pt-6">
        <div className="flex items-center justify-between px-6 mb-6">
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

          <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-2">
            <button
              onClick={() => setZoom(0.5)}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition ${
                zoom === 0.5 ? 'text-yellow-400' : 'text-white'
              }`}
            >
              0.5
            </button>
            <button
              onClick={() => setZoom(1)}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition ${
                zoom === 1 ? 'text-yellow-400' : 'text-white'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setZoom(2)}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition ${
                zoom === 2 ? 'text-yellow-400' : 'text-white'
              }`}
            >
              2x
            </button>
          </div>

          <button
            onClick={toggleCamera}
            className="w-12 h-12 flex items-center justify-center text-white"
          >
            <RotateCw className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-8 px-6">
          <button className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/50 bg-gray-800 flex items-center justify-center">
            {lastPhoto ? (
              <img src={lastPhoto} alt="Last" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-6 h-6 text-white/50" />
            )}
          </button>

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

          <div className="w-12" />
        </div>
      </div>
    </div>
  )
}
