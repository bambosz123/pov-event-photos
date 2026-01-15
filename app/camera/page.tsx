'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import CameraGallery from '@/components/Camera/CameraGallery'

function CameraContent() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || 'event'

  return <CameraGallery eventId={eventId} />
}

export default function CameraPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">Ładowanie...</div>}>
      <CameraContent />
    </Suspense>
  )
}
