'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Calendar,
  Users,
  Image as ImageIcon,
  Settings,
  Shield,
  Activity,
  TrendingUp,
  X,
  Check,
  Star,
  Sparkles
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Event {
  id: string
  name: string
  date: string
  is_active: boolean
  created_at: string
}

interface Stats {
  totalPhotos: number
  totalEvents: number
  activeEvent: string
  todayPhotos: number
}

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<Stats>({ totalPhotos: 0, totalEvents: 0, activeEvent: '', todayPhotos: 0 })
  const [newEventName, setNewEventName] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDate, setEditDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadEvents()
    loadStats()
    setTimeout(() => setMounted(true), 100)
  }, [])

  const loadStats = async () => {
    const { count: photosCount } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })

    const { data: activeEvent } = await supabase
      .from('events')
      .select('name')
      .eq('is_active', true)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const { count: todayCount } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .gte('uploaded_at', today)

    setStats({
      totalPhotos: photosCount || 0,
      totalEvents: events.length,
      activeEvent: activeEvent?.name || 'None',
      todayPhotos: todayCount || 0
    })
  }

  const loadEvents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading events:', error)
    } else {
      setEvents(data || [])
      setStats(prev => ({ ...prev, totalEvents: data?.length || 0 }))
    }
    setLoading(false)
  }

  const createEvent = async () => {
    if (!newEventName.trim() || !newEventDate) return

    const { error } = await supabase
      .from('events')
      .insert({ name: newEventName, date: newEventDate, is_active: false })

    if (error) {
      alert('Error creating event')
    } else {
      setNewEventName('')
      setNewEventDate('')
      loadEvents()
      loadStats()
    }
  }

  const updateEvent = async (id: string) => {
    const { error } = await supabase
      .from('events')
      .update({ name: editName, date: editDate })
      .eq('id', id)

    if (error) {
      alert('Error updating event')
    } else {
      setEditingId(null)
      loadEvents()
    }
  }

  const deleteEvent = async (id: string) => {
    if (confirm('Delete this event? All photos will be removed.')) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) {
        alert('Error deleting event')
      } else {
        loadEvents()
        loadStats()
      }
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    if (!currentActive) {
      await supabase
        .from('events')
        .update({ is_active: false })
        .neq('id', id)
    }

    const { error } = await supabase
      .from('events')
      .update({ is_active: !currentActive })
      .eq('id', id)

    if (error) {
      alert('Error updating event')
    } else {
      loadEvents()
      loadStats()
    }
  }

  const startEdit = (event: Event) => {
    setEditingId(event.id)
    setEditName(event.name)
    setEditDate(event.date)
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
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-gradient-to-br from-slate-400/6 to-transparent rounded-full blur-[100px] animate-float"></div>
        <div className="absolute bottom-[20%] right-[15%] w-[600px] h-[600px] bg-gradient-to-br from-blue-400/5 to-transparent rounded-full blur-[120px] animate-float-delayed"></div>
        
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-slate-400 rounded-full opacity-20 animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(203,213,225,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(203,213,225,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Header Ultra Premium */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-2xl border-b border-slate-700/50 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <button 
                onClick={() => router.push('/')} 
                className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 hover:from-slate-700/90 hover:to-slate-800/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-600/50 transition-all duration-300 active:scale-95 shadow-lg shrink-0"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-200 group-hover:-translate-x-0.5 transition-transform duration-300" strokeWidth={2} />
              </button>
              
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-slate-600 blur-lg opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-slate-600 to-slate-700 p-2 sm:p-2.5 rounded-xl">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white tracking-wide flex items-center gap-2 truncate">
                    <span className="truncate">Admin Panel</span>
                    <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-slate-700/50 text-slate-300 rounded-full font-medium tracking-wider border border-slate-600/50 whitespace-nowrap shrink-0">
                      PRO
                    </span>
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm tracking-wide mt-0.5 hidden sm:block">Manage events and monitor activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zawartość */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        
        {/* Stats Dashboard - Mobile optimized */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-10 lg:mb-12 transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          
          {/* Total Photos */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/15 to-blue-700/10 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-600/40 group-hover:border-blue-600/50 transition-all duration-500 shadow-[0_8px_32px_rgba(15,23,42,0.4)]">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2 sm:p-2.5 lg:p-3 rounded-xl shadow-lg shadow-blue-900/50">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" strokeWidth={2} />
                </div>
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" strokeWidth={2} />
              </div>
              <h3 className="text-slate-400 text-[10px] sm:text-xs font-medium tracking-wider mb-1 sm:mb-2">TOTAL PHOTOS</h3>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{stats.totalPhotos}</p>
            </div>
          </div>

          {/* Total Events */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/15 to-slate-600/10 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-600/40 group-hover:border-slate-500/50 transition-all duration-500 shadow-[0_8px_32px_rgba(15,23,42,0.4)]">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-slate-500 to-slate-700 p-2 sm:p-2.5 lg:p-3 rounded-xl shadow-lg shadow-slate-900/50">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" strokeWidth={2} />
                </div>
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" strokeWidth={2} />
              </div>
              <h3 className="text-slate-400 text-[10px] sm:text-xs font-medium tracking-wider mb-1 sm:mb-2">TOTAL EVENTS</h3>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{stats.totalEvents}</p>
            </div>
          </div>

          {/* Active Event */}
          <div className="group relative col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-400/15 to-slate-500/10 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-600/40 group-hover:border-slate-400/50 transition-all duration-500 shadow-[0_8px_32px_rgba(15,23,42,0.4)]">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-slate-400 to-slate-600 p-2 sm:p-2.5 lg:p-3 rounded-xl shadow-lg shadow-slate-900/50">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" strokeWidth={2} />
                </div>
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 animate-pulse" strokeWidth={2} />
              </div>
              <h3 className="text-slate-400 text-[10px] sm:text-xs font-medium tracking-wider mb-1 sm:mb-2">ACTIVE EVENT</h3>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-white truncate">{stats.activeEvent}</p>
            </div>
          </div>

          {/* Today's Photos */}
          <div className="group relative col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-slate-500/10 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-600/40 group-hover:border-blue-500/50 transition-all duration-500 shadow-[0_8px_32px_rgba(15,23,42,0.4)]">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-slate-600 p-2 sm:p-2.5 lg:p-3 rounded-xl shadow-lg shadow-slate-900/50">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" strokeWidth={2} />
                </div>
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" strokeWidth={2} />
              </div>
              <h3 className="text-slate-400 text-[10px] sm:text-xs font-medium tracking-wider mb-1 sm:mb-2">TODAY'S PHOTOS</h3>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{stats.todayPhotos}</p>
            </div>
          </div>
        </div>

        {/* Create New Event - Mobile optimized */}
        <div className={`mb-8 sm:mb-10 lg:mb-12 transition-all duration-700 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-blue-500/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 border border-slate-600/40 shadow-[0_8px_32px_rgba(15,23,42,0.4)]">
              
              <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
                <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-2 sm:p-2.5 rounded-xl shadow-lg">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white tracking-wide">Create New Event</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <input
                  type="text"
                  placeholder="Event name..."
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="bg-slate-800/50 border border-slate-600/50 text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl focus:outline-none focus:border-slate-400/70 focus:ring-2 focus:ring-slate-400/20 transition-all duration-300 placeholder:text-slate-500 text-sm sm:text-base"
                />
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="bg-slate-800/50 border border-slate-600/50 text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl focus:outline-none focus:border-slate-400/70 focus:ring-2 focus:ring-slate-400/20 transition-all duration-300 text-sm sm:text-base"
                />
                <button
                  onClick={createEvent}
                  className="group/btn relative bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(100,116,139,0.3)] hover:shadow-[0_0_40px_rgba(148,163,184,0.5)] transition-all duration-500 active:scale-95 text-sm sm:text-base min-h-[48px]"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                  <span>Create Event</span>
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className={`transition-all duration-700 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" strokeWidth={2} />
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-wide">All Events</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-700/50 to-transparent"></div>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-block bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 backdrop-blur-2xl p-10 sm:p-12 rounded-[32px] border border-slate-600/50 mb-5 sm:mb-6 shadow-[0_16px_64px_rgba(15,23,42,0.6)]">
                <Calendar className="w-16 h-16 sm:w-20 sm:h-20 text-slate-600 mx-auto" strokeWidth={1.3} />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">No events yet</h3>
              <p className="text-slate-400 text-sm sm:text-base">Create your first event to get started</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {events.map((event, index) => (
                <div 
                  key={event.id} 
                  className="group relative"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.5s ease-out'
                  }}
                >
                  <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl blur-xl transition-all duration-500 ${
                    event.is_active 
                      ? 'bg-gradient-to-r from-slate-400/20 to-blue-400/15' 
                      : 'bg-gradient-to-r from-slate-600/10 to-slate-700/10'
                  }`}></div>
                  
                  <div className={`relative bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border transition-all duration-500 shadow-[0_8px_32px_rgba(15,23,42,0.4)] ${
                    event.is_active 
                      ? 'border-slate-400/60 shadow-[0_12px_48px_rgba(100,116,139,0.3)]' 
                      : 'border-slate-600/40 group-hover:border-slate-500/50'
                  }`}>
                    
                    {editingId === event.id ? (
                      // Edit Mode - Mobile optimized
                      <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-800/50 border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-slate-400/70 text-sm sm:text-base"
                        />
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full bg-slate-800/50 border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-slate-400/70 text-sm sm:text-base"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateEvent(event.id)}
                            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
                          >
                            <Check className="w-4 h-4" strokeWidth={2.5} />
                            <span className="text-sm">Save</span>
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
                          >
                            <X className="w-4 h-4" strokeWidth={2.5} />
                            <span className="text-sm">Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode - Mobile optimized
                      <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-1 min-w-0">
                          <button
                            onClick={() => toggleActive(event.id, event.is_active)}
                            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-500 shrink-0 active:scale-95 ${
                              event.is_active
                                ? 'bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg shadow-slate-500/50'
                                : 'bg-slate-800/50 hover:bg-slate-700/50'
                            }`}
                          >
                            {event.is_active ? (
                              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                            ) : (
                              <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" strokeWidth={2} />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white truncate">{event.name}</h3>
                              {event.is_active && (
                                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-slate-600/30 text-slate-200 rounded-full text-[10px] sm:text-xs font-medium tracking-wider border border-slate-500/30 animate-pulse whitespace-nowrap shrink-0">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={2} />
                              <span className="truncate">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => startEdit(event)}
                            className="bg-slate-800/50 hover:bg-slate-700/50 text-white p-2.5 sm:p-3 rounded-xl transition-all duration-300 group/btn active:scale-95 min-w-[44px]"
                          >
                            <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:rotate-12 transition-transform duration-300" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="bg-red-900/30 hover:bg-red-900/50 text-red-400 p-2.5 sm:p-3 rounded-xl transition-all duration-300 group/btn active:scale-95 min-w-[44px]"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform duration-300" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
