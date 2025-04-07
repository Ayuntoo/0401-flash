export interface Position {
  x: number;
  y: number;
}

export interface MessageType {
  id: string;
  text: string;
  type: 'text' | 'audio' | 'image' | 'mixed';
  position: Position;
  color: 'blue' | 'purple' | 'cyan' | 'pink';
  size: 'sm' | 'md' | 'lg';
  created: number;
  senderName?: string;
  isFromCurrentUser?: boolean;
  replyTo?: string;
  audioId?: string;
  imageId?: string;
}

