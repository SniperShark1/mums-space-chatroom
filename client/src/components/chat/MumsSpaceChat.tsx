import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Send, Heart, HelpCircle, MoreHorizontal, Volume2, UserX, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AIHelpModal from "./AIHelpModal";
import type { ChatRoom, MessageWithUser, User } from "@shared/schema";

export default function MumsSpaceChat() {
  const [activeRoomId, setActiveRoomId] = useState("1");
  const [newMessage, setNewMessage] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [privateChatUser, setPrivateChatUser] = useState<string | null>(null);
  const [isAIHelpOpen, setIsAIHelpOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms = [] } = useQuery<ChatRoom[]>({
    queryKey: ['/api/chat/rooms'],
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<MessageWithUser[]>({
    queryKey: ['/api/chat/rooms', activeRoomId, 'messages'],
    enabled: !!activeRoomId,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', `/api/chat/rooms/${activeRoomId}/messages`, {
        content,
        userId: 1
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/rooms', activeRoomId, 'messages'] 
      });
      refetchMessages();
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

  // All users data
  const allUsers = [
    { name: "Emma", initials: "E", ageGroup: "mums-to-be" },
    { name: "Olivia", initials: "O", ageGroup: "mums-to-be" },
    { name: "Sarah", initials: "S", ageGroup: "0-1" },
    { name: "Jessica", initials: "J", ageGroup: "0-1" },
    { name: "Rachel", initials: "R", ageGroup: "0-1" },
    { name: "Megan", initials: "M", ageGroup: "2-5" },
    { name: "Victoria", initials: "V", ageGroup: "2-5" },
    { name: "Sophia", initials: "S", ageGroup: "2-5" }
  ];

  // Filter users for display (separate from room logic)
  const roomUsers = allUsers.filter(user => {
    const matchesRoom = user.ageGroup === activeRoom?.ageGroup;
    const matchesSearch = user.name.toLowerCase().includes(searchUsers.toLowerCase());
    const notBlocked = !blockedUsers.includes(user.name);
    return matchesRoom && matchesSearch && notBlocked;
  });

  // Update messages when room changes (independent of user blocking state)
  useEffect(() => {
    if (activeRoomId) {
      refetchMessages();
    }
  }, [activeRoomId, refetchMessages]);

  // Handler functions for user interactions
  const handleMuteUser = (userName: string) => {
    setMutedUsers(prev => 
      prev.includes(userName) 
        ? prev.filter(u => u !== userName)
        : [...prev, userName]
    );
    toast({
      title: mutedUsers.includes(userName) ? "User unmuted" : "User muted",
      description: `${userName} has been ${mutedUsers.includes(userName) ? 'unmuted' : 'muted'}`,
    });
  };

  const handleBlockUser = (userName: string) => {
    setBlockedUsers(prev => 
      prev.includes(userName) 
        ? prev.filter(u => u !== userName)
        : [...prev, userName]
    );
    toast({
      title: blockedUsers.includes(userName) ? "User unblocked" : "User blocked",
      description: `${userName} has been ${blockedUsers.includes(userName) ? 'unblocked' : 'blocked'}`,
    });
  };

  const handlePrivateChat = (userName: string) => {
    setPrivateChatUser(userName);
    toast({
      title: "Private chat initiated",
      description: `Starting private conversation with ${userName}`,
    });
  };

  const handleAIHelp = () => {
    setIsAIHelpOpen(true);
  };

  const handleRoomChange = (roomId: string) => {
    setActiveRoomId(roomId);
    // Clear any room-specific states when switching
    setSearchUsers("");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-pink-100 to-pink-200 font-serif flex flex-col">
      {/* Top Bar */}
      <div className="w-full py-4 px-6 border-b-2 border-white" style={{ backgroundColor: '#fcb3c4' }}>
        <h1 className="text-center text-white font-bold text-2xl font-serif">
          Mum's Space Chatroom
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Left Sidebar - Online Users */}
        <div className="w-80 flex flex-col" style={{ backgroundColor: '#fed1dc' }}>
          {/* Header with Logo */}
        <div className="p-6 border-b-2 border-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-pink-300 rounded-full flex items-center justify-center">
              <Heart className="text-pink-600" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-pink-800">Mum's Space</h1>
          </div>
          
          {/* Search Users */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400" size={16} />
            <Input
              value={searchUsers}
              onChange={(e) => setSearchUsers(e.target.value)}
              placeholder="Search users..."
              className="pl-10 bg-white/80 border-pink-200 rounded-full text-pink-800 placeholder-pink-400"
            />
          </div>

          {/* Online Count and Filter - Same Row */}
          <div className="flex items-center space-x-3 pb-3 border-b-2 border-white">
            <div className="text-blue-800 px-4 py-2 rounded-full text-center font-medium" style={{ backgroundColor: '#d5d8ed' }}>
              {roomUsers.length} mums online
            </div>
            
            <Select defaultValue="all">
              <SelectTrigger className="bg-pink-100 border-pink-200 rounded-full text-pink-800 w-32">
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
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {roomUsers.map((user, index) => (
            <div key={index} className="flex items-center justify-between p-2 hover:bg-pink-100/50 rounded-lg transition-colors group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-300 rounded-full flex items-center justify-center text-pink-700 font-medium">
                  {user.initials}
                </div>
                <span className="text-pink-800 font-medium">{user.name}</span>
              </div>
              
              {/* User Options Popup */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  >
                    <MoreHorizontal size={16} className="text-pink-600" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" side="right">
                  <div className="space-y-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-pink-700 hover:bg-pink-50"
                      onClick={() => handleMuteUser(user.name)}
                    >
                      <Volume2 size={16} className="mr-2" />
                      {mutedUsers.includes(user.name) ? 'Unmute' : 'Mute'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-pink-700 hover:bg-pink-50"
                      onClick={() => handleBlockUser(user.name)}
                    >
                      <UserX size={16} className="mr-2" />
                      {blockedUsers.includes(user.name) ? 'Unblock' : 'Block'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-pink-700 hover:bg-pink-50"
                      onClick={() => handlePrivateChat(user.name)}
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Private Chat
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ))}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f7e6eb' }}>
        {/* Top Header with AI Help */}
        <div className="bg-pink-50/90 backdrop-blur-sm border-b border-pink-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-pink-800">AI Chatroom</h2>
            <Button 
              className="hover:bg-blue-200 text-blue-800 rounded-full px-6"
              style={{ backgroundColor: '#d5d8ed' }}
              onClick={handleAIHelp}
            >
              <HelpCircle size={16} className="mr-2" />
              AI Help
            </Button>
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
              className="flex-1 rounded-full px-6 py-3 text-blue-800 placeholder-blue-500 text-lg"
              style={{ backgroundColor: '#d5d8ed', borderColor: '#fed1dc', borderWidth: '2px' }}
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

      {/* AI Help Modal */}
      <AIHelpModal 
        isOpen={isAIHelpOpen} 
        onClose={() => setIsAIHelpOpen(false)} 
      />
    </div>
  );
}