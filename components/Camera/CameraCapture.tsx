'use client'

import { useState, useRef, useEffect } from 'react'

export default function CameraCapture({ eventId, tableId, tableName }: any) {
  const [count, setCount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const startCamera = async () => {
      try {
        console.log('Auto-starting camera...')
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          console.log('Camera started automatically!')
        }
      } catch (e) {
        console.error('Camera error:', e)
      }
    }

    startCamera()

    // Cleanup - stop camera when leaving page
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>📷 Zdjęć: {count}</h1>
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ 
          width: '100%', 
          height: '400px', 
          backgroundColor: 'black', 
          marginBottom: '10px',
          borderRadius: '8px'
        }}
      />
      
      <button 
        onClick={() => setCount(count + 1)} 
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        📸 Zrób zdjęcie
      </button>
    </div>
  )
}
