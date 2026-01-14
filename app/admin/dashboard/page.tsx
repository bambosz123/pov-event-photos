'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Plus, LogOut, Download, Eye } from 'lucide-react'

interface Event {
  id: string
  name: string
  createdAt: string
  qrCode: string
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [eventName, setEventName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('admin-token')
    if (!token) {
      router.push('/admin')
    }
    
    const saved = localStorage.getItem('events')
    if (saved) {
      setEvents(JSON.parse(saved))
    }
  }, [router])

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventName.trim()) return

    setIsCreating(true)

    const eventId = `evt_${Date.now()}`
    const appUrl = `${window.location.origin}/camera?eventId=${eventId}`

    const newEvent: Event = {
      id: eventId,
      name: eventName,
      createdAt: new Date().toLocaleString('pl-PL'),
      qrCode: appUrl
    }

    const updatedEvents = [...events, newEvent]
    setEvents(updatedEvents)
    localStorage.setItem('events', JSON.stringify(updatedEvents))

    setEventName('')
    setIsCreating(false)
  }

  const downloadQR = (event: Event) => {
    const qrElement = document.getElementById(`qr-${event.id}`)
    if (qrElement) {
      const svg = qrElement.querySelector('svg')
      if (svg) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const image = new Image()
        const svgData = new XMLSerializer().serializeToString(svg)
        const img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          const link = document.createElement('a')
          link.href = canvas.toDataURL()
          link.download = `qr-${event.name}.png`
          link.click()
        }
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('admin-token')
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">📸 Admin Panel</h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-5 h-5" />
            Wyloguj się
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Utwórz nowy event</h2>
          
          <form onSubmit={createEvent} className="flex gap-3">
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Nazwa eventu (np. Wesele Kowalskich)"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              disabled={isCreating}
            />
            <button
              type="submit"
              disabled={isCreating}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Utwórz
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4">
                <h3 className="text-xl font-bold text-white">{event.name}</h3>
                <p className="text-blue-100 text-sm">{event.createdAt}</p>
              </div>

              <div className="p-6">
                <div className="bg-gray-100 p-4 rounded-lg flex justify-center mb-4" id={`qr-${event.id}`}>
                  <QRCodeSVG 
                    value={event.qrCode} 
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">URL do aplikacji:</p>
                  <input
                    type="text"
                    value={event.qrCode}
                    readOnly
                    className="w-full px-2 py-2 bg-gray-100 text-xs rounded border-none text-gray-700"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => downloadQR(event)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Pobierz QR
                  </button>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Podgląd
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">Brak eventów. Utwórz swój pierwszy event!</p>
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">{selectedEvent.name}</h2>
            <div className="bg-gray-100 p-6 rounded-lg flex justify-center mb-6">
              <QRCodeSVG
                value={selectedEvent.qrCode} 
                size={300}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-gray-600 text-sm mb-4 break-all">{selectedEvent.qrCode}</p>
            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded font-bold hover:bg-gray-700 transition"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
