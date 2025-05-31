import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Baby, Blocks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatRoom, MessageWithUser } from "@shared/schema";

export default function BasicChat() {
  const [activeRoomId, setActiveRoomId] = useState("1");
  const [newMessage, setNewMessage] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms = [] } = useQuery<ChatRoom[]>({
    queryKey: ['/api/chat/rooms'],
  });

  const { data: messages = [] } = useQuery<MessageWithUser[]>({
    queryKey: ['/api/chat/rooms', activeRoomId, 'messages'],
    enabled: !!activeRoomId,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', `/api/chat/rooms/${activeRoomId}/messages`, {
        content,
        userId: 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/rooms', activeRoomId, 'messages'] 
      });
      setNewMessage("");
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        variant: "destructive"
      });
    }
  });

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage.mutate(newMessage);
    }
  };

  const activeRoom = rooms.find(room => room.id.toString() === activeRoomId);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center space-x-3 mb-4">
          <MessageCircle size={24} />
          <h1 className="text-xl font-bold">ParentConnect Chat</h1>
        </div>
        
        <div className="flex space-x-2">
          {rooms.map((room) => {
            const Icon = room.ageGroup === '0-1' ? Baby : Blocks;
            return (
              <button
                key={room.id}
                onClick={() => setActiveRoomId(room.id.toString())}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  activeRoomId === room.id.toString() 
                    ? 'bg-white bg-opacity-20' 
                    : 'bg-white bg-opacity-10 hover:bg-opacity-15'
                }`}
              >
                <Icon size={16} />
                <span>{room.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeRoom && (
        <div className="bg-blue-50 p-3 border-l-4 border-blue-600 mx-4 mt-4">
          <h3 className="font-medium text-blue-800">{activeRoom.name}</h3>
          <p className="text-sm text-blue-600">{activeRoom.description}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {message.user?.initials || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {message.user?.username || 'Unknown User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <p className="text-gray-800">{message.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={sendMessage.isPending}
            className="flex-1"
          />
          <Button 
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMessage.isPending}
            className="px-6"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}