
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageType } from '@/types';
import { Send, MessageCircle, Unlock, CornerUpLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface MessageViewerProps {
  message: MessageType | null;
  isOpen: boolean;
  onClose: () => void;
  onRelease: () => void;
  onReply?: (originalMessage: MessageType, replyText: string) => void;
}

const MessageViewer: React.FC<MessageViewerProps> = ({ 
  message, 
  isOpen, 
  onClose, 
  onRelease,
  onReply 
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  if (!message) return null;
  
  // Get only first 2 characters if not unlocked
  const displayText = isUnlocked 
    ? message.text 
    : message.text && message.text.length > 2 
      ? `${message.text.substring(0, 2)}...` 
      : message.text;
  
  const handleUnlock = () => {
    setIsUnlocked(true);
  };
  
  const handleToggleReply = () => {
    setIsReplying(!isReplying);
  };
  
  const handleReply = () => {
    if (replyText.trim() && message && onReply) {
      onReply(message, replyText);
      setReplyText('');
      setIsReplying(false);
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/90 border border-cosmic-light/30 backdrop-blur-lg text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center glow-text text-xl">Captured Echo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {message.text && (
            <div className="bg-gray-800/50 p-4 rounded-lg border border-cosmic-light/20">
              {!isUnlocked && (
                <div className="text-center mb-2 text-cyan-400/80">
                  <span className="text-xs">Content Locked</span>
                </div>
              )}
              <p className="text-white whitespace-pre-wrap break-words">
                {displayText}
              </p>
            </div>
          )}
          
          {isUnlocked && message.image && (
            <div className="mt-4">
              <img 
                src={message.image} 
                alt="Message attachment" 
                className="w-full rounded-lg object-contain max-h-60"
              />
            </div>
          )}
          
          {isUnlocked && message.audio && (
            <div className="bg-gray-800/50 p-3 rounded-lg border border-cosmic-light/20">
              <audio controls src={message.audio} className="w-full" />
            </div>
          )}
          
          {isReplying && (
            <div className="mt-2">
              <Textarea
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="bg-gray-800/70 border-cosmic-light/30 text-white placeholder:text-gray-400 resize-none h-24"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={handleReply}
                  className="cosmic-button"
                  disabled={!replyText.trim()}
                >
                  <CornerUpLeft size={16} className="mr-2" />
                  Send Reply
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-400 text-center mb-2">
            <MessageCircle size={14} className="inline mr-1" />
            Echo received from the cosmos
          </p>
        </div>
        
        <DialogFooter className="flex flex-wrap justify-between gap-2">
          {!isUnlocked && (
            <Button 
              variant="outline"
              onClick={handleUnlock}
              className="bg-cyan-900/30 border-cyan-500/50 hover:bg-cyan-800/50 text-cyan-300"
            >
              <Unlock size={16} className="mr-2" />
              Unlock
            </Button>
          )}
          
          {isUnlocked && (
            <Button 
              variant={isReplying ? "default" : "outline"}
              onClick={handleToggleReply}
              className={isReplying ? "bg-purple-700" : "bg-gray-800/70 border-cosmic-light/30 hover:bg-gray-700"}
            >
              <CornerUpLeft size={16} className="mr-2" />
              {isReplying ? "Cancel Reply" : "Reply"}
            </Button>
          )}
          
          <Button 
            onClick={onClose}
            variant="outline"
            className="bg-gray-800/70 border-cosmic-light/30 hover:bg-gray-700"
          >
            Close
          </Button>
          
          <Button 
            onClick={onRelease}
            className="cosmic-button"
          >
            <Send size={16} className="mr-2" />
            Throw Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageViewer;
