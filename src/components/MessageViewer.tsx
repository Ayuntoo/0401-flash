import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageType } from '@/types';
import { MessageCircle, Unlock, CornerUpLeft, X, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { createMediaUrl } from '@/utils/storage';

interface MessageViewerProps {
  message: MessageType | null;
  isOpen: boolean;
  onClose: () => void;
  onRelease: () => void;
  onReply?: (text: string, color: string) => void;
  onUnlock?: () => void;
  isUnlocked?: boolean;
}

const MessageViewer: React.FC<MessageViewerProps> = ({ 
  message, 
  isOpen, 
  onClose, 
  onRelease,
  onReply,
  onUnlock,
  isUnlocked = false
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  if (!message) return null;
  
  // 如果没有解锁，只显示前两个字符
  const displayText = isUnlocked 
    ? message.text 
    : message.text && message.text.length > 2 
      ? `${message.text.substring(0, 2)}...` 
      : message.text;
  
  const handleUnlock = () => {
    if (onUnlock) {
      onUnlock();
    }
  };
  
  const handleToggleReply = () => {
    setIsReplying(!isReplying);
  };
  
  const handleReply = () => {
    if (replyText.trim() && onReply) {
      onReply(replyText, message.color);
      setReplyText('');
      setIsReplying(false);
      onClose();
    }
  };
  
  useEffect(() => {
    const loadMedia = async () => {
      // 清理旧的 URL
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
        setAudioSrc(null);
      }
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
        setImageSrc(null);
      }
      
      if (isUnlocked && message) {
        if (message.audioId) {
          try {
            const url = await createMediaUrl(message.audioId);
            setAudioSrc(url);
          } catch (err) {
            console.error('加载音频失败:', err);
          }
        }
        
        if (message.imageId) {
          try {
            const url = await createMediaUrl(message.imageId);
            setImageSrc(url);
          } catch (err) {
            console.error('加载图片失败:', err);
          }
        }
      }
    };
    
    loadMedia();
    
    // 清理函数
    return () => {
      if (audioSrc) URL.revokeObjectURL(audioSrc);
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [isUnlocked, message, message?.audioId, message?.imageId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/90 border border-cosmic-light/30 backdrop-blur-lg text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center glow-text text-xl">光波消息</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {message.text && (
            <div className="bg-gray-800/50 p-4 rounded-lg border border-cosmic-light/20">
              {!isUnlocked && (
                <div className="text-center mb-2 text-cyan-400/80">
                  <span className="text-xs">内容已锁定</span>
                </div>
              )}
              <p className="text-white whitespace-pre-wrap break-words">
                {displayText}
              </p>
            </div>
          )}
          
          {isUnlocked && audioSrc && (
            <div className="bg-gray-800/50 p-3 rounded-lg border border-cosmic-light/20">
              <audio controls src={audioSrc} className="w-full" />
            </div>
          )}
          
          {isUnlocked && imageSrc && (
            <div className="bg-gray-800/50 p-3 rounded-lg border border-cosmic-light/20">
              <img src={imageSrc} alt="光波图片" className="w-full max-h-60 object-contain rounded" />
            </div>
          )}
          
          {isReplying && (
            <div className="mt-2">
              <Textarea
                placeholder="输入回复内容..."
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
                  发送回复
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-400 text-center mb-2">
            <MessageCircle size={14} className="inline mr-1" />
            来自宇宙的回声
          </p>
        </div>
        
        <DialogFooter className="flex flex-wrap justify-between gap-2">
          {!isUnlocked ? (
            <>
              <Button 
                variant="outline"
                onClick={handleUnlock}
                className="bg-cyan-900/30 border-cyan-500/50 hover:bg-cyan-800/50 text-cyan-300"
              >
                <Unlock size={16} className="mr-2" />
                解锁
              </Button>
              
              <Button 
                onClick={onRelease}
                className="cosmic-button"
              >
                <Send size={16} className="mr-2" />
                扔回去
              </Button>
              
              <Button 
                onClick={onClose}
                variant="outline"
                className="bg-gray-800/70 border-cosmic-light/30 hover:bg-gray-700"
              >
                <X size={16} className="mr-2" />
                关闭
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant={isReplying ? "default" : "outline"}
                onClick={handleToggleReply}
                className={isReplying ? "bg-purple-700" : "bg-gray-800/70 border-cosmic-light/30 hover:bg-gray-700"}
              >
                <CornerUpLeft size={16} className="mr-2" />
                {isReplying ? "取消回复" : "回复"}
              </Button>
              
              <Button 
                onClick={onClose}
                variant="outline"
                className="bg-gray-800/70 border-cosmic-light/30 hover:bg-gray-700"
              >
                关闭
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageViewer;
