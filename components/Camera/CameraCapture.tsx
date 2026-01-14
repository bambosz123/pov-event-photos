'use client'

import { useState, useRef, useEffect } from 'react'

export default function CameraCapture({ eventId, tableId, tableName }: any) {
  const [count, setCount] = useState(0)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const videoRef = useRef<HTMLVideoElement>(null)

  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      console.log('Starting camera with mode:', mode)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode } 
      })
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
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [facingMode])

  const toggleCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user')
  }

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
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setCount(count + 1)} 
          style={{ 
            flex: 1,
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
        
        <button 
          onClick={toggleCamera} 
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔄 Przód/Tył
        </button>
      </div>
    </div>
  )
}
