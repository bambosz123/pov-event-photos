'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, Camera, Download, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Photo {
  id: string
  dataUrl: string
}

function CameraPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || 'event'
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  useEffect(() => {
    const saved = sessionStorage.getItem(`photos_${eventId}`)
    if (saved) setPhotos(JSON.parse(saved))
  }, [eventId])

  useEffect(() => {
    sessionStorage.setItem(`photos_${eventId}`, JSON.stringify(photos))
  }, [photos, eventId])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } }
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setIsRecording(true)
    } catch (e) {
      alert('Brak dostępu do kamery')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    setIsRecording(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (facingMode === 'user') {
      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    } else {
      ctx.drawImage(video, 0, 0)
    }
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    setPhotos(prev => [{ id: `photo_${Date.now()}`, dataUrl }, ...prev])
  }

  if (isRecording) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute top-4 left-0 right-0 flex justify-between px-4">
          <button onClick={stopCamera} className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white"><X className="w-6 h-6" /></button>
          <button onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')} className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white"><RotateCw className="w-6 h-6" /></button>
        </div>
        <div className="absolute bottom-8 left-0 right-0 flex justify-center"><button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"><div className="w-16 h-16 rounded-full bg-white" /></button></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-blue-600 p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div><h1 className="text-2xl font-bold text-white">📸 Galeria</h1><p className="text-blue-100 text-sm">Zdjęć: {photos.length}</p></div>
          <button onClick={() => router.push('/')} className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold"><X className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-4">
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <button onClick={startCamera} className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold inline-flex items-center gap-2"><Camera className="w-5 h-5" />Robić zdjęcia</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {photos.map(p => (
                <div key={p.id} className="bg-gray-800 rounded-lg overflow-hidden group">
                  <img src={p.dataUrl} alt="Photo" className="w-full h-full object-cover aspect-square" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex gap-2 items-center justify-center hidden group-hover:flex">
                    <a href={p.dataUrl} download className="bg-blue-600 text-white p-3 rounded"><Download className="w-5 h-5" /></a>
                    <button onClick={() => setPhotos(prev => prev.filter(x => x.id !== p.id))} className="bg-red-600 text-white p-3 rounded"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center"><button onClick={startCamera} className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold inline-flex items-center gap-2 text-lg"><Camera className="w-6 h-6" />Zrób więcej zdjęć</button></div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">Ładowanie...</div>}>
      <CameraPage />
    </Suspense>
  )
}
