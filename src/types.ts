
export interface Position {
  x: number;
  y: number;
}

export interface MessageType {
  id: string;
  text?: string;
  image?: string;
  audio?: string;
  type: 'text' | 'image' | 'audio' | 'mixed';
  position: Position;
  color: 'blue' | 'purple' | 'cyan' | 'pink';
  size: 'sm' | 'md' | 'lg';
  created: number;
  senderName?: string;
  replyTo?: string;
}

