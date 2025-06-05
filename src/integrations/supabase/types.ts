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
      audit_logs: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      client_wallet_addresses: {
        Row: {
          created_at: string
          currency: string
          id: string
          is_active: boolean
          network: string
          updated_at: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          currency: string
          id?: string
          is_active?: boolean
          network: string
          updated_at?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          network?: string
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          authors: string | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          file_path: string
          id: string
          published_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          authors?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_path: string
          id?: string
          published_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          authors?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_path?: string
          id?: string
          published_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ipn_logs: {
        Row: {
          created_at: string
          hmac_header: string | null
          id: string
          is_valid: boolean
          provider: string
          raw_data: Json
          request_body: string | null
          response_status: string | null
          status: string | null
          txn_id: string | null
        }
        Insert: {
          created_at?: string
          hmac_header?: string | null
          id?: string
          is_valid: boolean
          provider: string
          raw_data: Json
          request_body?: string | null
          response_status?: string | null
          status?: string | null
          txn_id?: string | null
        }
        Update: {
          created_at?: string
          hmac_header?: string | null
          id?: string
          is_valid?: boolean
          provider?: string
          raw_data?: Json
          request_body?: string | null
          response_status?: string | null
          status?: string | null
          txn_id?: string | null
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
          is_test: boolean
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
          is_test?: boolean
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
          is_test?: boolean
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
      magic_links: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          used: boolean
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          used?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_test: boolean
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_test?: boolean
          message: string
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_test?: boolean
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          magic_link_preference: boolean | null
          phone_number: string | null
          postal_code: string | null
          preferred_network: string | null
          rejection_reason: string | null
          role: string | null
          solana_wallet_address: string | null
          state_province: string | null
          status: string | null
          street_address: string | null
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          magic_link_preference?: boolean | null
          phone_number?: string | null
          postal_code?: string | null
          preferred_network?: string | null
          rejection_reason?: string | null
          role?: string | null
          solana_wallet_address?: string | null
          state_province?: string | null
          status?: string | null
          street_address?: string | null
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          magic_link_preference?: boolean | null
          phone_number?: string | null
          postal_code?: string | null
          preferred_network?: string | null
          rejection_reason?: string | null
          role?: string | null
          solana_wallet_address?: string | null
          state_province?: string | null
          status?: string | null
          street_address?: string | null
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      secrets: {
        Row: {
          created_at: string
          name: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          name: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          name?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          admin_notes: string | null
          amount: number
          approval_status: string | null
          blockchain_tx_id: string | null
          completed_at: string | null
          created_at: string
          crypto_currency_symbol: string | null
          crypto_network: string | null
          currency: string | null
          expected_crypto_amount: number | null
          external_transaction_id: string | null
          high_value_approval_required: boolean | null
          id: string
          is_test: boolean
          kyc_verification_id: string | null
          payment_address: string | null
          payment_method: string
          payment_timeout_at: string | null
          status: string
          token_amount: number | null
          token_price: number | null
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
          blockchain_tx_id?: string | null
          completed_at?: string | null
          created_at?: string
          crypto_currency_symbol?: string | null
          crypto_network?: string | null
          currency?: string | null
          expected_crypto_amount?: number | null
          external_transaction_id?: string | null
          high_value_approval_required?: boolean | null
          id?: string
          is_test?: boolean
          kyc_verification_id?: string | null
          payment_address?: string | null
          payment_method: string
          payment_timeout_at?: string | null
          status: string
          token_amount?: number | null
          token_price?: number | null
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
          blockchain_tx_id?: string | null
          completed_at?: string | null
          created_at?: string
          crypto_currency_symbol?: string | null
          crypto_network?: string | null
          currency?: string | null
          expected_crypto_amount?: number | null
          external_transaction_id?: string | null
          high_value_approval_required?: boolean | null
          id?: string
          is_test?: boolean
          kyc_verification_id?: string | null
          payment_address?: string | null
          payment_method?: string
          payment_timeout_at?: string | null
          status?: string
          token_amount?: number | null
          token_price?: number | null
          token_sent?: boolean | null
          transaction_id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      wallet_balances: {
        Row: {
          balance: number
          balance_usd: number
          created_at: string
          currency: string
          id: string
          last_updated_at: string
          network: string
          wallet_address: string
        }
        Insert: {
          balance?: number
          balance_usd?: number
          created_at?: string
          currency: string
          id?: string
          last_updated_at?: string
          network: string
          wallet_address: string
        }
        Update: {
          balance?: number
          balance_usd?: number
          created_at?: string
          currency?: string
          id?: string
          last_updated_at?: string
          network?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_magic_links: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      execute_sql: {
        Args: { sql_query: string }
        Returns: Json[]
      }
      get_secret: {
        Args: { secret_name: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_for_storage: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_operation: string
          p_table_name?: string
          p_record_id?: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: string
      }
      mark_data_as_test: {
        Args: Record<PropertyKey, never>
        Returns: Json
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      kyc_status: [
        "not_started",
        "pending",
        "approved",
        "rejected",
        "needs_clarification",
      ],
    },
  },
} as const
