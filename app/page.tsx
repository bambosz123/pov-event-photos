'use client'

import Link from 'next/link'
import { Camera, Image, Download } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center relative p-4">
      
      {/* PRZYCISK ADMIN W PRAWYM GÓRNYM ROGU */}
      <div className="absolute top-4 right-4 z-10">
        <Link 
          href="/admin"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow-lg"
        >
          🔐 Admin
        </Link>
      </div>

      {/* Main Content - WYŚRODKOWANY */}
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            📸Studniówka 2026
          
          </h2>
          <p className="text-xl text-white/90">
            Wspólna galeria dla wszystkich gości
          </p>
        </div>

        {/* 3 PRZYCISKI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Zrób zdjęcie - NIEBIESKI */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 shadow-2xl hover:scale-105 transition transform">
            <Camera className="w-16 h-16 text-white mb-4 mx-auto" />
            <h3 className="text-2xl font-bold text-white mb-2 text-center">Zrób zdjęcie</h3>
            <p className="text-blue-100 mb-6 text-center">
              Otwórz aparat i dodaj foty
            </p>
            <Link 
              href="/camera"
              className="block bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition text-center"
            >
              → Otwórz aparat →
            </Link>
          </div>

          {/* 2. Galeria Live - FIOLETOWY */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 shadow-2xl hover:scale-105 transition transform">
            <Image className="w-16 h-16 text-white mb-4 mx-auto" />
            <h3 className="text-2xl font-bold text-white mb-2 text-center">Galeria</h3>
            <p className="text-purple-100 mb-6 text-center">
              Zobacz wszystkie zdjęcia
            </p>
            <Link 
              href="/gallery"
              className="block bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition text-center"
            >
              → Zobacz galerię →
            </Link>
          </div>

          {/* 3. Pobierz - ZIELONY */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 shadow-2xl hover:scale-105 transition transform">
            <Download className="w-16 h-16 text-white mb-4 mx-auto" />
            <h3 className="text-2xl font-bold text-white mb-2 text-center">Pobierz</h3>
            <p className="text-green-100 mb-6 text-center">
              Zapisz wybrane zdjęcia
            </p>
            <Link 
              href="/download"
              className="block bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition text-center"
            >
              → Panel pobierania →
            </Link>
          </div>

        </div>

        {/* Bottom Info */}
        <div className="mt-8 text-center">
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
