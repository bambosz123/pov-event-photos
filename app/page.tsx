'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Camera, Image, Download, Settings, Sparkles, ChevronRight, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'


export default function HomePage() {
  const [eventName, setEventName] = useState('')
  const [photoCount, setPhotoCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)


  useEffect(() => {
    loadActiveEvent()
    setTimeout(() => setMounted(true), 100)
  }, [])


  const loadActiveEvent = async () => {
    setLoading(true)
    
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .single()


    if (eventData) {
      setEventName(eventData.name)
      
      const { count } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventData.id)
      
      setPhotoCount(count || 0)
    }
    
    setLoading(false)
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-[3px] border-slate-700/30 rounded-full"></div>
          <div className="absolute inset-0 w-20 h-20 border-[3px] border-transparent border-t-slate-300 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-[3px] border-slate-400/20 rounded-full blur-md"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-gradient-to-br from-slate-400/8 to-transparent rounded-full blur-[100px] animate-float"></div>
        <div className="absolute top-[60%] right-[10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-400/6 to-transparent rounded-full blur-[120px] animate-float-delayed"></div>
        <div className="absolute bottom-[20%] left-[40%] w-[400px] h-[400px] bg-gradient-to-br from-slate-300/5 to-transparent rounded-full blur-[80px] animate-float-slow"></div>
        
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-slate-400 rounded-full opacity-30 animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Premium grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(203,213,225,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(203,213,225,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>

      {/* Przycisk Admin - TYLKO IKONA */}
<div className={`absolute top-4 right-4 z-50 transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
  <Link href="/admin">
    <button className="bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600/80 backdrop-blur-xl text-white p-3.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 border border-slate-600/50">
      <Settings className="w-5 h-5 text-white" strokeWidth={2.5} />
    </button>
  </Link>
</div>

      {/* Główna zawartość */}
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-2xl w-full">
          
          {/* Logo i nagłówek - Animowany */}
          <div className={`text-center mb-12 sm:mb-16 transition-all duration-1000 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            
            {/* Logo container z efektami */}
            {/* Logo container z efektami */}
<div className="inline-block mb-6 sm:mb-8 relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-slate-400/20 via-blue-400/15 to-slate-400/20 blur-[60px] rounded-full group-hover:blur-[80px] transition-all duration-1000 animate-pulse-slow"></div>
  
  <div className="relative bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-slate-600/60 shadow-[0_16px_64px_rgba(15,23,42,0.8)] group-hover:shadow-[0_24px_80px_rgba(100,116,139,0.4)] transition-all duration-700 group-hover:scale-105">
    <div className="absolute inset-2 bg-gradient-to-br from-slate-700/20 to-transparent rounded-[28px]"></div>
    
    {/* TWOJE LOGO */}
    <img 
      src="/logo.png" 
      alt="Logo Studniówki" 
      className="w-24 h-24 sm:w-32 sm:h-32 relative z-10 object-contain drop-shadow-[0_8px_24px_rgba(255,255,255,0.2)] transition-transform group-hover:scale-110 duration-500"
    />
    
    <div className="absolute -inset-4 border border-slate-600/20 rounded-[40px] group-hover:scale-110 transition-transform duration-700"></div>
    <div className="absolute -inset-6 border border-slate-600/10 rounded-[48px] group-hover:scale-125 transition-transform duration-1000"></div>
  </div>
</div>

            
            {/* Tytuł z animowanym gradientem */}
            <div className="relative mb-6 sm:mb-8">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extralight text-white mb-3 sm:mb-4 tracking-tight leading-tight drop-shadow-[0_2px_20px_rgba(255,255,255,0.1)]"
                  style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive" }}>
                2026
              </h1>

              <div className="relative inline-block">
                <h2 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-none bg-gradient-to-r from-slate-100 via-white to-slate-200 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(255,255,255,0.2)] animate-gradient-x">
                  Studniówka
                </h2>
                <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-slate-300/10 to-transparent blur-xl"></div>
              </div>
            </div>
            
            {/* Separator z gwiazdką */}
            <div className="flex items-center justify-center gap-4 mb-5 sm:mb-6">
              <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-slate-400/60 to-transparent"></div>
              <div className="relative">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 fill-slate-300 animate-spin-slow drop-shadow-[0_2px_8px_rgba(226,232,240,0.5)]" />
                <div className="absolute inset-0 bg-slate-300 blur-md opacity-50"></div>
              </div>
              <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-slate-400/60 to-transparent"></div>
            </div>
            
            {/* Subtitle */}
            <p className="text-slate-400 text-base sm:text-lg font-light tracking-[0.3em] uppercase mb-4 sm:mb-5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
               Galeria Najlepszych Momentów
            </p>
            
            {/* Stats badge */}
            {photoCount > 0 && (
              <div className="inline-block bg-gradient-to-r from-slate-800/60 via-slate-700/60 to-slate-800/60 backdrop-blur-xl px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-slate-600/50 shadow-[0_4px_24px_rgba(15,23,42,0.6)]">
                <p className="text-slate-200 text-xs sm:text-sm font-semibold tracking-[0.2em] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
                  {photoCount} {photoCount === 1 ? 'PHOTO' : 'ZDJĘĆ'} ZACHOWANYCH
                </p>
              </div>
            )}
          </div>

          {/* Menu buttons - Mobile optimized */}
          <div className="space-y-4 sm:space-y-5">
            
            {/* Aparat - Navy Premium */}
            <Link href="/camera">
              <div className={`group relative transition-all duration-700 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/15 to-blue-600/20 rounded-[28px] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                
                <div className="relative bg-gradient-to-br from-slate-800/70 via-slate-900/70 to-slate-800/70 backdrop-blur-2xl rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 lg:p-7 border border-slate-600/50 group-hover:border-slate-500/70 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer overflow-hidden shadow-[0_8px_32px_rgba(15,23,42,0.6)] group-hover:shadow-[0_16px_48px_rgba(30,58,138,0.3)]">
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative flex items-center gap-4 sm:gap-6">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 blur-xl opacity-60"></div>
                      <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 p-3.5 sm:p-4 lg:p-5 rounded-[18px] sm:rounded-[20px] shadow-[0_8px_24px_rgba(30,58,138,0.4)] group-hover:shadow-[0_12px_32px_rgba(37,99,235,0.5)] transition-all duration-500">
                        <Camera className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-1 tracking-wide truncate">Zrób Fote!</h2>
                      <p className="text-slate-400 text-sm sm:text-base font-light tracking-wide truncate">Otwórz kamerę i twórz wspomnienia</p>
                    </div>
                    
                    <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-slate-300 group-hover:translate-x-1 transition-transform duration-300 shrink-0" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </Link>

            {/* Galeria - Silver Premium */}
            <Link href="/gallery">
              <div className={`group relative transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-500/20 via-slate-400/15 to-slate-500/20 rounded-[28px] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                
                <div className="relative bg-gradient-to-br from-slate-800/70 via-slate-900/70 to-slate-800/70 backdrop-blur-2xl rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 lg:p-7 border border-slate-600/50 group-hover:border-slate-400/70 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer overflow-hidden shadow-[0_8px_32px_rgba(15,23,42,0.6)] group-hover:shadow-[0_16px_48px_rgba(100,116,139,0.4)]">
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative flex items-center gap-4 sm:gap-6">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-700 blur-xl opacity-60"></div>
                      <div className="relative bg-gradient-to-br from-slate-500 to-slate-700 p-3.5 sm:p-4 lg:p-5 rounded-[18px] sm:rounded-[20px] shadow-[0_8px_24px_rgba(100,116,139,0.4)] group-hover:shadow-[0_12px_32px_rgba(148,163,184,0.5)] transition-all duration-500">
                        <Image className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-1 tracking-wide truncate">Galeria</h2>
                      <p className="text-slate-400 text-sm sm:text-base font-light tracking-wide truncate">Przeglądaj zdjęcia</p>
                    </div>
                    
                    <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-slate-300 group-hover:translate-x-1 transition-transform duration-300 shrink-0" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </Link>

            {/* Pobierz - White Accent Premium */}
            <Link href="/download">
              <div className={`group relative transition-all duration-700 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-300/15 via-white/10 to-slate-300/15 rounded-[28px] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                
                <div className="relative bg-gradient-to-br from-slate-800/70 via-slate-900/70 to-slate-800/70 backdrop-blur-2xl rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 lg:p-7 border border-slate-600/50 group-hover:border-slate-300/60 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer overflow-hidden shadow-[0_8px_32px_rgba(15,23,42,0.6)] group-hover:shadow-[0_16px_48px_rgba(203,213,225,0.3)]">
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative flex items-center gap-4 sm:gap-6">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-600 blur-xl opacity-60"></div>
                      <div className="relative bg-gradient-to-br from-slate-400 to-slate-600 p-3.5 sm:p-4 lg:p-5 rounded-[18px] sm:rounded-[20px] shadow-[0_8px_24px_rgba(148,163,184,0.4)] group-hover:shadow-[0_12px_32px_rgba(203,213,225,0.5)] transition-all duration-500">
                        <Download className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-1 tracking-wide truncate">Pobierz Zdjęcia</h2>
                      <p className="text-slate-400 text-sm sm:text-base font-light tracking-wide truncate">Zapisz te wspomnienia na zawsze</p>
                    </div>
                    
                    <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-slate-300 group-hover:translate-x-1 transition-transform duration-300 shrink-0" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Stopka */}
          <div className={`text-center mt-10 sm:mt-14 transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="inline-block px-4 sm:px-6 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-slate-700/50 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <p className="text-slate-500 text-[10px] sm:text-xs font-light tracking-[0.3em] uppercase">
                Miłej zabawy!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@300;400;700&display=swap');
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, -10px) scale(1.05); }
          50% { transform: translate(-5px, 5px) scale(0.95); }
          75% { transform: translate(-10px, -5px) scale(1.02); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-15px, 10px) scale(1.08); }
          66% { transform: translate(5px, -15px) scale(0.92); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8px, 8px) scale(1.1); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 18s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        button, a {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  )
}
