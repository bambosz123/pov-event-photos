'use client'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'

export default function CameraCapture({ eventId, tableId, tableName }: any) {
  const [count, setCount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      toast.error('Brak dostępu do aparatu')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📷 Rób zdjęcia - {count}</h2>
      <video ref={videoRef} className="w-full h-80 bg-black rounded-lg" />
      <button onClick={startCamera} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
        🎥 Włącz aparat
      </button>
      <button onClick={() => { setCount(count + 1); toast.success('Zdjęcie!') }} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">
        📸 Zrób zdjęcie
      </button>
    </div>
  )
}
