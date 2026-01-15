'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import CameraCapture from '@/components/Camera/CameraCapture'

function CameraContent() {
  const searchParams = useSearchParams()
  
  // ✅ Poprawnie - jako string, nie obiekt
  const eventId = searchParams.get('eventId') || 'default-event'
  const tableId = searchParams.get('tableId') || 'default-table'
  const tableName = searchParams.get('tableName') || 'Stolik'

  return (
    <CameraCapture 
      eventId={eventId}
      tableId={tableId}
      tableName={tableName}
    />
  )
}

export default function CameraPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">📸</div>
          <div className="text-xl">Ładowanie kamery...</div>
        </div>
      </div>
    }>
      <CameraContent />
    </Suspense>
  )
}
