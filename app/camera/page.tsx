'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import CameraCapture from '@/components/Camera/CameraCapture'

function CameraContent() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || 'unknown'
  const tableName = searchParams.get('table') || 'Stół 1'

  return (
    <CameraCapture 
      eventId={eventId}
      tableId={tableName}
      tableName={tableName}
    />
  )
}

export default function CameraPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-black flex items-center justify-center text-white">Ładowanie kamery...</div>}>
      <CameraContent />
    </Suspense>
  )
}
