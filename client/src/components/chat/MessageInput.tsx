import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Bell, BellOff, Settings } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  isConnected?: boolean;
  onlineCount?: number;
}

export default function MessageInput({ 
  onSendMessage, 
  disabled = false, 
  isConnected = false,
  onlineCount = 0 
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 500;

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    
    onSendMessage(message.trim());
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
    }
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 96) + 'px'; // Max 4 rows
  };

  return (
    <div className="border-t border-gray-200 bg-surface p-4">
      <div className="flex items-end space-x-3">
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full"
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4 text-text-secondary" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="resize-none min-h-[44px] max-h-24 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            disabled={disabled}
            rows={1}
          />
          
          {/* Character Count */}
          <div className={`absolute right-3 bottom-2 text-xs ${
            message.length > 450 ? 'text-error' : 'text-text-secondary'
          }`}>
            {message.length}/{maxLength}
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 bg-primary hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full p-0 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transform hover:scale-105"
        >
          <Send className="h-4 w-4 text-white" />
        </Button>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-success' : 'bg-error'
            }`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <span>•</span>
          <span>{onlineCount} members online</span>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-text-secondary hover:text-primary"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-text-secondary hover:text-primary"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
