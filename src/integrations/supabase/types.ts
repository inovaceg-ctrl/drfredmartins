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
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string | null;
          slot_id: string | null;
          start_time: string;
          end_time: string | null;
          status: string;
          notes: string | null;
          video_room_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id?: string | null;
          slot_id?: string | null;
          start_time: string;
          end_time?: string | null;
          status?: string;
          notes?: string | null;
          video_room_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string | null;
          slot_id?: string | null;
          start_time?: string;
          end_time?: string | null;
          status?: string;
          notes?: string | null;
          video_room_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_slot_id_fkey";
            columns: ["slot_id"];
            isOneToOne: false;
            referencedRelation: "availability_slots";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          date_of_birth: string | null;
          whatsapp: string | null;
          state: string | null;
          city: string | null;
          avatar_url: string | null;
          updated_at: string | null;
          street: string | null;
          street_number: string | null;
          neighborhood: string | null;
          zip_code: string | null;
          specialty: string | null;
          created_at: string | null;
          phone: string | null;
          is_doctor: boolean | null;
          is_public: boolean | null;
          birth_date: string | null;
          // Novas colunas adicionadas
          mental_health_history: string | null;
          main_complaints: string | null;
          previous_diagnoses: string | null;
          current_medications: string | null;
          past_sessions_history: string | null;
          therapist_id: string | null;
          consent_status: boolean | null;
          consent_date: string | null;
          identification_document: string | null;
          responsible_parties: Json | null;
          emergency_contacts: Json | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          date_of_birth?: string | null;
          whatsapp?: string | null;
          state?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
          street?: string | null;
          street_number?: string | null;
          neighborhood?: string | null;
          zip_code?: string | null;
          specialty?: string | null;
          created_at?: string | null;
          phone?: string | null;
          is_doctor?: boolean | null;
          is_public?: boolean | null;
          birth_date?: string | null;
          // Novas colunas adicionadas
          mental_health_history?: string | null;
          main_complaints?: string | null;
          previous_diagnoses?: string | null;
          current_medications?: string | null;
          past_sessions_history?: string | null;
          therapist_id?: string | null;
          consent_status?: boolean | null;
          consent_date?: string | null;
          identification_document?: string | null;
          responsible_parties?: Json | null;
          emergency_contacts?: Json | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          date_of_birth?: string | null;
          whatsapp?: string | null;
          state?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
          street?: string | null;
          street_number?: string | null;
          neighborhood?: string | null;
          zip_code?: string | null;
          specialty?: string | null;
          created_at?: string | null;
          phone?: string | null;
          is_doctor?: boolean | null;
          is_public?: boolean | null;
          birth_date?: string | null;
          // Novas colunas adicionadas
          mental_health_history?: string | null;
          main_complaints?: string | null;
          previous_diagnoses?: string | null;
          current_medications?: string | null;
          past_sessions_history?: string | null;
          therapist_id?: string | null;
          consent_status?: boolean | null;
          consent_date?: string | null;
          identification_document?: string | null;
          responsible_parties?: Json | null;
          emergency_contacts?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string | null;
          role: string; // Assuming 'app_role' is a string enum like 'patient', 'doctor', 'admin'
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          role?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          role?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      availability_slots: {
        Row: {
          id: string;
          doctor_id: string;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "availability_slots_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      doctor_notes: {
        Row: {
          id: string;
          doctor_id: string;
          patient_id: string;
          notes: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          patient_id: string;
          notes: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          patient_id?: string;
          notes?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "doctor_notes_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "doctor_notes_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      whatsapp_transcriptions: {
        Row: {
          id: string;
          user_id: string;
          original_image_url: string | null;
          conversation_name: string | null;
          start_time: string | null;
          end_time: string | null;
          transcribed_text: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_image_url?: string | null;
          conversation_name?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          transcribed_text?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          original_image_url?: string | null;
          conversation_name?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          transcribed_text?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "whatsapp_transcriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      video_sessions: {
        Row: {
          id: string;
          user_id: string;
          room_id: string;
          status: string;
          started_at: string | null;
          ended_at: string | null;
          created_at: string | null;
          appointment_id: string | null;
          offer: Json | null;
          answer: Json | null;
          ice_candidates: Json | null;
          patient_id: string | null;
          doctor_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          room_id: string;
          status?: string;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string | null;
          appointment_id?: string | null;
          offer?: Json | null;
          answer?: Json | null;
          ice_candidates?: Json | null;
          patient_id?: string | null;
          doctor_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          room_id?: string;
          status?: string;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string | null;
          appointment_id?: string | null;
          offer?: Json | null;
          answer?: Json | null;
          ice_candidates?: Json | null;
          patient_id?: string | null;
          doctor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "video_sessions_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "video_sessions_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "video_sessions_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "video_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      documents: {
        Row: {
          id: string;
          patient_id: string;
          appointment_id: string | null;
          file_name: string;
          file_path: string;
          file_type: string;
          created_at: string | null;
          doctor_id: string | null;
        };
        Insert: {
          id?: string;
          patient_id: string;
          appointment_id?: string | null;
          file_name: string;
          file_path: string;
          file_type: string;
          created_at?: string | null;
          doctor_id?: string | null;
        };
        Update: {
          id?: string;
          patient_id?: string;
          appointment_id?: string | null;
          file_name?: string;
          file_path?: string;
          file_type?: string;
          created_at?: string | null;
          doctor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      medical_records: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          appointment_id: string | null;
          notes: string | null;
          diagnosis: string | null;
          prescription: string | null;
          created_at: string | null;
          updated_at: string | null;
          record_type: string | null; // Nova coluna
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          appointment_id?: string | null;
          notes?: string | null;
          diagnosis?: string | null;
          prescription?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          record_type?: string | null; // Nova coluna
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          appointment_id?: string | null;
          notes?: string | null;
          diagnosis?: string | null;
          prescription?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          record_type?: string | null; // Nova coluna
        };
        Relationships: [
          {
            foreignKeyName: "medical_records_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medical_records_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      patient_doctor_messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          appointment_id: string | null;
          content: string;
          created_at: string | null;
          is_read: boolean | null;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          appointment_id?: string | null;
          content: string;
          created_at?: string | null;
          is_read?: boolean | null;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          appointment_id?: string | null;
          content?: string;
          created_at?: string | null;
          is_read?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "patient_doctor_messages_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_doctor_messages_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_doctor_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: { // Adicionada a tabela messages
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string;
          content: string;
          is_read: boolean;
          created_at: string;
          date_of_birth: string | null;
          whatsapp: string | null;
          zip_code: string | null;
          state: string | null;
          city: string | null;
          receive_email_newsletter: boolean | null;
          receive_whatsapp_newsletter: boolean | null;
        };
        Insert: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
          date_of_birth?: string | null;
          whatsapp?: string | null;
          zip_code?: string | null;
          state?: string | null;
          city?: string | null;
          receive_email_newsletter?: boolean | null;
          receive_whatsapp_newsletter?: boolean | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string;
          content?: string;
          is_read?: boolean;
          created_at?: string;
          date_of_birth?: string | null;
          whatsapp?: string | null;
          zip_code?: string | null;
          state?: string | null;
          city?: string | null;
          receive_email_newsletter?: boolean | null;
          receive_whatsapp_newsletter?: boolean | null;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          patient_id: string;
          therapist_id: string;
          session_date: string;
          session_theme: string | null;
          interventions_used: string | null;
          notes: string | null;
          homework: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          patient_id: string;
          therapist_id: string;
          session_date: string;
          session_theme?: string | null;
          interventions_used?: string | null;
          notes?: string | null;
          homework?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          patient_id?: string;
          therapist_id?: string;
          session_date?: string;
          session_theme?: string | null;
          interventions_used?: string | null;
          notes?: string | null;
          homework?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      book_slot_and_create_appointment: {
        Args: {
          _slot_id: string;
          _patient_id: string;
          _doctor_id: string;
          _start_time: string;
          _end_time: string;
        };
        Returns: {
          appointment_id: string;
        }[];
      };
      get_doctors_public: {
        Args: {};
        Returns: {
          id: string;
          full_name: string | null;
          email: string | null;
          date_of_birth: string | null;
          whatsapp: string | null;
          state: string | null;
          city: string | null;
          avatar_url: string | null;
          updated_at: string | null;
          street: string | null;
          street_number: string | null;
          neighborhood: string | null;
          zip_code: string | null;
          specialty: string | null;
          created_at: string | null;
          phone: string | null;
          is_doctor: boolean | null;
          is_public: boolean | null;
          birth_date: string | null;
          // Novas colunas adicionadas
          mental_health_history: string | null;
          main_complaints: string | null;
          previous_diagnoses: string | null;
          current_medications: string | null;
          past_sessions_history: string | null;
          therapist_id: string | null;
          consent_status: boolean | null;
          consent_date: string | null;
          identification_document: string | null;
          responsible_parties: Json | null;
          emergency_contacts: Json | null;
        }[];
      };
      has_role: {
        Args: {
          _role: string; // Assuming 'app_role' is a string
          _user_id: string;
        };
        Returns: boolean;
      };
      get_truly_available_slots: {
        Args: {
          _doctor_id: string;
          _start_time_gte: string;
        };
        Returns: {
          id: string;
          doctor_id: string;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_at: string | null;
          updated_at: string | null;
        }[];
      };
      get_doctor_profiles_by_ids: {
        Args: {
          _ids: string[];
        };
        Returns: {
          id: string;
          full_name: string;
          created_at: string;
        }[];
      };
      get_patients_for_doctor: {
        Args: {};
        Returns: {
          id: string;
          full_name: string | null;
          email: string | null;
          date_of_birth: string | null;
          whatsapp: string | null;
          state: string | null;
          city: string | null;
          street: string | null;
          street_number: string | null;
          neighborhood: string | null;
          zip_code: string | null;
          created_at: string | null;
          phone: string | null;
          is_doctor: boolean | null;
          is_public: boolean | null;
          birth_date: string | null;
          mental_health_history: string | null;
          main_complaints: string | null;
          previous_diagnoses: string | null;
          current_medications: string | null;
          past_sessions_history: string | null;
          therapist_id: string | null;
          consent_status: boolean | null;
          consent_date: string | null;
          identification_document: string | null;
          responsible_parties: Json | null;
          emergency_contacts: Json | null;
        }[];
      };
      get_appointments_for_doctor: {
        Args: {}; // No arguments
        Returns: {
          id: string;
          patient_id: string;
          doctor_id: string;
          slot_id: string;
          start_time: string;
          end_time: string;
          status: string;
          notes: string;
          video_room_id: string;
          created_at: string;
          updated_at: string;
          patient_full_name: string;
          patient_whatsapp: string;
          patient_street: string;
          patient_street_number: string;
          patient_neighborhood: string;
          patient_city: string;
          patient_state: string;
          patient_zip_code: string;
        }[];
      };
      get_doctor_available_dates: { // Nova função RPC
        Args: {
          _doctor_id: string;
        };
        Returns: string[]; // Retorna um array de strings de data (ex: "YYYY-MM-DD")
      };
    };
    Enums: {
      app_role: "patient" | "doctor" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type PublicTableNameOrOptions =
  | keyof Database["public"]["Tables"]
  | { schema: "public", table: keyof Database["public"]["Tables"] }

export type Tables<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: "public", table: keyof Database["public"]["Tables"] }
> = PublicTableNameOrOptions extends { schema: "public", table: infer T }
  ? T extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][T]["Row"]
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions]["Row"]
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: "public", table: infer T }
> = PublicTableNameOrOptions extends { schema: "public", table: infer T }
  ? T extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][T]["Insert"]
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions]["Insert"]
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: "public", table: infer T }
> = PublicTableNameOrOptions extends { schema: "public", table: infer T }
    ? Database["public"]["Tables"][T]["Update"]
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions]["Update"]
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: "public", enum: keyof Database["public"]["Enums"] }
> = PublicEnumNameOrOptions extends { schema: "public", enum: infer T }
  ? T extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][T]
    : never
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never