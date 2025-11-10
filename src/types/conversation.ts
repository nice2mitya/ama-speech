export interface ConversationItem {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
  status: 'transcribing' | 'processing' | 'completed' | 'error';
  error?: string;
}

export type RecordingState = 'idle' | 'listening' | 'speaking' | 'processing';
