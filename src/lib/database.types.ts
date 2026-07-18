export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      canteens: {
        Row: {
          id: string
          slug: string
          name: string
          location: string
          open_from: string | null
          open_until: string | null
          prep_minutes: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          location?: string
          open_from?: string | null
          open_until?: string | null
          prep_minutes?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          name?: string
          location?: string
          open_from?: string | null
          open_until?: string | null
          prep_minutes?: number
          active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      canteen_staff: {
        Row: {
          canteen_id: string
          profile_id: string
          role: 'employee' | 'manager'
          created_at: string
        }
        Insert: {
          canteen_id: string
          profile_id: string
          role: 'employee' | 'manager'
          created_at?: string
        }
        Update: {
          role?: 'employee' | 'manager'
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          student_ra: string | null
          cpf: string | null
          role: 'customer' | 'employee' | 'manager' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          student_ra?: string | null
          cpf?: string | null
          role?: 'customer' | 'employee' | 'manager' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          email?: string
          student_ra?: string | null
          cpf?: string | null
          role?: 'customer' | 'employee' | 'manager' | 'admin'
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          category: 'lanche' | 'bebida' | 'fruta' | 'combo'
          price_cents: number
          preparation_minutes: number
          sustainability_score: number
          active: boolean
          canteen_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: 'lanche' | 'bebida' | 'fruta' | 'combo'
          price_cents: number
          preparation_minutes?: number
          sustainability_score?: number
          active?: boolean
          canteen_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string
          category?: 'lanche' | 'bebida' | 'fruta' | 'combo'
          price_cents?: number
          preparation_minutes?: number
          sustainability_score?: number
          active?: boolean
          canteen_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          quantity: number
          reserved: number
          reorder_point: number
          expires_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity?: number
          reserved?: number
          reorder_point?: number
          expires_at?: string | null
          updated_at?: string
        }
        Update: {
          quantity?: number
          reserved?: number
          reorder_point?: number
          expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          customer_name: string
          status: 'draft' | 'submitted' | 'queued' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          pickup_time: string
          pickup_code: string
          total_cents: number
          payment_method: 'pix' | 'card' | 'cash'
          payment_status: 'pending' | 'approved' | 'refused' | 'refunded'
          canteen_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          customer_name: string
          status?: 'draft' | 'submitted' | 'queued' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          pickup_time: string
          pickup_code: string
          total_cents: number
          payment_method: 'pix' | 'card' | 'cash'
          payment_status?: 'pending' | 'approved' | 'refused' | 'refunded'
          canteen_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'draft' | 'submitted' | 'queued' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'approved' | 'refused' | 'refunded'
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          unit_price_cents: number
          quantity: number
          total_cents: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          unit_price_cents: number
          quantity: number
          total_cents: number
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          order_id: string
          method: 'pix' | 'card' | 'cash'
          status: 'pending' | 'approved' | 'refused' | 'refunded'
          amount_cents: number
          provider_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          method: 'pix' | 'card' | 'cash'
          status?: 'pending' | 'approved' | 'refused' | 'refunded'
          amount_cents: number
          provider_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'approved' | 'refused' | 'refunded'
          provider_reference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          actor_id: string | null
          movement_type: 'reserve' | 'consume' | 'release' | 'restock' | 'adjust'
          units: number
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          actor_id?: string | null
          movement_type: 'reserve' | 'consume' | 'release' | 'restock' | 'adjust'
          units: number
          reason: string
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      customer_preferences: {
        Row: {
          profile_id: string
          phone: string
          classroom: string
          shift: 'manha' | 'tarde' | 'noite'
          quick_pickup: boolean
          order_updates: boolean
          receipt_email: boolean
          default_pickup_time: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          phone?: string
          classroom?: string
          shift?: 'manha' | 'tarde' | 'noite'
          quick_pickup?: boolean
          order_updates?: boolean
          receipt_email?: boolean
          default_pickup_time?: string
          updated_at?: string
        }
        Update: {
          phone?: string
          classroom?: string
          shift?: 'manha' | 'tarde' | 'noite'
          quick_pickup?: boolean
          order_updates?: boolean
          receipt_email?: boolean
          default_pickup_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_payment_methods: {
        Row: {
          id: string
          profile_id: string
          method: 'pix' | 'card' | 'cash'
          label: string
          detail: string
          preferred: boolean
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          method: 'pix' | 'card' | 'cash'
          label: string
          detail: string
          preferred?: boolean
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          method?: 'pix' | 'card' | 'cash'
          label?: string
          detail?: string
          preferred?: boolean
          active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_stock: {
        Args: {
          p_product_id: string
          p_units: number
          p_reason?: string
        }
        Returns: {
          quantity: number
          reserved: number
        }[]
      }
      checkout: {
        Args: {
          p_items: Json
          p_pickup_time: string
          p_payment_method: 'pix' | 'card' | 'cash'
        }
        Returns: {
          order_id: string
          pickup_code: string
          total_cents: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
