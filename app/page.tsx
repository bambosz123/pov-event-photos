'use client'

import Link from 'next/link'
import { useState } from 'react'
import { QrCode, Camera, Image, Download, BarChart3 } from 'lucide-react'

export default function Home() {
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrInput, setQrInput] = useState('')

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">📸 POV Event Photos</h1>
          <Link 
            href="/admin/dashboard"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            🔐 Admin
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Współdzielenie zdjęć z eventów
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Skanuj QR kod i zacznij fotografować!
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Camera */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition transform hover:scale-105">
            <Camera className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Rób Zdjęcia</h3>
            <p className="text-gray-600 mb-4">
              Natywny dostęp do aparatu z filtrami real-time i watermarkami.
            </p>
            <Link 
              href="/event/demo/table/1"
              className="inline-block text-blue-600 font-semibold hover:underline bg-blue-100 px-4 py-2 rounded-lg"
            >
              → Otwórz aparat →
            </Link>
          </div>

          {/* Gallery Live */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition transform hover:scale-105">
            <Image className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Galeria Live</h3>
            <p className="text-gray-600 mb-4">
              Wszystkie zdjęcia z eventu w real-time z reakcjami i licznikami.
            </p>
            <Link 
              href="/gallery/demo"
              className="inline-block text-purple-600 font-semibold hover:underline bg-purple-100 px-4 py-2 rounded-lg"
            >
              → Zobacz galerię →
            </Link>
          </div>

          {/* Download */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition transform hover:scale-105">
            <Download className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Pobierz Zdjęcia</h3>
            <p className="text-gray-600 mb-4">
              Pobierz wszystkie zdjęcia jako ZIP z multi-select i filtrami.
            </p>
            <Link 
              href="/download/demo"
              className="inline-block text-green-600 font-semibold hover:underline bg-green-100 px-4 py-2 rounded-lg"
            >
              → Panel pobierania →
            </Link>
          </div>

          {/* Admin */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition transform hover:scale-105">
            <BarChart3 className="w-12 h-12 text-orange-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Panel Admin</h3>
            <p className="text-gray-600 mb-4">
              Statystyki, QR generator, moderacja i Export PDF.
            </p>
            <Link 
              href="/admin/dashboard"
              className="inline-block text-orange-600 font-semibold hover:underline bg-orange-100 px-4 py-2 rounded-lg"
            >
              → Admin Panel →
            </Link>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold mb-4">✅ Status Setup:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span>Projekt Next.js utworzony</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span>Aparat z filtrami</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span>Galeria live</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span>Panel pobierania</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span>Panel administratora</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
