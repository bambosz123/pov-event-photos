'use client'

export const dynamic = 'force-dynamic'

import { useSearchParams } from 'next/navigation'
import CameraCapture from '@/components/Camera/CameraCapture'

export default function CameraPage() {
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
