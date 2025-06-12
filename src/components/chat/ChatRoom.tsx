import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { chatWebSocket } from "@/lib/supabase";
import RoomTabs from "./RoomTabs";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import UserAvatar from "./UserAvatar";
import type { ChatRoom, MessageWithUser } from "@shared/schema";

// Mock current user - in a real app, this would come from authentication
const CURRENT_USER = {
  id: 1,
  username: "Sarah M.",
  ageGroup: "0-1",
  initials: "SM",
  avatarColor: "blue"
};

export default function ChatRoom() {
  const [activeRoomId, setActiveRoomId] = useState<string>("1");
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCounts] = useState<Record<string, number>>({ "1": 12, "2": 8 });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat rooms
  const { data: rooms = [], isLoading: roomsLoading } = useQuery<ChatRoom[]>({
    queryKey: ['/api/chat/rooms'],
  });

  // Fetch messages for active room
  const { data: roomMessages = [], isLoading: messagesLoading } = useQuery<MessageWithUser[]>({
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
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Set up WebSocket connection
  useEffect(() => {
    chatWebSocket.connect();
    
    const unsubscribeConnection = chatWebSocket.onConnectionChange(setIsConnected);
    const unsubscribeMessages = chatWebSocket.onMessage((data) => {
      if (data.type === 'new_message' && data.message.roomId.toString() === activeRoomId) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    return () => {
      unsubscribeConnection();
      unsubscribeMessages();
    };
  }, []);

  // Join room when active room changes
  useEffect(() => {
    if (activeRoomId) {
      chatWebSocket.joinRoom(activeRoomId);
    }
  }, [activeRoomId]);

  // Update messages when room messages change
  useEffect(() => {
    if (roomMessages && Array.isArray(roomMessages)) {
      setMessages(roomMessages);
    }
  }, [roomMessages, activeRoomId]);

  const handleRoomChange = (roomId: string) => {
    setActiveRoomId(roomId);
  };

  const handleSendMessage = (content: string) => {
    sendMessageMutation.mutate(content);
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
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-surface shadow-lg">
      {/* Header */}
      <header className="bg-primary text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="text-xl" />
            <h1 className="text-lg font-semibold">ParentConnect Chat</h1>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-2 text-sm">
            <UserAvatar 
              initials={CURRENT_USER.initials}
              ageGroup={CURRENT_USER.ageGroup}
              color={CURRENT_USER.avatarColor}
            />
            <div className="hidden sm:block">
              <div className="font-medium">{CURRENT_USER.username}</div>
              <div className="text-xs opacity-90">Age Group: {CURRENT_USER.ageGroup}</div>
            </div>
          </div>
        </div>
        
        {/* Room Tabs */}
        <RoomTabs
          rooms={rooms}
          activeRoom={activeRoomId}
          onRoomChange={handleRoomChange}
          onlineCounts={onlineCounts}
        />
      </header>

      {/* Chat Content */}
      <MessageList
        messages={messages}
        currentUserId={CURRENT_USER.id}
        currentRoom={activeRoom}
      />

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sendMessageMutation.isPending || !isConnected}
        isConnected={isConnected}
        onlineCount={onlineCounts[activeRoomId] || 0}
      />
    </div>
  );
}
