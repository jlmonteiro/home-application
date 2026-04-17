export interface Notification {
  id: number;
  recipientId: number;
  senderId?: number;
  senderName?: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  recipientId: number;
  recipientName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}
