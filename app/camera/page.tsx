'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import CameraGalleryComponent from '@/components/Camera/CameraGallery'

interface CameraGalleryProps {
  eventId: string
}

export default function CameraPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  
  return (
    <Suspense fallback={<div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">Ładowanie...</div>}>
      <CameraGalleryComponent eventId={eventId} />
    </Suspense>
  )
}
