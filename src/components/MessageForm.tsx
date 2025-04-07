
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Mic, Image, Send, X } from 'lucide-react';
import { toast } from "sonner";

interface MessageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: {
    text: string;
    image?: string;
    audio?: string;
    type: 'text' | 'image' | 'audio' | 'mixed';
  }) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error("Image is too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle audio recording
  const handleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      });

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 10000);
      
      // Store mediaRecorder to stop it later
      (window as any).mediaRecorder = mediaRecorder;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    const mediaRecorder = (window as any).mediaRecorder;
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    if (!text && !image && !audioUrl) {
      toast.error("Please add text, image, or audio");
      return;
    }

    // Determine message type
    let type: 'text' | 'image' | 'audio' | 'mixed' = 'text';
    if (image && !text && !audioUrl) type = 'image';
    if (audioUrl && !text && !image) type = 'audio';
    if ((text && image) || (text && audioUrl) || (image && audioUrl) || (text && image && audioUrl)) type = 'mixed';

    onSubmit({
      text,
      image: image || undefined,
      audio: audioUrl || undefined,
      type
    });

    // Reset form
    setText('');
    setImage(null);
    setAudioUrl(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/90 border border-cosmic-light/30 backdrop-blur-lg text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center glow-text text-xl">Create Cosmic Echo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea 
            placeholder="Type your message..." 
            className="bg-gray-800/50 border-cosmic-light/30 text-white placeholder:text-gray-400 resize-none h-24"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          {image && (
            <div className="relative">
              <img src={image} alt="Selected" className="w-full h-32 object-cover rounded-md" />
              <Button 
                size="icon" 
                variant="destructive" 
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                onClick={() => setImage(null)}
              >
                <X size={14} />
              </Button>
            </div>
          )}
          
          {audioUrl && (
            <div className="flex items-center justify-between bg-gray-800/50 rounded-md p-2">
              <audio src={audioUrl} controls className="h-8 w-full" />
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 text-red-400 hover:text-red-500"
                onClick={() => setAudioUrl(null)}
              >
                <X size={14} />
              </Button>
            </div>
          )}
          
          <div className="flex gap-2 justify-between">
            <div className="flex gap-2">
              <Button 
                onClick={() => imageInputRef.current?.click()} 
                size="icon" 
                variant="outline"
                className="bg-gray-800/70 border-cosmic-light/30 hover:bg-gray-700"
              >
                <Image size={18} className="text-cosmic-cyan" />
                <input 
                  type="file" 
                  ref={imageInputRef} 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </Button>
              
              <Button 
                onClick={handleRecording} 
                size="icon" 
                variant={isRecording ? "destructive" : "outline"}
                className={isRecording ? "" : "bg-gray-800/70 border-cosmic-light/30 hover:bg-gray-700"}
              >
                <Mic size={18} className={isRecording ? "animate-pulse" : "text-cosmic-cyan"} />
              </Button>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              className="cosmic-button px-4 py-2"
            >
              <Send size={18} className="mr-2" />
              Send Echo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageForm;
