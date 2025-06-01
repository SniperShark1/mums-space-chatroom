import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Send, Heart, HelpCircle, MoreHorizontal, Volume2, UserX, MessageSquare, Info } from "lucide-react";
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
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [textSize, setTextSize] = useState("16");
  const [inputAreaHeight, setInputAreaHeight] = useState(120);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms = [] } = useQuery<ChatRoom[]>({
    queryKey: ['/api/chat/rooms'],
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<MessageWithUser[]>({
    queryKey: [`/api/chat/rooms/${activeRoomId}/messages`],
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
        queryKey: [`/api/chat/rooms/${activeRoomId}/messages`] 
      });
      refetchMessages();
      setNewMessage("");
      // Keep focus on input after clearing message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        variant: "destructive"
      });
    }
  });

  // Emoji replacements for common abbreviations
  const replaceWithEmojis = (text: string) => {
    const emojiMap: Record<string, string> = {
      'lol': '😂',
      'brb': '🏃‍♀️',
      'omg': '😱',
      'thanks': '🙏',
      'thank you': '🙏',
      'love': '❤️',
      'congrats': '🎉',
      'congratulations': '🎉',
      'hugs': '🤗',
      'good luck': '🍀',
      'sleepy': '😴',
      'tired': '😴',
      'angry': '😠',
      'mad': '😡',
      'frustrated': '😤',
      'crying': '😭',
      'happy': '😊',
      'sad': '😢',
      'excited': '🎉',
      'worried': '😰',
      'stressed': '😰',
      'exhausted': '😵',
      'confused': '😕',
      'shocked': '😲',
      'annoyed': '😒'
    };

    let result = text;
    Object.entries(emojiMap).forEach(([word, emoji]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, emoji);
    });
    return result;
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      const messageWithEmojis = replaceWithEmojis(newMessage);
      sendMessage.mutate(messageWithEmojis);
      // Keep focus on input field after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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

  // Check if user is at bottom of chat
  const checkIfAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollTop + clientHeight >= scrollHeight - 50; // 50px threshold
  };

  // Auto-scroll to bottom when new messages arrive (only if user is at bottom)
  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle scroll events to determine if we should auto-scroll
  const handleScroll = () => {
    setShouldAutoScroll(checkIfAtBottom());
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, shouldAutoScroll]);

  // Room change handler
  const handleRoomChange = (roomId: string) => {
    setActiveRoomId(roomId);
    setSearchUsers("");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-pink-100 to-pink-200 font-serif flex flex-col">
      {/* Top Bar */}
      <div className="w-full py-4 px-6 border-b-2 border-white flex items-center justify-between" style={{ backgroundColor: '#fcb3c4' }}>
        <div className="flex-1"></div>
        <h1 className="text-center text-white font-bold text-2xl font-serif">
          Mum's Space Chatroom
        </h1>
        <div className="flex-1 flex justify-end">
          <Button 
            className="hover:bg-blue-200 text-blue-800 rounded-full px-4 py-2 text-sm"
            style={{ backgroundColor: '#d5d8ed' }}
            onClick={handleAIHelp}
          >
            <HelpCircle size={14} className="mr-1" />
            AI Help
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Left Sidebar - Online Users - Resizable */}
        <div 
          className="flex flex-col border-r-2 border-white relative" 
          style={{ backgroundColor: '#fed1dc', width: `${sidebarWidth}px` }}
        >
          {/* Search and Controls */}
        <div className="p-4 space-y-3 border-b-2 border-white">
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

          {/* Online Count */}
          <div className="text-blue-800 px-3 py-1 rounded-full text-center font-medium text-sm" style={{ backgroundColor: '#d5d8ed' }}>
            {roomUsers.length} mums online
          </div>
          
          {/* Room Filter Dropdown */}
          <Select value={activeRoomId} onValueChange={handleRoomChange}>
            <SelectTrigger className="bg-pink-100 border-pink-200 rounded-full text-pink-800">
              <SelectValue placeholder="Select Room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id.toString()}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {/* Resize Handle */}
        <div 
          className="absolute right-0 top-0 h-full w-1 bg-white cursor-col-resize hover:bg-gray-300"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = sidebarWidth;
            
            const handleMouseMove = (e: MouseEvent) => {
              const newWidth = Math.max(200, Math.min(500, startWidth + (e.clientX - startX)));
              setSidebarWidth(newWidth);
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col relative h-full" style={{ backgroundColor: '#f7e6eb' }}>
        {/* Room Title Bar with Text Size */}
        <div className="bg-pink-200 p-2 border-b border-white flex items-center justify-between">
          <h2 className="text-lg font-bold text-pink-800">
            {activeRoom?.name || 'Chat Room'}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-pink-700">Text Size:</span>
            <Select value={textSize} onValueChange={setTextSize}>
              <SelectTrigger className="w-16 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="14">14</SelectItem>
                <SelectItem value="16">16</SelectItem>
                <SelectItem value="18">18</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="22">22</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="overflow-y-auto px-6 py-4 space-y-4"
          onScroll={handleScroll}
          style={{ 
            height: `calc(100vh - 120px - ${inputAreaHeight}px)`
          }}
        >
          {!messages || messages.length === 0 ? (
            <div className="text-center text-pink-500 py-8">
              <Heart size={48} className="mx-auto mb-4 text-pink-300" />
              <p className="text-lg">Start a conversation with other mums!</p>
              <p className="text-sm text-pink-400 mt-2">Room: {activeRoom?.name}</p>
            </div>
          ) : (
            messages
              .filter(message => !blockedUsers.includes(message.user?.username || ''))
              .map((message) => (
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
                  <div 
                    className="text-pink-700 leading-relaxed"
                    style={{ fontSize: `${textSize}px` }}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* Resizable Message Input */}
        <div 
          className="absolute bottom-0 left-0 right-0 border-t border-pink-200" 
          style={{ 
            backgroundColor: '#fed1dc',
            height: `${inputAreaHeight}px`
          }}
        >
          {/* Resize Handle */}
          <div 
            className="absolute top-0 left-0 right-0 h-1 bg-pink-300 cursor-row-resize hover:bg-pink-400"
            onMouseDown={(e) => {
              const startY = e.clientY;
              const startHeight = inputAreaHeight;
              
              const handleMouseMove = (e: MouseEvent) => {
                const newHeight = Math.max(80, Math.min(300, startHeight - (e.clientY - startY)));
                setInputAreaHeight(newHeight);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          
          <div className="flex items-center space-x-3 px-6 pt-6 pb-3">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={sendMessage.isPending}
              className="flex-1 rounded-full px-6 py-3 border-2 border-white outline-none focus:ring-2 focus:ring-pink-300"
              style={{ 
                backgroundColor: '#d5d8ed',
                color: '#000000',
                fontSize: '18px',
                fontWeight: '500'
              }}
            />
            <Button 
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMessage.isPending}
              className="bg-pink-300 hover:bg-pink-400 text-pink-800 rounded-full px-6 py-3 border-2 border-white"
            >
              <Send size={20} />
            </Button>
          </div>
          
          {/* Emoji Info Button */}
          <div className="flex justify-center px-6 pb-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-6 h-6 rounded-full bg-pink-200 hover:bg-pink-300 text-pink-700 p-0"
                >
                  <Info size={12} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 bg-pink-50 border-2 border-pink-200 rounded-lg shadow-lg">
                <div className="space-y-3">
                  <h4 className="font-bold text-pink-800 text-center text-sm">✨ Auto Emoji Magic ✨</h4>
                  <p className="text-xs text-pink-700 text-center">Type these words and they'll turn into emojis!</p>
                  
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="space-y-1">
                      <div><span className="text-pink-600">lol</span> → 😂</div>
                      <div><span className="text-pink-600">brb</span> → 🏃‍♀️</div>
                      <div><span className="text-pink-600">omg</span> → 😱</div>
                      <div><span className="text-pink-600">thanks</span> → 🙏</div>
                      <div><span className="text-pink-600">love</span> → ❤️</div>
                      <div><span className="text-pink-600">hugs</span> → 🤗</div>
                      <div><span className="text-pink-600">happy</span> → 😊</div>
                      <div><span className="text-pink-600">sad</span> → 😢</div>
                      <div><span className="text-pink-600">crying</span> → 😭</div>
                      <div><span className="text-pink-600">excited</span> → 🎉</div>
                      <div><span className="text-pink-600">congrats</span> → 🎉</div>
                    </div>
                    <div className="space-y-1">
                      <div><span className="text-pink-600">tired</span> → 😴</div>
                      <div><span className="text-pink-600">sleepy</span> → 😴</div>
                      <div><span className="text-pink-600">angry</span> → 😠</div>
                      <div><span className="text-pink-600">mad</span> → 😡</div>
                      <div><span className="text-pink-600">frustrated</span> → 😤</div>
                      <div><span className="text-pink-600">worried</span> → 😰</div>
                      <div><span className="text-pink-600">stressed</span> → 😰</div>
                      <div><span className="text-pink-600">exhausted</span> → 😵</div>
                      <div><span className="text-pink-600">confused</span> → 😕</div>
                      <div><span className="text-pink-600">shocked</span> → 😲</div>
                      <div><span className="text-pink-600">annoyed</span> → 😒</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-pink-600 text-center mt-3 space-y-2">
                    <p className="italic">Just type the word and it becomes an emoji! 💕</p>
                    <p className="border-t border-pink-200 pt-2 text-pink-700">
                      🔒 Messages are not saved permanently. Feel free to copy and paste the conversation before closing the window.
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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