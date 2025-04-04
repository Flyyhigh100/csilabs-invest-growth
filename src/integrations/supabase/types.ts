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
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      kyc_verifications: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          city: string | null
          clarification_message: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          first_name: string | null
          id: string
          id_back_url: string | null
          id_front_url: string | null
          last_name: string | null
          nationality: string | null
          postal_code: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          selfie_url: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          clarification_message?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          last_name?: string | null
          nationality?: string | null
          postal_code?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_url?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          clarification_message?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          last_name?: string | null
          nationality?: string | null
          postal_code?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_url?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          rejection_reason: string | null
          role: string | null
          status: string | null
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          rejection_reason?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          rejection_reason?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          admin_notes: string | null
          amount: number
          approval_status: string | null
          created_at: string
          external_transaction_id: string | null
          high_value_approval_required: boolean | null
          id: string
          kyc_verification_id: string | null
          payment_address: string | null
          payment_method: string
          status: string
          token_sent: boolean | null
          transaction_id: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          approval_status?: string | null
          created_at?: string
          external_transaction_id?: string | null
          high_value_approval_required?: boolean | null
          id?: string
          kyc_verification_id?: string | null
          payment_address?: string | null
          payment_method: string
          status: string
          token_sent?: boolean | null
          transaction_id: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          approval_status?: string | null
          created_at?: string
          external_transaction_id?: string | null
          high_value_approval_required?: boolean | null
          id?: string
          kyc_verification_id?: string | null
          payment_address?: string | null
          payment_method?: string
          status?: string
          token_sent?: boolean | null
          transaction_id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_for_storage: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      kyc_status:
        | "not_started"
        | "pending"
        | "approved"
        | "rejected"
        | "needs_clarification"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
