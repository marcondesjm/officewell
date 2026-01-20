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
      daily_reports: {
        Row: {
          created_at: string
          display_name: string
          eye_breaks: number
          id: string
          notes: string | null
          points_earned: number
          report_date: string
          session_id: string
          stretch_breaks: number
          total_breaks: number
          user_id: string
          water_breaks: number
        }
        Insert: {
          created_at?: string
          display_name: string
          eye_breaks?: number
          id?: string
          notes?: string | null
          points_earned?: number
          report_date?: string
          session_id: string
          stretch_breaks?: number
          total_breaks?: number
          user_id: string
          water_breaks?: number
        }
        Update: {
          created_at?: string
          display_name?: string
          eye_breaks?: number
          id?: string
          notes?: string | null
          points_earned?: number
          report_date?: string
          session_id?: string
          stretch_breaks?: number
          total_breaks?: number
          user_id?: string
          water_breaks?: number
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
      monthly_awards: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          month_year: string
          points: number
          position: number
          prize_description: string | null
          prize_title: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id?: string
          month_year: string
          points?: number
          position: number
          prize_description?: string | null
          prize_title: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          month_year?: string
          points?: number
          position?: number
          prize_description?: string | null
          prize_title?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          created_at: string
          id: string
          mood: string
          note: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood: string
          note?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood?: string
          note?: string | null
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
      plan_upgrade_requests: {
        Row: {
          created_at: string
          current_plan: Database["public"]["Enums"]["subscription_plan"]
          id: string
          notes: string | null
          requested_plan: Database["public"]["Enums"]["subscription_plan"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_plan: Database["public"]["Enums"]["subscription_plan"]
          id?: string
          notes?: string | null
          requested_plan: Database["public"]["Enums"]["subscription_plan"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_plan?: Database["public"]["Enums"]["subscription_plan"]
          id?: string
          notes?: string | null
          requested_plan?: Database["public"]["Enums"]["subscription_plan"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          current_plan: Database["public"]["Enums"]["subscription_plan"]
          display_name: string
          exercise_hours_per_week: number | null
          exercise_type: string | null
          id: string
          points: number
          trial_ends_at: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          current_plan?: Database["public"]["Enums"]["subscription_plan"]
          display_name: string
          exercise_hours_per_week?: number | null
          exercise_type?: string | null
          id?: string
          points?: number
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          current_plan?: Database["public"]["Enums"]["subscription_plan"]
          display_name?: string
          exercise_hours_per_week?: number | null
          exercise_type?: string | null
          id?: string
          points?: number
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null
          current_plan: Database["public"]["Enums"]["subscription_plan"] | null
          display_name: string | null
          id: string | null
          points: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          current_plan?: Database["public"]["Enums"]["subscription_plan"] | null
          display_name?: string | null
          id?: string | null
          points?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          current_plan?: Database["public"]["Enums"]["subscription_plan"] | null
          display_name?: string | null
          id?: string | null
          points?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_trial_expiration: {
        Args: { user_uuid: string }
        Returns: {
          expired: boolean
          plan: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      migrate_expired_trials: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
      subscription_plan: "free" | "pro" | "enterprise" | "demo"
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
    Enums: {
      app_role: ["admin", "user"],
      subscription_plan: ["free", "pro", "enterprise", "demo"],
    },
  },
} as const
