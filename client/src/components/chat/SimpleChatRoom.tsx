import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Baby, Blocks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatRoom, MessageWithUser } from "@shared/schema";

// Mock current user
const CURRENT_USER = {
  id: 1,
  username: "Sarah M.",
  ageGroup: "0-1",
  initials: "SM",
  avatarColor: "blue"
};

export default function SimpleChatRoom() {
  const [activeRoomId, setActiveRoomId] = useState<string>("1");
  const [message, setMessage] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat rooms
  const { data: rooms = [], isLoading: roomsLoading } = useQuery<ChatRoom[]>({
    queryKey: ['/api/chat/rooms'],
  });

  // Fetch messages for active room
  const { data: roomMessages = [] } = useQuery<MessageWithUser[]>({
    queryKey: ['/api/chat/rooms', activeRoomId, 'messages'],
    enabled: !!activeRoomId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', `/api/chat/rooms/${activeRoomId}/messages`, {
        content,
        userId: CURRENT_USER.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/rooms', activeRoomId, 'messages'] 
      });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeRoom = rooms.find((room: ChatRoom) => room.id.toString() === activeRoomId);

  if (roomsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-text-primary font-medium">Loading chat...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-surface">
      {/* Header */}
      <header className="bg-primary text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="text-xl" />
            <h1 className="text-lg font-semibold">ParentConnect Chat</h1>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
              {CURRENT_USER.initials}
            </div>
            <div className="hidden sm:block">
              <div className="font-medium">{CURRENT_USER.username}</div>
              <div className="text-xs opacity-90">Age Group: {CURRENT_USER.ageGroup}</div>
            </div>
          </div>
        </div>
        
        {/* Room Tabs */}
        <div className="flex mt-3 space-x-1">
          {rooms.map((room) => {
            const Icon = room.ageGroup === '0-1' ? Baby : Blocks;
            const isActive = activeRoomId === room.id.toString();
            
            return (
              <button
                key={room.id}
                onClick={() => setActiveRoomId(room.id.toString())}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-white bg-opacity-20 text-white' 
                    : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                }`}
              >
                <Icon className="inline w-4 h-4 mr-2" />
                {room.name}
              </button>
            );
          })}
        </div>
      </header>

      {/* Room Welcome Banner */}
      {activeRoom && (
        <div className="bg-blue-50 border-l-4 border-primary p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="text-primary mt-0.5 mr-3">ℹ️</div>
            <div>
              <h3 className="text-sm font-medium text-primary">
                Welcome to the {activeRoom.name} Chatroom
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                {activeRoom.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {roomMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          roomMessages.map((msg) => {
            const isCurrentUser = msg.userId === CURRENT_USER.id;
            
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isCurrentUser ? 'justify-end' : ''}`}
              >
                {!isCurrentUser && (
                  <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {msg.user?.initials || 'U'}
                  </div>
                )}
                
                <div className={`flex-1 max-w-xs sm:max-w-md ${isCurrentUser ? 'flex flex-col items-end' : ''}`}>
                  <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                    {!isCurrentUser && (
                      <>
                        <span className="text-sm font-medium text-text-primary">
                          {msg.user?.username || 'Unknown'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          {msg.user?.ageGroup || '0-1'}
                        </span>
                      </>
                    )}
                    <span className="text-xs text-text-secondary">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isCurrentUser && (
                      <>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-primary">
                          {CURRENT_USER.ageGroup}
                        </span>
                        <span className="text-sm font-medium text-text-primary">You</span>
                      </>
                    )}
                  </div>
                  
                  <div className={`px-4 py-2 rounded-2xl ${
                    isCurrentUser 
                      ? 'bg-primary text-white rounded-tr-md' 
                      : 'bg-gray-100 text-text-primary rounded-tl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
                
                {isCurrentUser && (
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {CURRENT_USER.initials}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-surface p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="resize-none min-h-[44px] max-h-24 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={sendMessageMutation.isPending}
              rows={1}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="flex-shrink-0 w-10 h-10 bg-primary hover:bg-blue-600 disabled:bg-gray-300 rounded-full p-0"
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}