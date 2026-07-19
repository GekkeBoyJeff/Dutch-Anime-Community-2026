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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      activity_hosts: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          subject_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          subject_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_hosts_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "event_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_hosts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_hosts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          actor_id: string | null
          created_at: string
          event_id: string | null
          expense_id: string | null
          id: number
          item_id: string | null
          kind: string
          subject_id: string | null
          summary: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_id?: string | null
          expense_id?: string | null
          id?: never
          item_id?: string | null
          kind: string
          subject_id?: string | null
          summary: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_id?: string | null
          expense_id?: string | null
          id?: never
          item_id?: string | null
          kind?: string
          subject_id?: string | null
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_requirements: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          item_id: string | null
          label: string | null
          quantity: number
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          item_id?: string | null
          label?: string | null
          quantity?: number
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          item_id?: string | null
          label?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "activity_requirements_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "event_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_requirements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          actor_id: string | null
          created_at: string
          id: number
          new_data: Json | null
          old_data: Json | null
          op: string
          record_id: string | null
          table_name: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          op: string
          record_id?: string | null
          table_name: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          op?: string
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          awarded_by: string | null
          awarded_on: string
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          subject_id: string
          title: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          awarded_by?: string | null
          awarded_on?: string
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          subject_id: string
          title: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          awarded_by?: string | null
          awarded_on?: string
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          subject_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badges_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
        ]
      }
      conduct_notes: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          event_id: string | null
          id: string
          kind: Database["public"]["Enums"]["conduct_kind"]
          subject_id: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["conduct_kind"]
          subject_id: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["conduct_kind"]
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conduct_notes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_notes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_notes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
        ]
      }
      event_activities: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          event_id: string
          id: string
          starts_at: string | null
          title: string
          updated_at: string
          venue: Database["public"]["Enums"]["activity_venue"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          event_id: string
          id?: string
          starts_at?: string | null
          title: string
          updated_at?: string
          venue?: Database["public"]["Enums"]["activity_venue"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          event_id?: string
          id?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
          venue?: Database["public"]["Enums"]["activity_venue"]
        }
        Relationships: [
          {
            foreignKeyName: "event_activities_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendance: {
        Row: {
          created_at: string
          created_by: string | null
          event_id: string
          id: string
          note: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          subject_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_id: string
          id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          subject_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_id?: string
          id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
        ]
      }
      event_item_assignments: {
        Row: {
          assigned_label: string | null
          assigned_user_id: string | null
          created_at: string
          created_by: string | null
          event_id: string
          expected_to_bring: boolean
          id: string
          item_id: string
          notes: string | null
          packed_at: string | null
          quantity: number
        }
        Insert: {
          assigned_label?: string | null
          assigned_user_id?: string | null
          created_at?: string
          created_by?: string | null
          event_id: string
          expected_to_bring?: boolean
          id?: string
          item_id: string
          notes?: string | null
          packed_at?: string | null
          quantity?: number
        }
        Update: {
          assigned_label?: string | null
          assigned_user_id?: string | null
          created_at?: string
          created_by?: string | null
          event_id?: string
          expected_to_bring?: boolean
          id?: string
          item_id?: string
          notes?: string | null
          packed_at?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_item_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_item_assignments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      event_posts: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          event_id: string
          generated_at: string | null
          id: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body?: string
          created_at?: string
          created_by?: string | null
          event_id: string
          generated_at?: string | null
          id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          event_id?: string
          generated_at?: string | null
          id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_posts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_shifts: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string
          event_id: string
          id: string
          locked_at: string | null
          note: string | null
          starts_at: string
          station: string | null
          subject_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at: string
          event_id: string
          id?: string
          locked_at?: string | null
          note?: string | null
          starts_at: string
          station?: string | null
          subject_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string
          event_id?: string
          id?: string
          locked_at?: string | null
          note?: string | null
          starts_at?: string
          station?: string | null
          subject_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_shifts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_shifts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_shifts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
        ]
      }
      event_ticket_subjects: {
        Row: {
          created_at: string
          id: string
          subject_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subject_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subject_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_ticket_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_ticket_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_ticket_subjects_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "event_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tickets: {
        Row: {
          assigned_label: string | null
          assigned_user_id: string | null
          created_at: string
          created_by: string | null
          day: string | null
          event_id: string
          id: string
          note: string | null
          quantity: number
          ticket_pdf_path: string | null
        }
        Insert: {
          assigned_label?: string | null
          assigned_user_id?: string | null
          created_at?: string
          created_by?: string | null
          day?: string | null
          event_id: string
          id?: string
          note?: string | null
          quantity?: number
          ticket_pdf_path?: string | null
        }
        Update: {
          assigned_label?: string | null
          assigned_user_id?: string | null
          created_at?: string
          created_by?: string | null
          day?: string | null
          event_id?: string
          id?: string
          note?: string | null
          quantity?: number
          ticket_pdf_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          budget_eur: number | null
          created_at: string
          created_by: string | null
          ends_on: string | null
          id: string
          kind: Database["public"]["Enums"]["event_kind"]
          location: string | null
          name: string
          notes: string | null
          parent_event_id: string | null
          signups_close_at: string | null
          signups_open_at: string | null
          starts_on: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          budget_eur?: number | null
          created_at?: string
          created_by?: string | null
          ends_on?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["event_kind"]
          location?: string | null
          name: string
          notes?: string | null
          parent_event_id?: string | null
          signups_close_at?: string | null
          signups_open_at?: string | null
          starts_on?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          budget_eur?: number | null
          created_at?: string
          created_by?: string | null
          ends_on?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["event_kind"]
          location?: string | null
          name?: string
          notes?: string | null
          parent_event_id?: string | null
          signups_close_at?: string | null
          signups_open_at?: string | null
          starts_on?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_receipts: {
        Row: {
          created_at: string
          expense_id: string
          id: string
          path: string
        }
        Insert: {
          created_at?: string
          expense_id: string
          id?: string
          path: string
        }
        Update: {
          created_at?: string
          expense_id?: string
          id?: string
          path?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_receipts_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          account_holder: string | null
          activity_id: string | null
          amount_eur: number
          archived_at: string | null
          archived_by: string | null
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          description: string
          event_id: string | null
          iban: string | null
          id: string
          incurred_on: string
          receipt_path: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["expense_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_holder?: string | null
          activity_id?: string | null
          amount_eur: number
          archived_at?: string | null
          archived_by?: string | null
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description: string
          event_id?: string | null
          iban?: string | null
          id?: string
          incurred_on: string
          receipt_path: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_holder?: string | null
          activity_id?: string | null
          amount_eur?: number
          archived_at?: string | null
          archived_by?: string | null
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string
          event_id?: string | null
          iban?: string | null
          id?: string
          incurred_on?: string
          receipt_path?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "event_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_history: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          item_id: string
          kind: Database["public"]["Enums"]["inventory_history_kind"]
          note: string | null
          recorded_by: string | null
          taken_on: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          item_id: string
          kind?: Database["public"]["Enums"]["inventory_history_kind"]
          note?: string | null
          recorded_by?: string | null
          taken_on?: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          item_id?: string
          kind?: Database["public"]["Enums"]["inventory_history_kind"]
          note?: string | null
          recorded_by?: string | null
          taken_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_history_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_history_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          available: boolean
          created_at: string
          created_by: string | null
          id: string
          name: string
          notes: string | null
          owner_label: string | null
          owner_user_id: string | null
          quantity: number
          updated_at: string
          value_eur: number | null
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          available?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_label?: string | null
          owner_user_id?: string | null
          quantity?: number
          updated_at?: string
          value_eur?: number | null
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          available?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_label?: string | null
          owner_user_id?: string | null
          quantity?: number
          updated_at?: string
          value_eur?: number | null
        }
        Relationships: []
      }
      item_unavailability: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          ends_on: string | null
          id: string
          item_id: string
          reason: string | null
          requested_by: string | null
          starts_on: string
          status: Database["public"]["Enums"]["unavailability_status"]
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          ends_on?: string | null
          id?: string
          item_id: string
          reason?: string | null
          requested_by?: string | null
          starts_on: string
          status?: Database["public"]["Enums"]["unavailability_status"]
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          ends_on?: string | null
          id?: string
          item_id?: string
          reason?: string | null
          requested_by?: string | null
          starts_on?: string
          status?: Database["public"]["Enums"]["unavailability_status"]
        }
        Relationships: [
          {
            foreignKeyName: "item_unavailability_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_bans: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          issued_at: string
          issued_by: string | null
          lifted_at: string | null
          lifted_by: string | null
          reason: string
          scope: Database["public"]["Enums"]["mod_ban_scope"]
          subject_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason: string
          scope: Database["public"]["Enums"]["mod_ban_scope"]
          subject_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason?: string
          scope?: Database["public"]["Enums"]["mod_ban_scope"]
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mod_bans_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mod_bans_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_evidence: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          id: string
          kind: string
          storage_path: string | null
          url: string | null
          warning_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          storage_path?: string | null
          url?: string | null
          warning_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          storage_path?: string | null
          url?: string | null
          warning_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mod_evidence_warning_id_fkey"
            columns: ["warning_id"]
            isOneToOne: false
            referencedRelation: "mod_warnings"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_link_evidence: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          id: string
          kind: string
          link_id: string
          storage_path: string | null
          url: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          link_id: string
          storage_path?: string | null
          url?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          link_id?: string
          storage_path?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mod_link_evidence_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "mod_subject_links"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_notes: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          body: string
          created_at: string
          created_by: string | null
          id: string
          subject_id: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          subject_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mod_notes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mod_notes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_subject_aliases: {
        Row: {
          alias: string
          first_seen: string
          id: number
          kind: string | null
          last_seen: string
          source: string | null
          subject_id: string
        }
        Insert: {
          alias: string
          first_seen?: string
          id?: never
          kind?: string | null
          last_seen?: string
          source?: string | null
          subject_id: string
        }
        Update: {
          alias?: string
          first_seen?: string
          id?: never
          kind?: string | null
          last_seen?: string
          source?: string | null
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mod_subject_aliases_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mod_subject_aliases_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_subject_links: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["mod_link_status"]
          subject_high: string
          subject_low: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["mod_link_status"]
          subject_high: string
          subject_low: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["mod_link_status"]
          subject_high?: string
          subject_low?: string
        }
        Relationships: [
          {
            foreignKeyName: "mod_subject_links_subject_high_fkey"
            columns: ["subject_high"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mod_subject_links_subject_high_fkey"
            columns: ["subject_high"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mod_subject_links_subject_low_fkey"
            columns: ["subject_low"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mod_subject_links_subject_low_fkey"
            columns: ["subject_low"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_subjects: {
        Row: {
          created_at: string
          created_by: string | null
          discord_id: string | null
          discord_name: string | null
          id: string
          merged_into: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          discord_id?: string | null
          discord_name?: string | null
          id?: string
          merged_into?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          discord_id?: string | null
          discord_name?: string | null
          id?: string
          merged_into?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mod_subjects_merged_into_fkey"
            columns: ["merged_into"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mod_subjects_merged_into_fkey"
            columns: ["merged_into"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_warnings: {
        Row: {
          color: Database["public"]["Enums"]["mod_warn_color"]
          created_at: string
          id: string
          issued_at: string
          issued_by: string | null
          reason: string
          removed_at: string | null
          removed_by: string | null
          subject_id: string
        }
        Insert: {
          color: Database["public"]["Enums"]["mod_warn_color"]
          created_at?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          reason: string
          removed_at?: string | null
          removed_by?: string | null
          subject_id: string
        }
        Update: {
          color?: Database["public"]["Enums"]["mod_warn_color"]
          created_at?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          reason?: string
          removed_at?: string | null
          removed_by?: string | null
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mod_warnings_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mod_warnings_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_history: {
        Row: {
          audience: Json | null
          body: string | null
          id: string
          sender_user_id: string | null
          sent_at: string
          title: string
          type_key: string | null
        }
        Insert: {
          audience?: Json | null
          body?: string | null
          id?: string
          sender_user_id?: string | null
          sent_at?: string
          title: string
          type_key?: string | null
        }
        Update: {
          audience?: Json | null
          body?: string | null
          id?: string
          sender_user_id?: string | null
          sent_at?: string
          title?: string
          type_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_history_type_key_fkey"
            columns: ["type_key"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["key"]
          },
        ]
      }
      notification_types: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          key: string
          label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          key: string
          label: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          key?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          payload: Json | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          payload?: Json | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          payload?: Json | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      org_income: {
        Row: {
          amount_eur: number
          category: Database["public"]["Enums"]["income_category"]
          created_at: string
          created_by: string
          description: string
          event_id: string | null
          id: string
          received_on: string
          updated_at: string
        }
        Insert: {
          amount_eur: number
          category?: Database["public"]["Enums"]["income_category"]
          created_at?: string
          created_by?: string
          description: string
          event_id?: string | null
          id?: string
          received_on: string
          updated_at?: string
        }
        Update: {
          amount_eur?: number
          category?: Database["public"]["Enums"]["income_category"]
          created_at?: string
          created_by?: string
          description?: string
          event_id?: string | null
          id?: string
          received_on?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_income_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          data: Json
          path: string
          updated_at: string
        }
        Insert: {
          data: Json
          path: string
          updated_at?: string
        }
        Update: {
          data?: Json
          path?: string
          updated_at?: string
        }
        Relationships: []
      }
      payout_details: {
        Row: {
          account_holder: string | null
          iban: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_holder?: string | null
          iban?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_holder?: string | null
          iban?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_name_history: {
        Row: {
          changed_at: string
          id: number
          new_name: string | null
          old_name: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string
          id?: never
          new_name?: string | null
          old_name?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string
          id?: never
          new_name?: string | null
          old_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          discord_id: string | null
          global_name: string | null
          guild_joined_at: string | null
          guild_nick: string | null
          guild_roles: Json | null
          id: string
          synced_at: string | null
          terms_accepted_at: string | null
          terms_version: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          discord_id?: string | null
          global_name?: string | null
          guild_joined_at?: string | null
          guild_nick?: string | null
          guild_roles?: Json | null
          id: string
          synced_at?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          discord_id?: string | null
          global_name?: string | null
          guild_joined_at?: string | null
          guild_nick?: string | null
          guild_roles?: Json | null
          id?: string
          synced_at?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: string
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: string
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: string
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      shift_reminder_sends: {
        Row: {
          sent_at: string
          shift_id: string
          user_id: string
          window_minutes: number
        }
        Insert: {
          sent_at?: string
          shift_id: string
          user_id: string
          window_minutes: number
        }
        Update: {
          sent_at?: string
          shift_id?: string
          user_id?: string
          window_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "shift_reminder_sends_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "event_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_swap_requests: {
        Row: {
          created_at: string
          created_by: string | null
          decided_at: string | null
          from_subject: string
          id: string
          shift_id: string
          status: string
          to_subject: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          from_subject: string
          id?: string
          shift_id: string
          status?: string
          to_subject: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          from_subject?: string
          id?: string
          shift_id?: string
          status?: string
          to_subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_swap_requests_from_subject_fkey"
            columns: ["from_subject"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_from_subject_fkey"
            columns: ["from_subject"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "event_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_to_subject_fkey"
            columns: ["to_subject"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_to_subject_fkey"
            columns: ["to_subject"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
        ]
      }
      structures: {
        Row: {
          data: Json
          id: number
          updated_at: string
        }
        Insert: {
          data: Json
          id?: number
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      survey_answer_choices: {
        Row: {
          answer_id: string
          id: string
          option_id: string
        }
        Insert: {
          answer_id: string
          id?: string
          option_id: string
        }
        Update: {
          answer_id?: string
          id?: string
          option_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_answer_choices_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "survey_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_answer_choices_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "survey_question_options"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_answers: {
        Row: {
          id: string
          question_id: string
          response_id: string
          value_date: string | null
          value_number: number | null
          value_text: string | null
        }
        Insert: {
          id?: string
          question_id: string
          response_id: string
          value_date?: string | null
          value_number?: number | null
          value_text?: string | null
        }
        Update: {
          id?: string
          question_id?: string
          response_id?: string
          value_date?: string | null
          value_number?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "survey_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_question_options: {
        Row: {
          id: string
          label: string
          position: number
          question_id: string
        }
        Insert: {
          id?: string
          label: string
          position?: number
          question_id: string
        }
        Update: {
          id?: string
          label?: string
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          id: string
          kind: Database["public"]["Enums"]["survey_question_kind"]
          label: string
          position: number
          required: boolean
          survey_id: string
        }
        Insert: {
          id?: string
          kind: Database["public"]["Enums"]["survey_question_kind"]
          label: string
          position?: number
          required?: boolean
          survey_id: string
        }
        Update: {
          id?: string
          kind?: Database["public"]["Enums"]["survey_question_kind"]
          label?: string
          position?: number
          required?: boolean
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          id: string
          submitted_at: string
          survey_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          submitted_at?: string
          survey_id: string
          user_id?: string | null
        }
        Update: {
          id?: string
          submitted_at?: string
          survey_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          access_mode: Database["public"]["Enums"]["survey_access_mode"]
          anonymous: boolean
          archived_at: string | null
          archived_by: string | null
          audience: Database["public"]["Enums"]["survey_audience"]
          audience_role: Database["public"]["Enums"]["app_role"] | null
          closes_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          event_id: string | null
          id: string
          opens_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          access_mode?: Database["public"]["Enums"]["survey_access_mode"]
          anonymous?: boolean
          archived_at?: string | null
          archived_by?: string | null
          audience?: Database["public"]["Enums"]["survey_audience"]
          audience_role?: Database["public"]["Enums"]["app_role"] | null
          closes_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          opens_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          access_mode?: Database["public"]["Enums"]["survey_access_mode"]
          anonymous?: boolean
          archived_at?: string | null
          archived_by?: string | null
          audience?: Database["public"]["Enums"]["survey_audience"]
          audience_role?: Database["public"]["Enums"]["app_role"] | null
          closes_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          opens_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachments: Json
          author_avatar_url: string | null
          author_discord_id: string
          author_name: string
          author_nick: string | null
          content: string
          discord_id: string | null
          edited: boolean
          embeds: Json
          id: string
          is_bot: boolean
          reply_to_discord_id: string | null
          sent_at: string | null
          seq: number
          ticket_id: string
        }
        Insert: {
          attachments?: Json
          author_avatar_url?: string | null
          author_discord_id: string
          author_name: string
          author_nick?: string | null
          content?: string
          discord_id?: string | null
          edited?: boolean
          embeds?: Json
          id?: string
          is_bot?: boolean
          reply_to_discord_id?: string | null
          sent_at?: string | null
          seq: number
          ticket_id: string
        }
        Update: {
          attachments?: Json
          author_avatar_url?: string | null
          author_discord_id?: string
          author_name?: string
          author_nick?: string | null
          content?: string
          discord_id?: string | null
          edited?: boolean
          embeds?: Json
          id?: string
          is_bot?: boolean
          reply_to_discord_id?: string | null
          sent_at?: string | null
          seq?: number
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_participants: {
        Row: {
          discord_id: string
          id: string
          is_bot: boolean
          name: string | null
          subject_id: string | null
          ticket_id: string
        }
        Insert: {
          discord_id: string
          id?: string
          is_bot?: boolean
          name?: string | null
          subject_id?: string | null
          ticket_id: string
        }
        Update: {
          discord_id?: string
          id?: string
          is_bot?: boolean
          name?: string | null
          subject_id?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_participants_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "mod_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_participants_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subject_names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_participants_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          channel_id: string | null
          channel_name: string | null
          closed_at: string | null
          id: string
          message_count: number
          note: string | null
          opened_at: string | null
          server_id: string | null
          server_name: string | null
          ticket_number: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          channel_id?: string | null
          channel_name?: string | null
          closed_at?: string | null
          id?: string
          message_count?: number
          note?: string | null
          opened_at?: string | null
          server_id?: string | null
          server_name?: string | null
          ticket_number: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          channel_id?: string | null
          channel_name?: string | null
          closed_at?: string | null
          id?: string
          message_count?: number
          note?: string | null
          opened_at?: string | null
          server_id?: string | null
          server_name?: string | null
          ticket_number?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          permission: Database["public"]["Enums"]["app_permission"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission: Database["public"]["Enums"]["app_permission"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["app_permission"]
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      subject_names: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_shift_swap: { Args: { request_id: string }; Returns: undefined }
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"]
        }
        Returns: boolean
      }
      cancel_own_item_unavailability: {
        Args: { p_id: string }
        Returns: undefined
      }
      cancel_swap: { Args: { request_id: string }; Returns: undefined }
      canonical_subject_id: { Args: { p_id: string }; Returns: string }
      close_survey: { Args: { p_id: string }; Returns: undefined }
      complete_event: {
        Args: { present_subjects: string[]; target_event: string }
        Returns: undefined
      }
      decide_item_unavailability: {
        Args: { p_approve: boolean; p_id: string }
        Returns: undefined
      }
      finance_rollup: {
        Args: { p_event_id?: string; p_from?: string; p_to?: string }
        Returns: {
          bedrag: number
          bron: string
          categorie: string
          datum: string
          event_id: string
          event_naam: string
          id: string
          omschrijving: string
          richting: string
          status: Database["public"]["Enums"]["expense_status"]
        }[]
      }
      get_survey_for_fill: { Args: { p_id: string }; Returns: Json }
      get_survey_results: { Args: { p_id: string }; Returns: Json }
      hard_delete: {
        Args: { target_id: string; target_table: string }
        Returns: {
          bucket_id: string
          path: string
        }[]
      }
      item_available_on: {
        Args: { p_date: string; p_item: string }
        Returns: boolean
      }
      list_notifiable_members: {
        Args: never
        Returns: {
          id: string
          username: string
        }[]
      }
      merge_subjects: {
        Args: { p_from: string; p_into: string }
        Returns: undefined
      }
      my_assignment_item_names: {
        Args: never
        Returns: {
          item_id: string
          name: string
        }[]
      }
      my_badges: {
        Args: never
        Returns: {
          awarded_on: string
          description: string
          image_path: string
          title: string
        }[]
      }
      my_conduct_notes: {
        Args: never
        Returns: {
          created_at: string
          event_id: string
          kind: Database["public"]["Enums"]["conduct_kind"]
        }[]
      }
      my_open_surveys: {
        Args: never
        Returns: {
          closes_at: string
          question_count: number
          survey_id: string
          title: string
        }[]
      }
      my_permissions: {
        Args: never
        Returns: Database["public"]["Enums"]["app_permission"][]
      }
      my_subject_id: { Args: never; Returns: string }
      my_survey_history: {
        Args: never
        Returns: {
          submitted_at: string
          survey_id: string
          title: string
        }[]
      }
      my_warnings: {
        Args: never
        Returns: {
          color: Database["public"]["Enums"]["mod_warn_color"]
          issued_at: string
          reason: string
        }[]
      }
      open_survey: { Args: { p_id: string }; Returns: undefined }
      request_item_unavailability: {
        Args: {
          p_ends: string
          p_item: string
          p_reason: string
          p_starts: string
        }
        Returns: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          ends_on: string | null
          id: string
          item_id: string
          reason: string | null
          requested_by: string | null
          starts_on: string
          status: Database["public"]["Enums"]["unavailability_status"]
        }
        SetofOptions: {
          from: "*"
          to: "item_unavailability"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      review_expense: {
        Args: {
          p_id: string
          p_note?: string
          p_status: Database["public"]["Enums"]["expense_status"]
        }
        Returns: {
          account_holder: string | null
          activity_id: string | null
          amount_eur: number
          archived_at: string | null
          archived_by: string | null
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          description: string
          event_id: string | null
          iban: string | null
          id: string
          incurred_on: string
          receipt_path: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["expense_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "expenses"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      role_rank_of: { Args: { uid: string }; Returns: number }
      run_shift_reminders: { Args: never; Returns: undefined }
      set_packed: {
        Args: { assignment_id: string; packed: boolean }
        Returns: undefined
      }
      staff_overview: {
        Args: never
        Returns: {
          avatar_url: string
          discord_tag: string
          display_name: string
          next_shift_at: string
          next_shift_event_id: string
          next_shift_event_name: string
          open_warnings: number
          role: Database["public"]["Enums"]["app_role"]
          subject_id: string
          user_id: string
        }[]
      }
      subject_cluster_rank: { Args: { p_subject: string }; Returns: number }
      submit_survey_response: {
        Args: { p_answers: Json; p_id: string }
        Returns: string
      }
      survey_response_counts: {
        Args: never
        Returns: {
          response_count: number
          survey_id: string
        }[]
      }
      unmerge_subject: { Args: { p_id: string }; Returns: undefined }
    }
    Enums: {
      activity_venue: "stand" | "booth" | "stage" | "other"
      app_permission:
        | "pages.edit"
        | "pages.delete"
        | "structures.edit"
        | "media.manage"
        | "site.publish"
        | "moderation.view"
        | "moderation.manage"
        | "roles.manage"
        | "inventory.view"
        | "inventory.manage"
        | "expenses.view"
        | "expenses.manage"
        | "logs.view"
        | "badges.manage"
        | "records.delete"
        | "notifications.send"
        | "surveys.manage"
        | "staff.manage"
      app_role: "user" | "author" | "yakuza" | "admin" | "stand-staff"
      attendance_status:
        | "signed_up"
        | "expected"
        | "present"
        | "late"
        | "cancelled_late"
        | "no_show"
      conduct_kind: "late" | "last_minute_cancel" | "gear_not_ready" | "other"
      event_kind: "convention" | "event"
      expense_category: "travel" | "materials" | "food" | "stand" | "other"
      expense_status: "submitted" | "approved" | "rejected" | "reimbursed"
      income_category: "donation" | "sale" | "sponsorship" | "other"
      inventory_history_kind: "taken" | "returned" | "damaged" | "note"
      mod_ban_scope: "discord" | "convention" | "site"
      mod_link_status: "suspected" | "confirmed" | "rejected"
      mod_warn_color: "yellow" | "red"
      survey_access_mode: "public" | "authenticated"
      survey_audience: "all_users" | "role" | "event_attendees"
      survey_question_kind:
        | "rating_1_5"
        | "scale_0_10"
        | "yes_no"
        | "number"
        | "date"
        | "text"
        | "single_choice"
        | "multi_choice"
      unavailability_status: "active" | "requested" | "rejected"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_venue: ["stand", "booth", "stage", "other"],
      app_permission: [
        "pages.edit",
        "pages.delete",
        "structures.edit",
        "media.manage",
        "site.publish",
        "moderation.view",
        "moderation.manage",
        "roles.manage",
        "inventory.view",
        "inventory.manage",
        "expenses.view",
        "expenses.manage",
        "logs.view",
        "badges.manage",
        "records.delete",
        "notifications.send",
        "surveys.manage",
        "staff.manage",
      ],
      app_role: ["user", "author", "yakuza", "admin", "stand-staff"],
      attendance_status: [
        "signed_up",
        "expected",
        "present",
        "late",
        "cancelled_late",
        "no_show",
      ],
      conduct_kind: ["late", "last_minute_cancel", "gear_not_ready", "other"],
      event_kind: ["convention", "event"],
      expense_category: ["travel", "materials", "food", "stand", "other"],
      expense_status: ["submitted", "approved", "rejected", "reimbursed"],
      income_category: ["donation", "sale", "sponsorship", "other"],
      inventory_history_kind: ["taken", "returned", "damaged", "note"],
      mod_ban_scope: ["discord", "convention", "site"],
      mod_link_status: ["suspected", "confirmed", "rejected"],
      mod_warn_color: ["yellow", "red"],
      survey_access_mode: ["public", "authenticated"],
      survey_audience: ["all_users", "role", "event_attendees"],
      survey_question_kind: [
        "rating_1_5",
        "scale_0_10",
        "yes_no",
        "number",
        "date",
        "text",
        "single_choice",
        "multi_choice",
      ],
      unavailability_status: ["active", "requested", "rejected"],
    },
  },
} as const
