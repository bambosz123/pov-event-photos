'use client'

import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, Zap, ZapOff, Download, Trash2, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Photo {
  id: string
  dataUrl: string
  timestamp: Date
}

export default function CameraGallery({ eventId }: { eventId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [flashEnabled, setFlashEnabled] = useState(true)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  // Załaduj zdjęcia przy starcie
  useEffect(() => {
    const saved = sessionStorage.getItem(`photos_${eventId}`)
    if (saved) {
      try {
        setPhotos(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading photos:', e)
      }
    }
  }, [eventId])

  // Zapisuj zdjęcia do sessionStorage
  useEffect(() => {
    sessionStorage.setItem(`photos_${eventId}`, JSON.stringify(photos))
  }, [photos, eventId])

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

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    setIsRecording(false)
  }

  const openCamera = async () => {
    setIsRecording(true)
    await startCamera(facingMode)
  }

  const toggleCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user')
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

      // Flash
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

      // Rysuj
      if (facingMode === 'user') {
        ctx.scale(-1, 1)
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
      } else {
        ctx.drawImage(video, 0, 0)
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)

      const newPhoto: Photo = {
        id: `photo_${Date.now()}`,
        dataUrl,
        timestamp: new Date()
      }

      setPhotos(prev => [newPhoto, ...prev])
    } catch (error) {
      console.error('Capture error:', error)
    }
  }

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a')
    link.href = photo.dataUrl
    link.download = `foto_${photo.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const deletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  const downloadAll = () => {
    photos.forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = photo.dataUrl
        link.download = `foto_${index + 1}_${photo.id}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, index * 500)
    })
  }

  // APARAT - Modal
  if (isRecording) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />

        <canvas ref={canvasRef} className="hidden" />

        {/* Top */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={stopCamera}
              className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="text-white font-semibold">📸 Aparat</div>
              <div className="text-white/70 text-sm">Zdjęć: {photos.length}</div>
            </div>
            <button
              onClick={() => setFlashEnabled(!flashEnabled)}
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

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent pb-8 pt-12">
          <div className="flex items-center justify-between px-6 mb-4">
            <div className="w-14" />

            <button
              onClick={capturePhoto}
              className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition"
            >
              <div className="w-16 h-16 rounded-full bg-white" />
            </button>

            <button
              onClick={toggleCamera}
              className="w-14 h-14 flex items-center justify-center text-white bg-black/50 rounded-lg border border-white/30 hover:bg-black/70 transition"
            >
              <RotateCw className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // GALERIA - Main view
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">📸 Galeria</h1>
            <p className="text-blue-100 text-sm">Zdjęć: {photos.length}</p>
          </div>
          <div className="flex gap-2">
            {photos.length > 0 && (
              <button
                onClick={downloadAll}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Pobierz wszystko
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Wyjście
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">Brak zdjęć</p>
            <button
              onClick={openCamera}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition inline-flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Robić zdjęcia
            </button>
          </div>
        ) : (
          <>
            {/* Galeria */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition">
                  <div className="relative aspect-square group">
                    <img
                      src={photo.dataUrl}
                      alt="Photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={() => downloadPhoto(photo)}
                        className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Przycisk robienia zdjęć */}
            <div className="flex justify-center mb-8">
              <button
                onClick={openCamera}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition inline-flex items-center gap-2 text-lg"
              >
                <Camera className="w-6 h-6" />
                Zrób więcej zdjęć
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
