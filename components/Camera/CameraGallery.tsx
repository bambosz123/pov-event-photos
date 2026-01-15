'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import CameraCapture from '@/components/Camera/CameraCapture'

function CameraContent() {
  const searchParams = useSearchParams()
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
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">📸</div>
          <div>Ładowanie kamery...</div>
        </div>
      </div>
    }>
      <CameraContent />
    </Suspense>
  )
}
