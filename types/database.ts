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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trips: {
        Row: {
          id: string
          owner_id: string
          name: string
          destination: string
          cover_image_url: string | null
          emoji: string | null
          start_date: string | null
          end_date: string | null
          total_budget: number
          currency: string
          is_public: boolean
          status: 'planning' | 'active' | 'completed' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          destination: string
          cover_image_url?: string | null
          emoji?: string | null
          start_date?: string | null
          end_date?: string | null
          total_budget?: number
          currency?: string
          is_public?: boolean
          status?: 'planning' | 'active' | 'completed' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          destination?: string
          cover_image_url?: string | null
          emoji?: string | null
          start_date?: string | null
          end_date?: string | null
          total_budget?: number
          currency?: string
          is_public?: boolean
          status?: 'planning' | 'active' | 'completed' | 'archived'
          updated_at?: string
        }
        Relationships: []
      }
      trip_members: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          role: 'owner' | 'member'
          target_amount: number | null
          joined_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          role?: 'owner' | 'member'
          target_amount?: number | null
          joined_at?: string
        }
        Update: {
          role?: 'owner' | 'member'
          target_amount?: number | null
        }
        Relationships: []
      }
      trip_items: {
        Row: {
          id: string
          trip_id: string
          created_by: string
          name: string
          category: 'flight' | 'hotel' | 'transport' | 'food' | 'activity' | 'shopping' | 'insurance' | 'other'
          amount: number
          paid_amount: number
          image_url: string | null
          external_url: string | null
          description: string | null
          priority: number
          quantity: number
          split_equally: boolean
          item_date: string | null
          status: 'pending' | 'partial' | 'paid'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          created_by: string
          name: string
          category?: 'flight' | 'hotel' | 'transport' | 'food' | 'activity' | 'shopping' | 'insurance' | 'other'
          amount?: number
          paid_amount?: number
          image_url?: string | null
          external_url?: string | null
          description?: string | null
          priority?: number
          quantity?: number
          split_equally?: boolean
          item_date?: string | null
          status?: 'pending' | 'partial' | 'paid'
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          category?: 'flight' | 'hotel' | 'transport' | 'food' | 'activity' | 'shopping' | 'insurance' | 'other'
          amount?: number
          paid_amount?: number
          image_url?: string | null
          external_url?: string | null
          description?: string | null
          priority?: number
          quantity?: number
          split_equally?: boolean
          item_date?: string | null
          status?: 'pending' | 'partial' | 'paid'
          updated_at?: string
        }
        Relationships: []
      }
      item_splits: {
        Row: {
          id: string
          item_id: string
          user_id: string
          amount: number
        }
        Insert: {
          id?: string
          item_id: string
          user_id: string
          amount?: number
        }
        Update: {
          amount?: number
        }
        Relationships: []
      }
      contributions: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          item_id: string | null
          amount: number
          status: 'pending' | 'processing' | 'approved' | 'failed' | 'refunded'
          order_nsu: string | null
          transaction_nsu: string | null
          payment_url: string | null
          created_at: string
          confirmed_at: string | null
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          item_id?: string | null
          amount: number
          status?: 'pending' | 'processing' | 'approved' | 'failed' | 'refunded'
          order_nsu?: string | null
          transaction_nsu?: string | null
          payment_url?: string | null
          created_at?: string
          confirmed_at?: string | null
        }
        Update: {
          item_id?: string | null
          amount?: number
          status?: 'pending' | 'processing' | 'approved' | 'failed' | 'refunded'
          order_nsu?: string | null
          transaction_nsu?: string | null
          payment_url?: string | null
          confirmed_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          contribution_id: string
          amount: number
          payment_method: string | null
          status: string
          receipt_url: string | null
          gateway_response: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          contribution_id: string
          amount: number
          payment_method?: string | null
          status: string
          receipt_url?: string | null
          gateway_response?: Json | null
          created_at?: string
        }
        Update: {
          payment_method?: string | null
          status?: string
          receipt_url?: string | null
          gateway_response?: Json | null
        }
        Relationships: []
      }
      trip_invites: {
        Row: {
          id: string
          trip_id: string
          invited_email: string
          invited_by: string
          token: string
          target_amount: number | null
          accepted: boolean
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          invited_email: string
          invited_by: string
          token?: string
          target_amount?: number | null
          accepted?: boolean
          created_at?: string
          expires_at?: string
        }
        Update: {
          accepted?: boolean
        }
        Relationships: []
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          trip_id: string | null
          type: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_id?: string | null
          type: string
          unlocked_at?: string
        }
        Update: never
        Relationships: []
      }
    }
    Views: {
      member_progress: {
        Row: {
          trip_id: string | null
          user_id: string | null
          full_name: string | null
          avatar_url: string | null
          target_amount: number | null
          contributed_amount: number | null
          progress_pct: number | null
        }
        Relationships: []
      }
      trip_summary: {
        Row: {
          trip_id: string | null
          name: string | null
          destination: string | null
          total_budget: number | null
          start_date: string | null
          end_date: string | null
          status: string | null
          cover_image_url: string | null
          emoji: string | null
          total_contributed: number | null
          progress_pct: number | null
          member_count: number | null
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
