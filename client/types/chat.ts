export interface ChatMessage {
  type: MessageType;
  id: number;
  conversationId: number;
  senderId: number;
  senderName?: string;
  senderImage?: string;
  content: string;
  timestamp?: string;
  isRead: boolean;
}

export enum MessageType {
  CHAT = 'CHAT',
  JOIN = 'JOIN',
  LEAVE = 'LEAVE',
  TYPING = 'TYPING',
  READ = 'READ',
  NOTIFICATION = 'NOTIFICATION'
} 