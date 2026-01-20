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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          title?: string
        }
        Relationships: []
      }
      birthday_settings: {
        Row: {
          created_at: string
          display_time: string | null
          id: string
          image_url: string | null
          message: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_time?: string | null
          id?: string
          image_url?: string | null
          message?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_time?: string | null
          id?: string
          image_url?: string | null
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_tips: {
        Row: {
          category: string
          content: string
          created_at: string
          display_order: number | null
          emoji: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          display_order?: number | null
          emoji?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          display_order?: number | null
          emoji?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          created_at: string
          department: string | null
          email: string | null
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name: string
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      ergonomic_assessments: {
        Row: {
          created_at: string
          distancia_monitor: boolean
          encosto_cadeira: boolean
          id: string
          monitor_altura: boolean
          pes_apoiados: boolean
          postura_punhos: boolean
          score: number
          session_id: string
        }
        Insert: {
          created_at?: string
          distancia_monitor?: boolean
          encosto_cadeira?: boolean
          id?: string
          monitor_altura?: boolean
          pes_apoiados?: boolean
          postura_punhos?: boolean
          score?: number
          session_id: string
        }
        Update: {
          created_at?: string
          distancia_monitor?: boolean
          encosto_cadeira?: boolean
          id?: string
          monitor_altura?: boolean
          pes_apoiados?: boolean
          postura_punhos?: boolean
          score?: number
          session_id?: string
        }
        Relationships: []
      }
      fatigue_assessments: {
        Row: {
          created_at: string
          fatigue_level: string
          id: string
          session_id: string
          suggestion: string | null
        }
        Insert: {
          created_at?: string
          fatigue_level: string
          id?: string
          session_id: string
          suggestion?: string | null
        }
        Update: {
          created_at?: string
          fatigue_level?: string
          id?: string
          session_id?: string
          suggestion?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ler_assessments: {
        Row: {
          created_at: string
          dor_pescoco: boolean
          dor_punhos: boolean
          formigamento: boolean
          id: string
          rigidez: boolean
          risk_level: string
          session_id: string
        }
        Insert: {
          created_at?: string
          dor_pescoco?: boolean
          dor_punhos?: boolean
          formigamento?: boolean
          id?: string
          rigidez?: boolean
          risk_level: string
          session_id: string
        }
        Update: {
          created_at?: string
          dor_pescoco?: boolean
          dor_punhos?: boolean
          formigamento?: boolean
          id?: string
          rigidez?: boolean
          risk_level?: string
          session_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean | null
          notification_type: string
          session_id: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type: string
          session_id: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type?: string
          session_id?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          badge: string | null
          border_color: string
          button_gradient: string
          clicks: number
          created_at: string
          description: string
          display_order: number
          gradient: string
          icon: string
          icon_bg: string
          id: string
          impressions: number
          is_active: boolean
          name: string
          shadow_color: string
          text_gradient: string
          updated_at: string
          url: string
        }
        Insert: {
          badge?: string | null
          border_color?: string
          button_gradient?: string
          clicks?: number
          created_at?: string
          description: string
          display_order?: number
          gradient?: string
          icon?: string
          icon_bg?: string
          id?: string
          impressions?: number
          is_active?: boolean
          name: string
          shadow_color?: string
          text_gradient?: string
          updated_at?: string
          url: string
        }
        Update: {
          badge?: string | null
          border_color?: string
          button_gradient?: string
          clicks?: number
          created_at?: string
          description?: string
          display_order?: number
          gradient?: string
          icon?: string
          icon_bg?: string
          id?: string
          impressions?: number
          is_active?: boolean
          name?: string
          shadow_color?: string
          text_gradient?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      push_notification_history: {
        Row: {
          click_url: string | null
          failed_count: number | null
          icon_url: string | null
          id: string
          message: string
          sent_at: string | null
          sent_by: string | null
          sent_count: number | null
          target_session_ids: string[] | null
          target_type: string | null
          title: string
        }
        Insert: {
          click_url?: string | null
          failed_count?: number | null
          icon_url?: string | null
          id?: string
          message: string
          sent_at?: string | null
          sent_by?: string | null
          sent_count?: number | null
          target_session_ids?: string[] | null
          target_type?: string | null
          title: string
        }
        Update: {
          click_url?: string | null
          failed_count?: number | null
          icon_url?: string | null
          id?: string
          message?: string
          sent_at?: string | null
          sent_by?: string | null
          sent_count?: number | null
          target_session_ids?: string[] | null
          target_type?: string | null
          title?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          device_info: Json | null
          device_name: string | null
          device_token: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          last_push_received_at: string | null
          last_push_title: string | null
          p256dh: string
          session_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          device_info?: Json | null
          device_name?: string | null
          device_token?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          last_push_received_at?: string | null
          last_push_title?: string | null
          p256dh: string
          session_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          device_info?: Json | null
          device_name?: string | null
          device_token?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          last_push_received_at?: string | null
          last_push_title?: string | null
          p256dh?: string
          session_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      scheduled_push_notifications: {
        Row: {
          click_url: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          failed_count: number | null
          icon_url: string | null
          id: string
          last_sent_at: string | null
          message: string
          next_run_at: string | null
          recurrence_end_date: string | null
          recurrence_type: string | null
          scheduled_for: string
          sent_at: string | null
          sent_count: number | null
          status: string | null
          target_session_ids: string[] | null
          target_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          click_url?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          failed_count?: number | null
          icon_url?: string | null
          id?: string
          last_sent_at?: string | null
          message: string
          next_run_at?: string | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          scheduled_for: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          target_session_ids?: string[] | null
          target_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          click_url?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          failed_count?: number | null
          icon_url?: string | null
          id?: string
          last_sent_at?: string | null
          message?: string
          next_run_at?: string | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          scheduled_for?: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          target_session_ids?: string[] | null
          target_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      timer_states: {
        Row: {
          created_at: string
          eye_end_time: number | null
          id: string
          is_running: boolean | null
          last_notified_eye: number | null
          last_notified_stretch: number | null
          last_notified_water: number | null
          session_id: string
          stretch_end_time: number | null
          updated_at: string
          water_end_time: number | null
        }
        Insert: {
          created_at?: string
          eye_end_time?: number | null
          id?: string
          is_running?: boolean | null
          last_notified_eye?: number | null
          last_notified_stretch?: number | null
          last_notified_water?: number | null
          session_id: string
          stretch_end_time?: number | null
          updated_at?: string
          water_end_time?: number | null
        }
        Update: {
          created_at?: string
          eye_end_time?: number | null
          id?: string
          is_running?: boolean | null
          last_notified_eye?: number | null
          last_notified_stretch?: number | null
          last_notified_water?: number | null
          session_id?: string
          stretch_end_time?: number | null
          updated_at?: string
          water_end_time?: number | null
        }
        Relationships: []
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
