import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Send, Heart, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ChatRoom, MessageWithUser, User } from "@shared/schema";

export default function MumsSpaceChat() {
  const [activeRoomId, setActiveRoomId] = useState("1");
  const [newMessage, setNewMessage] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  
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

  // Mock online users based on the design
  const onlineUsers = [
    { name: "Emma", initials: "E" },
    { name: "Sarah", initials: "S" },
    { name: "Jessica", initials: "J" },
    { name: "Megan", initials: "M" },
    { name: "Victoria", initials: "V" },
    { name: "Sophia", initials: "S" }
  ];

  const filteredUsers = onlineUsers.filter(user => 
    user.name.toLowerCase().includes(searchUsers.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-100 to-pink-200 font-serif">
      {/* Left Sidebar - Online Users */}
      <div className="w-80 bg-pink-50/90 backdrop-blur-sm border-r border-pink-200 flex flex-col">
        {/* Header with Logo */}
        <div className="p-6 border-b border-pink-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-pink-300 rounded-full flex items-center justify-center">
              <Heart className="text-pink-600" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-pink-800">Mum's Space</h1>
          </div>
          
          {/* Search Users */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400" size={16} />
            <Input
              value={searchUsers}
              onChange={(e) => setSearchUsers(e.target.value)}
              placeholder="Search users..."
              className="pl-10 bg-white/80 border-pink-200 rounded-full text-pink-800 placeholder-pink-400"
            />
          </div>
        </div>

        {/* Online Count and Filter */}
        <div className="p-4 space-y-3">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-center font-medium">
            {filteredUsers.length} mums online
          </div>
          
          <Select defaultValue="all">
            <SelectTrigger className="bg-pink-100 border-pink-200 rounded-full text-pink-800">
              <SelectValue placeholder="Show All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Show All</SelectItem>
              <SelectItem value="mums-to-be">Mums-to-Be</SelectItem>
              <SelectItem value="0-1">0-1 Years</SelectItem>
              <SelectItem value="2-5">2-5 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredUsers.map((user, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 hover:bg-pink-100/50 rounded-lg cursor-pointer transition-colors">
              <div className="w-10 h-10 bg-pink-300 rounded-full flex items-center justify-center text-pink-700 font-medium">
                {user.initials}
              </div>
              <span className="text-pink-800 font-medium">{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header with AI Help */}
        <div className="bg-pink-50/90 backdrop-blur-sm border-b border-pink-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-pink-800">AI Chatroom</h2>
            <Button className="bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full px-6">
              <HelpCircle size={16} className="mr-2" />
              AI Help
            </Button>
          </div>

          {/* Age Group Tabs */}
          <div className="flex space-x-2 mt-4">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setActiveRoomId(room.id.toString())}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeRoomId === room.id.toString()
                    ? 'bg-pink-200 text-pink-800 shadow-sm'
                    : 'bg-pink-100/50 text-pink-600 hover:bg-pink-150'
                }`}
              >
                {room.name}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-pink-500 py-8">
              <Heart size={48} className="mx-auto mb-4 text-pink-300" />
              <p className="text-lg">Start a conversation with other mums!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex space-x-3">
                <div className="w-12 h-12 bg-pink-300 rounded-full flex items-center justify-center text-pink-700 font-medium flex-shrink-0">
                  {message.user?.initials || 'M'}
                </div>
                <div className="flex-1">
                  <div className="mb-1">
                    <span className="font-bold text-pink-800 text-lg">
                      {message.user?.username || 'Mum'}
                    </span>
                  </div>
                  <div className="text-pink-700 leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 bg-pink-50/90 backdrop-blur-sm border-t border-pink-200">
          <div className="flex space-x-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={sendMessage.isPending}
              className="flex-1 bg-blue-100/80 border-blue-200 rounded-full px-6 py-3 text-blue-800 placeholder-blue-500 text-lg"
            />
            <Button 
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMessage.isPending}
              className="bg-pink-300 hover:bg-pink-400 text-pink-800 rounded-full px-6 py-3"
            >
              <Send size={20} />
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <span className="text-pink-500 text-sm">Are we missing anything?</span>
          </div>
        </div>
      </div>
    </div>
  );
}