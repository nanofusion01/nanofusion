// AUTOMATICKY GENEROVÁNO skriptem scripts/gen-db-types.mjs - neupravovat ručně.
// Obnovení: npm run gen:types (z kořene repozitáře)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_analyses: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          object_type: string | null
          analysis_type: string | null
          urgency: string | null
          original_photo_url: string
          before_photo_url: string | null
          after_photo_url: string | null
          analysis_result: string | null
          additional_notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          object_type?: string | null
          analysis_type?: string | null
          urgency?: string | null
          original_photo_url: string
          before_photo_url?: string | null
          after_photo_url?: string | null
          analysis_result?: string | null
          additional_notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          object_type?: string | null
          analysis_type?: string | null
          urgency?: string | null
          original_photo_url?: string
          before_photo_url?: string | null
          after_photo_url?: string | null
          analysis_result?: string | null
          additional_notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          id: string
          title: string
          slug: string
          content: string | null
          hero_image_url: string | null
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content?: string | null
          hero_image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string | null
          hero_image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bot_documents: {
        Row: {
          id: string
          name: string
          file_url: string
          file_path: string
          content: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          file_url: string
          file_path: string
          content?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          file_url?: string
          file_path?: string
          content?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      bot_knowledge: {
        Row: {
          id: string
          title: string
          content: string
          category: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          category?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          id: string
          session_token: string | null
          user_identifier: string | null
          messages: Json
          status: string
          started_at: string
          last_activity: string
        }
        Insert: {
          id?: string
          session_token?: string | null
          user_identifier?: string | null
          messages: Json
          status?: string
          started_at?: string
          last_activity?: string
        }
        Update: {
          id?: string
          session_token?: string | null
          user_identifier?: string | null
          messages?: Json
          status?: string
          started_at?: string
          last_activity?: string
        }
        Relationships: []
      }
      configurator_prices: {
        Row: {
          id: string
          item_key: string
          label: string | null
          price: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          item_key: string
          label?: string | null
          price?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          item_key?: string
          label?: string | null
          price?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      external_reviews: {
        Row: {
          id: string
          source: string
          external_id: string | null
          author: string | null
          rating: number | null
          content: string | null
          published_at: string | null
          approved: boolean
          fetched_at: string
        }
        Insert: {
          id?: string
          source?: string
          external_id?: string | null
          author?: string | null
          rating?: number | null
          content?: string | null
          published_at?: string | null
          approved?: boolean
          fetched_at?: string
        }
        Update: {
          id?: string
          source?: string
          external_id?: string | null
          author?: string | null
          rating?: number | null
          content?: string | null
          published_at?: string | null
          approved?: boolean
          fetched_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          order_index: number
          is_active: boolean
          page_section: string | null
          category: string | null
        }
        Insert: {
          id?: string
          question: string
          answer: string
          order_index?: number
          is_active?: boolean
          page_section?: string | null
          category?: string | null
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          order_index?: number
          is_active?: boolean
          page_section?: string | null
          category?: string | null
        }
        Relationships: []
      }
      firmy_reviews: {
        Row: {
          id: string
          author_name: string | null
          rating: number | null
          content: string | null
          review_date: string | null
          external_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          author_name?: string | null
          rating?: number | null
          content?: string | null
          review_date?: string | null
          external_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          author_name?: string | null
          rating?: number | null
          content?: string | null
          review_date?: string | null
          external_id?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      firmy_stats: {
        Row: {
          id: string
          rating: number | null
          review_count: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          rating?: number | null
          review_count?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          rating?: number | null
          review_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery_albums: {
        Row: {
          id: string
          title: string
          caption: string | null
          order_index: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          caption?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          caption?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          id: string
          type: string | null
          url: string | null
          youtube_id: string | null
          caption: string | null
          order_index: number
          is_active: boolean
          title: string | null
          image_url: string | null
          category: string | null
          album_id: string | null
        }
        Insert: {
          id?: string
          type?: string | null
          url?: string | null
          youtube_id?: string | null
          caption?: string | null
          order_index?: number
          is_active?: boolean
          title?: string | null
          image_url?: string | null
          category?: string | null
          album_id?: string | null
        }
        Update: {
          id?: string
          type?: string | null
          url?: string | null
          youtube_id?: string | null
          caption?: string | null
          order_index?: number
          is_active?: boolean
          title?: string | null
          image_url?: string | null
          category?: string | null
          album_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_media: {
        Row: {
          id: string
          type: string
          url: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          url: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          url?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      how_it_works_steps: {
        Row: {
          id: string
          step_number: string | null
          title: string
          description: string | null
          icon: string | null
          order_index: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          step_number?: string | null
          title: string
          description?: string | null
          icon?: string | null
          order_index?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          step_number?: string | null
          title?: string
          description?: string | null
          icon?: string | null
          order_index?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          id: string
          name: string | null
          email: string | null
          phone: string | null
          service: string | null
          message: string | null
          status: string
          source: string
          created_at: string
          updated_at: string
          notes: string | null
          full_name: string | null
          customer_name: string | null
          original_photo_url: string | null
          photo_url: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          service?: string | null
          message?: string | null
          status?: string
          source?: string
          created_at?: string
          updated_at?: string
          notes?: string | null
          full_name?: string | null
          customer_name?: string | null
          original_photo_url?: string | null
          photo_url?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          service?: string | null
          message?: string | null
          status?: string
          source?: string
          created_at?: string
          updated_at?: string
          notes?: string | null
          full_name?: string | null
          customer_name?: string | null
          original_photo_url?: string | null
          photo_url?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          created_at: string
          name: string | null
          email: string | null
          phone: string | null
          service: string | null
          details: string | null
          status: string | null
          notes: string | null
          history: Json | null
          pricerange: string | null
          source: string | null
          chat_history: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          service?: string | null
          details?: string | null
          status?: string | null
          notes?: string | null
          history?: Json | null
          pricerange?: string | null
          source?: string | null
          chat_history?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          service?: string | null
          details?: string | null
          status?: string | null
          notes?: string | null
          history?: Json | null
          pricerange?: string | null
          source?: string | null
          chat_history?: Json | null
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          id: string
          created_at: string
          title: string
          service: string | null
          image: string | null
          date: string | null
          status: string | null
          location: string | null
          duration: string | null
          challenge: string | null
          solution: string | null
          results: string | null
          beforeimg: string | null
          afterimg: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          service?: string | null
          image?: string | null
          date?: string | null
          status?: string | null
          location?: string | null
          duration?: string | null
          challenge?: string | null
          solution?: string | null
          results?: string | null
          beforeimg?: string | null
          afterimg?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          service?: string | null
          image?: string | null
          date?: string | null
          status?: string | null
          location?: string | null
          duration?: string | null
          challenge?: string | null
          solution?: string | null
          results?: string | null
          beforeimg?: string | null
          afterimg?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          role: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          key: string
          window_start: string
          count: number
        }
        Insert: {
          key: string
          window_start: string
          count?: number
        }
        Update: {
          key?: string
          window_start?: string
          count?: number
        }
        Relationships: []
      }
      realization_photos: {
        Row: {
          id: string
          realization_id: string
          url: string
          caption: string | null
          order_index: number
        }
        Insert: {
          id?: string
          realization_id: string
          url: string
          caption?: string | null
          order_index?: number
        }
        Update: {
          id?: string
          realization_id?: string
          url?: string
          caption?: string | null
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "realization_photos_realization_id_fkey"
            columns: ["realization_id"]
            isOneToOne: false
            referencedRelation: "realizations"
            referencedColumns: ["id"]
          },
        ]
      }
      realizations: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string | null
          duration: string | null
          work_type: string | null
          is_published: boolean
          created_at: string
          updated_at: string
          order_index: number | null
          youtube_id: string | null
          subtitle: string | null
          slug: string | null
          category: string | null
          is_featured: boolean | null
          image_url: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location?: string | null
          duration?: string | null
          work_type?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
          order_index?: number | null
          youtube_id?: string | null
          subtitle?: string | null
          slug?: string | null
          category?: string | null
          is_featured?: boolean | null
          image_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          location?: string | null
          duration?: string | null
          work_type?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
          order_index?: number | null
          youtube_id?: string | null
          subtitle?: string | null
          slug?: string | null
          category?: string | null
          is_featured?: boolean | null
          image_url?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: number
          name: string | null
          info: string | null
          stars: number | null
          text: string | null
          is_visible: boolean | null
        }
        Insert: {
          id: number
          name?: string | null
          info?: string | null
          stars?: number | null
          text?: string | null
          is_visible?: boolean | null
        }
        Update: {
          id?: number
          name?: string | null
          info?: string | null
          stars?: number | null
          text?: string | null
          is_visible?: boolean | null
        }
        Relationships: []
      }
      service_before_after: {
        Row: {
          id: string
          service_id: string
          before_url: string | null
          after_url: string | null
          caption: string | null
          order_index: number
        }
        Insert: {
          id?: string
          service_id: string
          before_url?: string | null
          after_url?: string | null
          caption?: string | null
          order_index?: number
        }
        Update: {
          id?: string
          service_id?: string
          before_url?: string | null
          after_url?: string | null
          caption?: string | null
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_before_after_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_faqs: {
        Row: {
          id: string
          service_id: string
          question: string
          answer: string
          order_index: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          question: string
          answer: string
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          question?: string
          answer?: string
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_faqs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_gallery: {
        Row: {
          id: string
          service_id: string
          url: string
          caption: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          url: string
          caption?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          url?: string
          caption?: string | null
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_gallery_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reviews: {
        Row: {
          id: string
          service_id: string
          author: string | null
          rating: number | null
          content: string | null
          source: string
          is_visible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          author?: string | null
          rating?: number | null
          content?: string | null
          source?: string
          is_visible?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          author?: string | null
          rating?: number | null
          content?: string | null
          source?: string
          is_visible?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          hero_image_url: string | null
          order_index: number
          is_active: boolean
          updated_at: string | null
          process_description: string | null
          features: string[] | null
          video_url: string | null
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          hero_image_url?: string | null
          order_index?: number
          is_active?: boolean
          updated_at?: string | null
          process_description?: string | null
          features?: string[] | null
          video_url?: string | null
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          hero_image_url?: string | null
          order_index?: number
          is_active?: boolean
          updated_at?: string | null
          process_description?: string | null
          features?: string[] | null
          video_url?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: number
          created_at: string
          notification_email: string | null
          lead_alerts: boolean | null
          ai_agent_active: boolean | null
        }
        Insert: {
          id?: number
          created_at?: string
          notification_email?: string | null
          lead_alerts?: boolean | null
          ai_agent_active?: boolean | null
        }
        Update: {
          id?: number
          created_at?: string
          notification_email?: string | null
          lead_alerts?: boolean | null
          ai_agent_active?: boolean | null
        }
        Relationships: []
      }
      site_config: {
        Row: {
          id: string
          key: string
          value: string
          description: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value: string
          description?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string
          description?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_sections: {
        Row: {
          id: string
          section_key: string
          title: string | null
          subtitle: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          section_key: string
          title?: string | null
          subtitle?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          section_key?: string
          title?: string | null
          subtitle?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_key: string
          p_limit: number
          p_window_seconds: number
        }
        Returns: boolean
      }
      is_admin: {
        Args: never
        Returns: boolean
      }
      is_admin_or_editor: {
        Args: never
        Returns: boolean
      }
      rls_auto_enable: {
        Args: never
        Returns: unknown
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

type PublicTables = Database['public']['Tables']

export type Tables<T extends keyof PublicTables> = PublicTables[T]['Row']
export type Inserts<T extends keyof PublicTables> = PublicTables[T]['Insert']
export type Updates<T extends keyof PublicTables> = PublicTables[T]['Update']
export type TablesInsert<T extends keyof PublicTables> = Inserts<T>
export type TablesUpdate<T extends keyof PublicTables> = Updates<T>
