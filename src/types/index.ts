export interface Agent {
  id: number;
  name: string;
  type: 'legal' | 'finance' | 'hr' | 'ir';
  api_url: string;
  api_key: string;
  model: string;
  system_prompt: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBase {
  id: number;
  agent_id: number;
  file_name: string;
  file_type: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

export interface Conversation {
  id: number;
  agent_id: number;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Session {
  id: string;
  agent_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MessageAttachment {
  id: number;
  conversation_id: number;
  file_name: string;
  file_type: string;
  file_content: string;
  file_size: number;
  created_at: string;
}

export interface Env {
  DB: D1Database;
  DOCUMENTS?: R2Bucket;
  ENVIRONMENT: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  message: string;
  session_id: string;
  agent_id: number;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}
