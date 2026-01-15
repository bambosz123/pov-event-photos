'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import CameraGallery from '@/components/Camera/CameraGallery'

export default function CameraPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''

  return (
    <Suspense fallback={<div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">Ładowanie...</div>}>
      <CameraGallery eventId={eventId} />
    </Suspense>
  )
}
