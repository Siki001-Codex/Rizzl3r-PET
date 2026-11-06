import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://lgwaspsfeasdhoinnhou.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd2FzcHNmZWFzZGhvaW5uaG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4ODA4MTMsImV4cCI6MjEwOTQ1NjgxM30.Xe-BfbOvTwvg0FY1214Z2-0iquUk-jHSr2S8CBp35o4'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('http')
)

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

