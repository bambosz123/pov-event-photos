'use client'

import { ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [showQRGenerator, setShowQRGenerator] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [numTables, setNumTables] = useState('10')
  const [autoDelete, setAutoDelete] = useState('7')

  const handleCreateEvent = () => {
    if (!eventName || !eventDate) {
      toast.error('Uzupełnij wszystkie pola!')
      return
    }
    toast.success(`✅ Event "${eventName}" został utworzony!`)
    setEventName('')
    setEventDate('')
    setShowNewEvent(false)
  }

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-white">🔐 Panel Admin</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Zdjęć</div>
            <div className="text-4xl font-bold text-blue-400">1247</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Eventów</div>
            <div className="text-4xl font-bold text-green-400">8</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Użytkowników</div>
            <div className="text-4xl font-bold text-purple-400">23</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowNewEvent(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold text-lg"
          >
            ➕ Nowy event
          </button>
          <button
            onClick={() => setShowQRGenerator(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-xl font-bold text-lg"
          >
            🎫 Generuj QR
          </button>
          <button
            onClick={() => setShowReports(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold text-lg"
          >
            📊 Raporty
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-xl font-bold text-lg"
          >
            ⚙️ Ustawienia
          </button>
        </div>
      </div>

      {/* MODAL: Nowy Event */}
      {showNewEvent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">➕ Nowy event</h2>
              <button onClick={() => setShowNewEvent(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Nazwa eventu"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
              <input
                type="number"
                value={numTables}
                onChange={(e) => setNumTables(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewEvent(false)}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
                >
                  Utwórz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QR Codes */}
      {showQRGenerator && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">🎫 Generuj QR</h2>
              <button onClick={() => setShowQRGenerator(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                <option>Wesele Ania & Piotr</option>
                <option>Urodziny Marka</option>
              </select>
              <input
                type="number"
                defaultValue="10"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
              <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-700/50">
                <div className="text-purple-400 font-semibold">QR zawierać będzie:</div>
                <ul className="text-gray-300 text-sm mt-2 space-y-1">
                  <li>✓ ID eventu</li>
                  <li>✓ Numer stolika</li>
                  <li>✓ Link dostępu</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQRGenerator(false)}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Anuluj
                </button>
                <button
                  onClick={() => {
                    toast.success('📱 Generowanie QR PDF...')
                    setShowQRGenerator(false)
                  }}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold"
                >
                  Generuj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Raporty */}
      {showReports && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">📊 Raporty</h2>
              <button onClick={() => setShowReports(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                📈 Aktywność
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                👥 Użytkownicy
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                💾 Storage
              </button>
              <button
                onClick={() => {
                  toast.success('📊 Raport wyeksportowany!')
                  setShowReports(false)
                }}
                className="w-full bg-green-700 hover:bg-green-800 text-white px-4 py-3 rounded-lg font-bold"
              >
                📥 Export Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Ustawienia */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">⚙️ Ustawienia</h2>
              <button onClick={() => setShowSettings(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Auto-delete po (dni):</label>
                <input
                  type="number"
                  value={autoDelete}
                  onChange={(e) => setAutoDelete(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="bg-orange-900/30 p-4 rounded-lg border border-orange-700/50">
                <div className="text-orange-400 font-semibold">Bieżące ustawienia:</div>
                <ul className="text-gray-300 text-sm mt-2 space-y-1">
                  <li>✓ Automatyczne usuwanie zdjęć po {autoDelete} dniach</li>
                  <li>✓ Max 1000 zdjęć na event</li>
                  <li>✓ Watermark włączony</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Anuluj
                </button>
                <button
                  onClick={() => {
                    toast.success('⚙️ Ustawienia zapisane!')
                    setShowSettings(false)
                  }}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg font-bold"
                >
                  Zapisz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
