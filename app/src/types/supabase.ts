export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      login_attempts: {
        Row: {
          id: string
          email: string
          ip_address: string | null
          success: boolean
          attempted_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          email: string
          ip_address?: string | null
          success: boolean
          attempted_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          ip_address?: string | null
          success?: boolean
          attempted_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "login_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      growth_experience_mentors: {
        Row: {
          id: string
          project_id: string
          user_id: string | null
          name: string
          email: string
          phone: string | null
          company: string | null
          role_title: string | null
          specialties: string[] | null
          tracks: string[] | null
          years_experience: number | null
          status: string
          max_mentorings: number | null
          photo_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id?: string | null
          name: string
          email: string
          phone?: string | null
          company?: string | null
          role_title?: string | null
          specialties?: string[] | null
          tracks?: string[] | null
          years_experience?: number | null
          status?: string
          max_mentorings?: number | null
          photo_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          company?: string | null
          role_title?: string | null
          specialties?: string[] | null
          tracks?: string[] | null
          years_experience?: number | null
          status?: string
          max_mentorings?: number | null
          photo_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_experience_mentors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_experience_mentors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          project_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          project_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          project_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_meetings: {
        Row: {
          accepted_by: string | null
          company_anchor_id: string
          company_vendor_id: string
          created_at: string | null
          deal_closed: boolean | null
          deal_value: number | null
          duration: number | null
          follow_up: boolean | null
          follow_up_notes: string | null
          id: string
          interest_level: string | null
          location: string | null
          notes: string | null
          project_id: string
          requested_by: string
          scheduled_at: string
          status: string
          table_number: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_by?: string | null
          company_anchor_id: string
          company_vendor_id: string
          created_at?: string | null
          deal_closed?: boolean | null
          deal_value?: number | null
          duration?: number | null
          follow_up?: boolean | null
          follow_up_notes?: string | null
          id?: string
          interest_level?: string | null
          location?: string | null
          notes?: string | null
          project_id: string
          requested_by: string
          scheduled_at: string
          status?: string
          table_number?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_by?: string | null
          company_anchor_id?: string
          company_vendor_id?: string
          created_at?: string | null
          deal_closed?: boolean | null
          deal_value?: number | null
          duration?: number | null
          follow_up?: boolean | null
          follow_up_notes?: string | null
          id?: string
          interest_level?: string | null
          location?: string | null
          notes?: string | null
          project_id?: string
          requested_by?: string
          scheduled_at?: string
          status?: string
          table_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_meetings_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_meetings_company_anchor_id_fkey"
            columns: ["company_anchor_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_meetings_company_vendor_id_fkey"
            columns: ["company_vendor_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_meetings_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          method: string
          notes: string | null
          project_id: string
          registration_id: string
          staff_id: string | null
          ticket_number: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          method: string
          notes?: string | null
          project_id: string
          registration_id: string
          staff_id?: string | null
          ticket_number: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          method?: string
          notes?: string | null
          project_id?: string
          registration_id?: string
          staff_id?: string | null
          ticket_number?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cnpj: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          contact_whatsapp: string | null
          created_at: string | null
          description: string
          id: string
          interests: string[] | null
          logo: string | null
          max_meetings: number | null
          name: string
          offers: string[] | null
          package_type: string | null
          project_id: string
          rejection_reason: string | null
          sector: string
          status: string
          type: string
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          cnpj?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          description: string
          id?: string
          interests?: string[] | null
          logo?: string | null
          max_meetings?: number | null
          name: string
          offers?: string[] | null
          package_type?: string | null
          project_id: string
          rejection_reason?: string | null
          sector: string
          status?: string
          type: string
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          cnpj?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          description?: string
          id?: string
          interests?: string[] | null
          logo?: string | null
          max_meetings?: number | null
          name?: string
          offers?: string[] | null
          package_type?: string | null
          project_id?: string
          rejection_reason?: string | null
          sector?: string
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          body_html: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          project_id: string
          recipient_count: number | null
          recipient_filter: Json | null
          scheduled_at: string | null
          sent_at: string | null
          stats_bounced: number | null
          stats_clicked: number | null
          stats_complained: number | null
          stats_delivered: number | null
          stats_opened: number | null
          stats_sent: number | null
          status: string
          subject: string | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          body_html?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          project_id: string
          recipient_count?: number | null
          recipient_filter?: Json | null
          scheduled_at?: string | null
          sent_at?: string | null
          stats_bounced?: number | null
          stats_clicked?: number | null
          stats_complained?: number | null
          stats_delivered?: number | null
          stats_opened?: number | null
          stats_sent?: number | null
          status?: string
          subject?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          body_html?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          project_id?: string
          recipient_count?: number | null
          recipient_filter?: Json | null
          scheduled_at?: string | null
          sent_at?: string | null
          stats_bounced?: number | null
          stats_clicked?: number | null
          stats_complained?: number | null
          stats_delivered?: number | null
          stats_opened?: number | null
          stats_sent?: number | null
          status?: string
          subject?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_default: boolean | null
          name: string
          project_id: string | null
          subject: string
          updated_at: string | null
          variables: string[] | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          project_id?: string | null
          subject: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          project_id?: string | null
          subject?: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      incentive_company_registrations: {
        Row: {
          created_at: string | null
          email: string
          id: string
          company_name: string
          responsible_name: string
          objetivo: string | null
          project_id: string | null
          night_quantity: number
          status: string
          phone: string
          updated_at: string | null
          invested_amount: number | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          company_name: string
          responsible_name: string
          objetivo?: string | null
          project_id?: string | null
          night_quantity?: number
          status?: string
          phone: string
          updated_at?: string | null
          invested_amount?: number | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          company_name?: string
          responsible_name?: string
          objetivo?: string | null
          project_id?: string | null
          night_quantity?: number
          status?: string
          phone?: string
          updated_at?: string | null
          invested_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "incentive_company_registrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_experience_registrations: {
        Row: {
          app_instalado: boolean | null
          lecture_code: string | null
          social_code: string | null
          created_at: string | null
          lecture_coupon: string | null
          selected_courses: string[] | null
          email: string | null
          evento: string | null
          activity_schedule: string | null
          id: string
          referral_name: string | null
          referral_type: string | null
          activity_level: string | null
          nome: string | null
          night_lectures: boolean | null
          project_id: string | null
          activity_room: string | null
          status: string | null
          payment_status: string | null
          phone: string | null
          selected_activity_type: string | null
          registration_type: string | null
          updated_at: string | null
          user_id: string | null
          paid_amount: number | null
        }
        Insert: {
          app_instalado?: boolean | null
          lecture_code?: string | null
          social_code?: string | null
          created_at?: string | null
          lecture_coupon?: string | null
          selected_courses?: string[] | null
          email?: string | null
          evento?: string | null
          activity_schedule?: string | null
          id?: string
          referral_name?: string | null
          referral_type?: string | null
          activity_level?: string | null
          nome?: string | null
          night_lectures?: boolean | null
          project_id?: string | null
          activity_room?: string | null
          status?: string | null
          payment_status?: string | null
          phone?: string | null
          selected_activity_type?: string | null
          registration_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          paid_amount?: number | null
        }
        Update: {
          app_instalado?: boolean | null
          lecture_code?: string | null
          social_code?: string | null
          created_at?: string | null
          lecture_coupon?: string | null
          selected_courses?: string[] | null
          email?: string | null
          evento?: string | null
          activity_schedule?: string | null
          id?: string
          referral_name?: string | null
          referral_type?: string | null
          activity_level?: string | null
          nome?: string | null
          night_lectures?: boolean | null
          project_id?: string | null
          activity_room?: string | null
          status?: string | null
          payment_status?: string | null
          phone?: string | null
          selected_activity_type?: string | null
          registration_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          paid_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_experience_registrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_experience_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          contacted: boolean | null
          contacted_at: string | null
          created_at: string | null
          id: string
          interest_level: string
          notes: string | null
          project_id: string
          startup_id: string
          tags: string[] | null
          visitor_company: string | null
          visitor_email: string
          visitor_name: string
          visitor_phone: string | null
          visitor_registration_id: string | null
        }
        Insert: {
          contacted?: boolean | null
          contacted_at?: string | null
          created_at?: string | null
          id?: string
          interest_level: string
          notes?: string | null
          project_id: string
          startup_id: string
          tags?: string[] | null
          visitor_company?: string | null
          visitor_email: string
          visitor_name: string
          visitor_phone?: string | null
          visitor_registration_id?: string | null
        }
        Update: {
          contacted?: boolean | null
          contacted_at?: string | null
          created_at?: string | null
          id?: string
          interest_level?: string
          notes?: string | null
          project_id?: string
          startup_id?: string
          tags?: string[] | null
          visitor_company?: string | null
          visitor_email?: string
          visitor_name?: string
          visitor_phone?: string | null
          visitor_registration_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_visitor_registration_id_fkey"
            columns: ["visitor_registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_sessions: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          location: string | null
          meeting_url: string | null
          mentee_comment: string | null
          mentee_id: string
          mentee_rating: number | null
          mentor_comment: string | null
          mentor_id: string
          mentor_rating: number | null
          notes: string | null
          project_id: string
          scheduled_at: string
          status: string
          three_steps: string[] | null
          topic_of_interest: string | null
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          location?: string | null
          meeting_url?: string | null
          mentee_comment?: string | null
          mentee_id: string
          mentee_rating?: number | null
          mentor_comment?: string | null
          mentor_id: string
          mentor_rating?: number | null
          notes?: string | null
          project_id: string
          scheduled_at: string
          status?: string
          three_steps?: string[] | null
          topic_of_interest?: string | null
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          location?: string | null
          meeting_url?: string | null
          mentee_comment?: string | null
          mentee_id?: string
          mentee_rating?: number | null
          mentor_comment?: string | null
          mentor_id?: string
          mentor_rating?: number | null
          notes?: string | null
          project_id?: string
          scheduled_at?: string
          status?: string
          three_steps?: string[] | null
          topic_of_interest?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_sessions_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_sessions_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          availability: Json | null
          bio: string
          company: string | null
          created_at: string | null
          email: string
          id: string
          linkedin: string | null
          max_mentorings: number | null
          name: string
          photo: string | null
          project_id: string
          rejection_reason: string | null
          role_title: string | null
          session_duration: number | null
          specialties: string[]
          status: string
          tracks: string[] | null
          updated_at: string | null
          user_id: string | null
          website: string | null
          years_experience: number | null
        }
        Insert: {
          availability?: Json | null
          bio: string
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          linkedin?: string | null
          max_mentorings?: number | null
          name: string
          photo?: string | null
          project_id: string
          rejection_reason?: string | null
          role_title?: string | null
          session_duration?: number | null
          specialties: string[]
          status?: string
          tracks?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          availability?: Json | null
          bio?: string
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          linkedin?: string | null
          max_mentorings?: number | null
          name?: string
          photo?: string | null
          project_id?: string
          rejection_reason?: string | null
          role_title?: string | null
          session_duration?: number | null
          specialties?: string[]
          status?: string
          tracks?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_text: string | null
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          birth_date: string | null
          city: string | null
          cnpj: string | null
          company: string | null
          country: string | null
          cpf: string | null
          created_at: string | null
          gender: string | null
          id: string
          linkedin: string | null
          newsletter_opt_in: boolean | null
          phone: string | null
          position: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          cnpj?: string | null
          company?: string | null
          country?: string | null
          cpf?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          linkedin?: string | null
          newsletter_opt_in?: boolean | null
          phone?: string | null
          position?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          cnpj?: string | null
          company?: string | null
          country?: string | null
          cpf?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          linkedin?: string | null
          newsletter_opt_in?: boolean | null
          phone?: string | null
          position?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          banner: string | null
          city: string
          country: string | null
          created_at: string | null
          created_by: string | null
          description: string
          enable_b2b: boolean | null
          enable_check_in: boolean | null
          enable_mentoring: boolean | null
          enable_startups: boolean | null
          end_date: string
          id: string
          location: string
          logo: string | null
          max_companies: number | null
          max_mentors: number | null
          max_registrations: number | null
          max_startups: number | null
          name: string
          primary_color: string | null
          public_content: Json | null
          secondary_color: string | null
          short_description: string | null
          slug: string
          start_date: string
          state: string
          status: string
          target_registrations: number | null
          target_revenue: number | null
          ticket_price_pro: number
          ticket_price_standard: number
          ticket_price_vip: number
          type: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          banner?: string | null
          city: string
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          enable_b2b?: boolean | null
          enable_check_in?: boolean | null
          enable_mentoring?: boolean | null
          enable_startups?: boolean | null
          end_date: string
          id?: string
          location: string
          logo?: string | null
          max_companies?: number | null
          max_mentors?: number | null
          max_registrations?: number | null
          max_startups?: number | null
          name: string
          primary_color?: string | null
          public_content?: Json | null
          secondary_color?: string | null
          short_description?: string | null
          slug: string
          start_date: string
          state: string
          status?: string
          target_registrations?: number | null
          target_revenue?: number | null
          ticket_price_pro?: number
          ticket_price_standard?: number
          ticket_price_vip?: number
          type: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          banner?: string | null
          city?: string
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          enable_b2b?: boolean | null
          enable_check_in?: boolean | null
          enable_mentoring?: boolean | null
          enable_startups?: boolean | null
          end_date?: string
          id?: string
          location?: string
          logo?: string | null
          max_companies?: number | null
          max_mentors?: number | null
          max_registrations?: number | null
          max_startups?: number | null
          name?: string
          primary_color?: string | null
          public_content?: Json | null
          secondary_color?: string | null
          short_description?: string | null
          slug?: string
          start_date?: string
          state?: string
          status?: string
          target_registrations?: number | null
          target_revenue?: number | null
          ticket_price_pro?: number
          ticket_price_standard?: number
          ticket_price_vip?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          amount: number
          check_in_at: string | null
          check_in_by: string | null
          check_in_count: number | null
          check_in_location: string | null
          checked_in: boolean | null
          created_at: string | null
          discount_amount: number | null
          expires_at: string | null
          final_amount: number
          id: string
          payment_date: string | null
          payment_metadata: Json | null
          payment_method: string | null
          payment_provider: string | null
          payment_provider_id: string | null
          payment_status: string | null
          project_id: string
          qr_code: string | null
          qr_code_data: string | null
          status: string
          ticket_number: string | null
          ticket_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          check_in_at?: string | null
          check_in_by?: string | null
          check_in_count?: number | null
          check_in_location?: string | null
          checked_in?: boolean | null
          created_at?: string | null
          discount_amount?: number | null
          expires_at?: string | null
          final_amount: number
          id?: string
          payment_date?: string | null
          payment_metadata?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_provider_id?: string | null
          payment_status?: string | null
          project_id: string
          qr_code?: string | null
          qr_code_data?: string | null
          status?: string
          ticket_number?: string | null
          ticket_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          check_in_at?: string | null
          check_in_by?: string | null
          check_in_count?: number | null
          check_in_location?: string | null
          checked_in?: boolean | null
          created_at?: string | null
          discount_amount?: number | null
          expires_at?: string | null
          final_amount?: number
          id?: string
          payment_date?: string | null
          payment_metadata?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_provider_id?: string | null
          payment_status?: string | null
          project_id?: string
          qr_code?: string | null
          qr_code_data?: string | null
          status?: string
          ticket_number?: string | null
          ticket_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_check_in_by_fkey"
            columns: ["check_in_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_business_rounds: {
        Row: {
          interest_areas: string | null
          created_at: string | null
          faturamento_anual: number | null
          id: string
          linkedin_url: string | null
          logo_url: string | null
          representative_name: string | null
          numero_funcionarios: number | null
          project_id: string | null
          site_url: string | null
          status: string | null
          phone: string | null
          interest_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          interest_areas?: string | null
          created_at?: string | null
          faturamento_anual?: number | null
          id?: string
          linkedin_url?: string | null
          logo_url?: string | null
          representative_name?: string | null
          numero_funcionarios?: number | null
          project_id?: string | null
          site_url?: string | null
          status?: string | null
          phone?: string | null
          interest_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          interest_areas?: string | null
          created_at?: string | null
          faturamento_anual?: number | null
          id?: string
          linkedin_url?: string | null
          logo_url?: string | null
          representative_name?: string | null
          numero_funcionarios?: number | null
          project_id?: string | null
          site_url?: string | null
          status?: string | null
          phone?: string | null
          interest_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_business_rounds_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_business_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      session_speakers: {
        Row: {
          id: string
          session_id: string
          speaker_id: string
        }
        Insert: {
          id?: string
          session_id: string
          speaker_id: string
        }
        Update: {
          id?: string
          session_id?: string
          speaker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_speakers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_speakers_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          day: number
          description: string | null
          end_time: string
          id: string
          image: string | null
          materials: Json | null
          max_capacity: number | null
          project_id: string
          registered_count: number | null
          room: string
          slides_url: string | null
          start_time: string
          title: string
          track: string | null
          type: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          day: number
          description?: string | null
          end_time: string
          id?: string
          image?: string | null
          materials?: Json | null
          max_capacity?: number | null
          project_id: string
          registered_count?: number | null
          room: string
          slides_url?: string | null
          start_time: string
          title: string
          track?: string | null
          type: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          day?: number
          description?: string | null
          end_time?: string
          id?: string
          image?: string | null
          materials?: Json | null
          max_capacity?: number | null
          project_id?: string
          registered_count?: number | null
          room?: string
          slides_url?: string | null
          start_time?: string
          title?: string
          track?: string | null
          type?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      speakers: {
        Row: {
          bio: string | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          image: string | null
          is_featured: boolean | null
          linkedin: string | null
          name: string
          order_index: number | null
          project_id: string
          role: string | null
          topics: string[] | null
          twitter: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          linkedin?: string | null
          name: string
          order_index?: number | null
          project_id: string
          role?: string | null
          topics?: string[] | null
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          linkedin?: string | null
          name?: string
          order_index?: number | null
          project_id?: string
          role?: string | null
          topics?: string[] | null
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "speakers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_deliverables: {
        Row: {
          completed_at: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          item: string
          notes: string | null
          responsible_id: string | null
          sponsor_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          item: string
          notes?: string | null
          responsible_id?: string | null
          sponsor_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          item?: string
          notes?: string | null
          responsible_id?: string | null
          sponsor_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_deliverables_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_deliverables_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          closed_at: string | null
          cnpj: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          contact_whatsapp: string | null
          created_at: string | null
          id: string
          internal_notes: string | null
          investment: number
          level: string
          logo: string | null
          notes: string | null
          project_id: string
          status: string
          trading_name: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          closed_at?: string | null
          cnpj?: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          id?: string
          internal_notes?: string | null
          investment: number
          level: string
          logo?: string | null
          notes?: string | null
          project_id: string
          status?: string
          trading_name?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          closed_at?: string | null
          cnpj?: string | null
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          id?: string
          internal_notes?: string | null
          investment?: number
          level?: string
          logo?: string | null
          notes?: string | null
          project_id?: string
          status?: string
          trading_name?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      startups: {
        Row: {
          cnpj: string | null
          created_at: string | null
          description: string
          founding_team: Json | null
          id: string
          logo: string | null
          metrics_growth: number | null
          metrics_other: Json | null
          metrics_revenue: number | null
          metrics_users: number | null
          name: string
          package_type: string
          pitch_deck: string | null
          pitch_duration: number | null
          pitch_order: number | null
          pitch_scheduled_at: string | null
          project_id: string
          rejection_reason: string | null
          sector: string
          stage: string
          stand_number: string | null
          status: string
          updated_at: string | null
          user_id: string | null
          video_pitch: string | null
          website: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          description: string
          founding_team?: Json | null
          id?: string
          logo?: string | null
          metrics_growth?: number | null
          metrics_other?: Json | null
          metrics_revenue?: number | null
          metrics_users?: number | null
          name: string
          package_type: string
          pitch_deck?: string | null
          pitch_duration?: number | null
          pitch_order?: number | null
          pitch_scheduled_at?: string | null
          project_id: string
          rejection_reason?: string | null
          sector: string
          stage: string
          stand_number?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          video_pitch?: string | null
          website?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          description?: string
          founding_team?: Json | null
          id?: string
          logo?: string | null
          metrics_growth?: number | null
          metrics_other?: Json | null
          metrics_revenue?: number | null
          metrics_users?: number | null
          name?: string
          package_type?: string
          pitch_deck?: string | null
          pitch_duration?: number | null
          pitch_order?: number | null
          pitch_scheduled_at?: string | null
          project_id?: string
          rejection_reason?: string | null
          sector?: string
          stage?: string
          stand_number?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          video_pitch?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startups_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      arena_pitch_startups: {
        Row: {
          avaliado_at: string | null
          created_at: string | null
          startup_description: string | null
          diferencial: string | null
          estagio: string | null
          faturamento_mensal: number | null
          feedback: string | null
          id: string
          investimento_buscado: number | null
          founder_name: string | null
          startup_name: string | null
          pitch_deck_url: string | null
          pontuacao: number | null
          problema: string | null
          project_id: string | null
          setor: string | null
          solucao: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          video_pitch_url: string | null
        }
        Insert: {
          avaliado_at?: string | null
          created_at?: string | null
          startup_description?: string | null
          diferencial?: string | null
          estagio?: string | null
          faturamento_mensal?: number | null
          feedback?: string | null
          id?: string
          investimento_buscado?: number | null
          founder_name?: string | null
          startup_name?: string | null
          pitch_deck_url?: string | null
          pontuacao?: number | null
          problema?: string | null
          project_id?: string | null
          setor?: string | null
          solucao?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_pitch_url?: string | null
        }
        Update: {
          avaliado_at?: string | null
          created_at?: string | null
          startup_description?: string | null
          diferencial?: string | null
          estagio?: string | null
          faturamento_mensal?: number | null
          feedback?: string | null
          id?: string
          investimento_buscado?: number | null
          founder_name?: string | null
          startup_name?: string | null
          pitch_deck_url?: string | null
          pontuacao?: number | null
          problema?: string | null
          project_id?: string | null
          setor?: string | null
          solucao?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_pitch_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arena_pitch_startups_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arena_pitch_startups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          created_by: string | null
          date: string
          description: string
          id: string
          invoice_number: string | null
          invoice_url: string | null
          notes: string | null
          payment_method: string | null
          payment_provider: string | null
          payment_provider_id: string | null
          project_id: string
          receipt_url: string | null
          related_id: string | null
          related_type: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          created_by?: string | null
          date: string
          description: string
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_provider_id?: string | null
          project_id: string
          receipt_url?: string | null
          related_id?: string | null
          related_type?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_provider_id?: string | null
          project_id?: string
          receipt_url?: string | null
          related_id?: string | null
          related_type?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          name: string
          phone: string | null
          phone_verified: boolean | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id: string
          name: string
          phone?: string | null
          phone_verified?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          name?: string
          phone?: string | null
          phone_verified?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      register_participant_with_slots: {
        Args: {
          p_lecture_code?: string
          p_social_code?: string
          p_email: string
          p_event_name?: string
          p_extra_data?: Json
          p_activity_schedule?: string
          p_referral_name?: string
          p_referral_type?: string
          p_activity_level?: string
          p_name: string
          p_night_lectures?: boolean
          p_project_id: string
          p_activity_room?: string
          p_session_ids: string[]
          p_status?: string
          p_payment_status?: string
          p_phone: string
          p_activity_type?: string
          p_registration_type?: string
          p_user_id: string
          p_paid_amount?: number
          p_batch_id?: string
          p_company_voucher?: string
          p_partner_id?: string
          p_app_installed?: boolean
        }
        Returns: Json
      }
      apply_company_voucher: {
        Args: {
          p_registration_id: string
          p_voucher_code: string
        }
        Returns: Json
      }
      validate_registration_data: {
        Args: {
          p_name: string
          p_email: string
          p_phone: string
        }
        Returns: Json
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
