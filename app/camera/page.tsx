'use client'

import { Suspense } from 'react'

interface CameraGalleryProps {
  eventId: string
}

function CameraGallery({ eventId }: CameraGalleryProps) {
  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
      <p>Camera Gallery for event: {eventId}</p>
    </div>
  )
}

export default function CameraPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">Ładowanie...</div>}>
      <CameraGallery eventId="default" />
    </Suspense>
  )
}
