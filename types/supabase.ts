export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      itineraries: {
        Row: {
          id: string
          title: string | null
          image: string | null
          start_date: string | null
          end_date: string | null
          days: Json | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title?: string | null
          image?: string | null
          start_date?: string | null
          end_date?: string | null
          days?: Json | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string | null
          image?: string | null
          start_date?: string | null
          end_date?: string | null
          days?: Json | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          image: string
          price_range: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image: string
          price_range: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image?: string
          price_range?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          spot_id: string
          user_name: string
          user_avatar: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          spot_id: string
          user_name: string
          user_avatar?: string
          rating: number
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          spot_id?: string
          user_name?: string
          user_avatar?: string
          rating?: number
          comment?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          name: string
          city: string
          website: string | null
          about: string
          joined_year: number
          contributions: number
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          city: string
          website?: string | null
          about: string
          joined_year?: number
          contributions?: number
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          website?: string | null
          about?: string
          joined_year?: number
          contributions?: number
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
