import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Photo {
  id: string
  event_id: string
  table_id: string | null
  storage_path: string
  thumbnail_path: string | null
  reactions: {
    heart: number
    fire: number
    laugh: number
    clap: number
  }
  views: number
  device_id: string | null
  uploaded_at: string
}

export interface Event {
  id: string
  name: string
  date: string | null
  logo_url: string | null
  watermark_text: string | null
  max_photos_per_device: number
  auto_delete_days: number
  is_active: boolean
  created_at: string
  updated_at: string
}
