'use client'

import Link from 'next/link'
import { Camera, Image, Download, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            📸 POV Event Photos
          </h1>
          <Link 
            href="/admin"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            🔐 Admin
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            📸 POV Event Photos
          </h2>
          <p className="text-xl text-white/90">
            Wspólna galeria dla wszystkich gości
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* 1. Zrób zdjęcie - NIEBIESKI */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 shadow-2xl hover:scale-105 transition transform">
            <Camera className="w-16 h-16 text-white mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Zrób zdjęcie</h3>
            <p className="text-blue-100 mb-6">
              Otwórz aparat i dodaj foto
            </p>
            <Link 
              href="/camera"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition"
            >
              → Otwórz aparat →
            </Link>
          </div>

          {/* 2. Galeria Live - FIOLETOWY */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 shadow-2xl hover:scale-105 transition transform">
            <Image className="w-16 h-16 text-white mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Galeria Live</h3>
            <p className="text-purple-100 mb-6">
              Zobacz wszystkie zdjęcia
            </p>
            <Link 
              href="/gallery"
              className="inline-block bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition"
            >
              → Zobacz galerię →
            </Link>
          </div>

          {/* 3. Pobierz - ZIELONY */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 shadow-2xl hover:scale-105 transition transform">
            <Download className="w-16 h-16 text-white mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Pobierz</h3>
            <p className="text-green-100 mb-6">
              Zapisz wszystkie zdjęcia
            </p>
            <Link 
              href="/download"
              className="inline-block bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition"
            >
              → Panel pobierania →
            </Link>
          </div>

          {/* 4. Admin - SZARY */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-8 shadow-2xl hover:scale-105 transition transform">
            <BarChart3 className="w-16 h-16 text-white mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Admin</h3>
            <p className="text-gray-300 mb-6">
              Panel administratora
            </p>
            <Link 
              href="/admin"
              className="inline-block bg-white text-gray-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
            >
              → Admin Panel →
            </Link>
          </div>

        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <p className="text-white/80 text-sm">
            Limit: 20 zdjęć na osobę
          </p>
          <p className="text-white/60 text-sm mt-2">
            Użyj przycisków głośności do robienia zdjęć
          </p>
        </div>
      </div>
    </main>
  )
}
