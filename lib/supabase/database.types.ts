export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          name: string
          stakeholder_name: string
          stakeholder_role: string | null
          interview_date: string | null
          interview_method: string | null
          sector: string
          stage: string
          round_number: number | null
          research_question: string
          sorting_mode: string | null
          guided_mode: boolean | null
          consent_timestamp: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          stakeholder_name: string
          stakeholder_role?: string | null
          interview_date?: string | null
          interview_method?: string | null
          sector: string
          stage: string
          round_number?: number | null
          research_question: string
          sorting_mode?: string | null
          guided_mode?: boolean | null
          consent_timestamp?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          stakeholder_name?: string
          stakeholder_role?: string | null
          interview_date?: string | null
          interview_method?: string | null
          sector?: string
          stage?: string
          round_number?: number | null
          research_question?: string
          sorting_mode?: string | null
          guided_mode?: boolean | null
          consent_timestamp?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      boards: {
        Row: {
          id: string
          session_id: string
          clusters: Json
          last_edited_at: string | null
          version: number | null
        }
        Insert: {
          id?: string
          session_id: string
          clusters?: Json
          last_edited_at?: string | null
          version?: number | null
        }
        Update: {
          id?: string
          session_id?: string
          clusters?: Json
          last_edited_at?: string | null
          version?: number | null
        }
      }
      transcripts: {
        Row: {
          id: string
          session_id: string
          transcript_text: string
          source: string
          language: string | null
          processing_engine: string | null
          audio_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          transcript_text: string
          source: string
          language?: string | null
          processing_engine?: string | null
          audio_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          transcript_text?: string
          source?: string
          language?: string | null
          processing_engine?: string | null
          audio_url?: string | null
          created_at?: string | null
        }
      }
      extracted_cards: {
        Row: {
          id: string
          session_id: string
          card_id: string
          insight: string
          quote: string
          speaker: string | null
          timestamp: string | null
          sentiment: string
          confidence: string
          assertive: boolean | null
          theme: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          card_id: string
          insight: string
          quote: string
          speaker?: string | null
          timestamp?: string | null
          sentiment: string
          confidence: string
          assertive?: boolean | null
          theme?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          card_id?: string
          insight?: string
          quote?: string
          speaker?: string | null
          timestamp?: string | null
          sentiment?: string
          confidence?: string
          assertive?: boolean | null
          theme?: string | null
          created_at?: string | null
        }
      }
      confirmed_cards: {
        Row: {
          id: string
          session_id: string
          card_id: string
          insight: string
          quote: string
          speaker: string | null
          timestamp: string | null
          sentiment: string
          confidence: string
          assertive: boolean | null
          theme: string | null
          freq: number | null
          reviewed: boolean | null
          split_from: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          card_id: string
          insight: string
          quote: string
          speaker?: string | null
          timestamp?: string | null
          sentiment: string
          confidence: string
          assertive?: boolean | null
          theme?: string | null
          freq?: number | null
          reviewed?: boolean | null
          split_from?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          card_id?: string
          insight?: string
          quote?: string
          speaker?: string | null
          timestamp?: string | null
          sentiment?: string
          confidence?: string
          assertive?: boolean | null
          theme?: string | null
          freq?: number | null
          reviewed?: boolean | null
          split_from?: string | null
          created_at?: string | null
        }
      }
      comments: {
        Row: {
          id: string
          session_id: string
          target_type: string
          target_id: string
          author_name: string
          author_role: string | null
          comment_text: string
          created_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          target_type: string
          target_id: string
          author_name: string
          author_role?: string | null
          comment_text: string
          created_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          target_type?: string
          target_id?: string
          author_name?: string
          author_role?: string | null
          comment_text?: string
          created_at?: string | null
        }
      }
    }
  }
}
