// Tipos gerados manualmente - schema simplificado
// Para gerar automaticamente: npx supabase login && npx supabase gen types typescript --project-id "zczfutmymobgypbbamme" --schema public > src/types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          role: 'visitor' | 'participant' | 'mentor' | 'company' | 'startup' | 'admin' | 'staff';
          avatar: string | null;
          email_verified: boolean;
          phone_verified: boolean;
          two_factor_enabled?: boolean;
          two_factor_secret?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone?: string | null;
          role?: 'visitor' | 'participant' | 'mentor' | 'company' | 'startup' | 'admin' | 'staff';
          avatar?: string | null;
          email_verified?: boolean;
          phone_verified?: boolean;
          two_factor_enabled?: boolean;
          two_factor_secret?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          role?: 'visitor' | 'participant' | 'mentor' | 'company' | 'startup' | 'admin' | 'staff';
          avatar?: string | null;
          email_verified?: boolean;
          phone_verified?: boolean;
          two_factor_enabled?: boolean;
          two_factor_secret?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          slug: string;
          type: 'growth_summit' | 'growth_experience' | 'growth_conference' | 'growth_festival';
          description: string;
          short_description: string | null;
          location: string;
          city: string;
          state: string;
          country: string;
          address: string | null;
          start_date: string;
          end_date: string;
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          banner: string | null;
          logo: string | null;
          primary_color: string;
          secondary_color: string;
          max_registrations: number | null;
          max_mentors: number | null;
          max_startups: number | null;
          max_companies: number | null;
          enable_b2b: boolean;
          enable_mentoring: boolean;
          enable_startups: boolean;
          enable_check_in: boolean;
          ticket_price_standard: number;
          ticket_price_pro: number;
          ticket_price_vip: number;
          target_registrations: number;
          target_revenue: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          type: 'growth_summit' | 'growth_experience' | 'growth_conference' | 'growth_festival';
          description: string;
          short_description?: string | null;
          location: string;
          city: string;
          state: string;
          country?: string;
          address?: string | null;
          start_date: string;
          end_date: string;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          banner?: string | null;
          logo?: string | null;
          primary_color?: string;
          secondary_color?: string;
          max_registrations?: number | null;
          max_mentors?: number | null;
          max_startups?: number | null;
          max_companies?: number | null;
          enable_b2b?: boolean;
          enable_mentoring?: boolean;
          enable_startups?: boolean;
          enable_check_in?: boolean;
          ticket_price_standard?: number;
          ticket_price_pro?: number;
          ticket_price_vip?: number;
          target_registrations?: number;
          target_revenue?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          type?: 'growth_summit' | 'growth_experience' | 'growth_conference' | 'growth_festival';
          description?: string;
          short_description?: string | null;
          location?: string;
          city?: string;
          state?: string;
          country?: string;
          address?: string | null;
          start_date?: string;
          end_date?: string;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          banner?: string | null;
          logo?: string | null;
          primary_color?: string;
          secondary_color?: string;
          max_registrations?: number | null;
          max_mentors?: number | null;
          max_startups?: number | null;
          max_companies?: number | null;
          enable_b2b?: boolean;
          enable_mentoring?: boolean;
          enable_startups?: boolean;
          enable_check_in?: boolean;
          ticket_price_standard?: number;
          ticket_price_pro?: number;
          ticket_price_vip?: number;
          target_registrations?: number;
          target_revenue?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          ticket_type: 'standard' | 'pro' | 'vip';
          status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'expired';
          ticket_number: string | null;
          qr_code: string | null;
          qr_code_data: string | null;
          amount: number;
          discount_amount: number;
          final_amount: number;
          payment_method: 'credit_card' | 'pix' | 'boleto' | 'transfer' | 'cash' | null;
          payment_provider: 'stripe' | 'pagarme' | 'mercadopago' | 'manual' | null;
          payment_provider_id: string | null;
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          payment_date: string | null;
          payment_metadata: Json | null;
          checked_in: boolean;
          check_in_at: string | null;
          check_in_location: string | null;
          check_in_by: string | null;
          check_in_count: number;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          ticket_type: 'standard' | 'pro' | 'vip';
          status?: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'expired';
          ticket_number?: string | null;
          qr_code?: string | null;
          qr_code_data?: string | null;
          amount: number;
          discount_amount?: number;
          final_amount: number;
          payment_method?: 'credit_card' | 'pix' | 'boleto' | 'transfer' | 'cash' | null;
          payment_provider?: 'stripe' | 'pagarme' | 'mercadopago' | 'manual' | null;
          payment_provider_id?: string | null;
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          payment_date?: string | null;
          payment_metadata?: Json | null;
          checked_in?: boolean;
          check_in_at?: string | null;
          check_in_location?: string | null;
          check_in_by?: string | null;
          check_in_count?: number;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          ticket_type?: 'standard' | 'pro' | 'vip';
          status?: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'expired';
          ticket_number?: string | null;
          qr_code?: string | null;
          qr_code_data?: string | null;
          amount?: number;
          discount_amount?: number;
          final_amount?: number;
          payment_method?: 'credit_card' | 'pix' | 'boleto' | 'transfer' | 'cash' | null;
          payment_provider?: 'stripe' | 'pagarme' | 'mercadopago' | 'manual' | null;
          payment_provider_id?: string | null;
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          payment_date?: string | null;
          payment_metadata?: Json | null;
          checked_in?: boolean;
          check_in_at?: string | null;
          check_in_location?: string | null;
          check_in_by?: string | null;
          check_in_count?: number;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Tabelas adicionais referenciadas no código (adicionar conforme necessário)
      inscricoes_growth_experience_triunfo: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      inscricoes_growth_experience: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      pagamentos_stripe: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      audit_logs: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      security_suspicious_logins: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      security_user_activity: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      active_sessions: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      login_attempts: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      startups_arena_pitch: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      // Outras tabelas do schema
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Tipos auxiliares
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Tipos específicos
export type User = Tables<'users'>;
export type Project = Tables<'projects'>;
export type Registration = Tables<'registrations'>;
