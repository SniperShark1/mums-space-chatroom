import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Baby, Users, MessageCircle, Send, Search, HelpCircle, Info } from 'lucide-react';
import MessageList from './MessageList';
import CreateGroupModal from './CreateGroupModal';
import AIHelpModal from './AIHelpModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { chatWebSocket } from '@/lib/supabase';
import { apiRequest } from '@/lib/queryClient';

// Import emoji assets
import LOLEmojiPath from '@assets/LOL_transparent.png';
import CryingEmojiPath from '@assets/Crying_transparent.png';
import ExcitedEmojiPath from '@assets/Excited_transparent.png';
import LoveEmojiPath from '@assets/Love.png';
import TiredEmojiPath from '@assets/Tired.png';
import StressedEmojiPath from '@assets/Stressed.png';
import WorriedEmojiPath from '@assets/worried.png';
import AnnoyedEmojiPath from '@assets/Annoyed.png';
import HugsEmojiPath from '@assets/Hugs.png';
import ThanksEmojiPath from '@assets/Thanks.png';
import OMGEmojiPath from '@assets/OMG.png';
import BRBEmojiPath from '@assets/BRB.png';

export default function MumsSpaceChat() {
  // State management
  const [newMessage, setNewMessage] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAIHelpOpen, setIsAIHelpOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState('1');
  const [isConnected, setIsConnected] = useState(false);
  const [textSize, setTextSize] = useState('16');
  const [searchUsers, setSearchUsers] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(300);

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  // Queries
  const { data: rooms = [] } = useQuery({
    queryKey: ['/api/chat/rooms'],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/chat/rooms', activeRoomId, 'messages'],
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Mutations
  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      apiRequest(`/api/chat/rooms/${activeRoomId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content, userId: 1 }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/chat/rooms', activeRoomId, 'messages'],
      });
      setNewMessage('');
      inputRef.current?.focus();
    },
  });

  // Get active room and users
  const activeRoom = rooms.find((room: any) => room.id.toString() === activeRoomId);
  const roomUsers = users.filter((user: any) => user.ageGroup === activeRoom?.ageGroup || activeRoom?.isPrivateGroup);

  // Message handling with emoji replacement
  const processEmojiReplacements = (text: string): string => {
    const emojiMap: Record<string, string> = {
      'lol': `<img src="${LOLEmojiPath}" alt="😂" class="inline-block w-6 h-6 align-middle mx-1" />`,
      'crying': `<img src="${CryingEmojiPath}" alt="😭" class="inline-block w-6 h-6 align-middle mx-1" />`,
      'excited': `<img src="${ExcitedEmojiPath}" alt="🎉" class="inline-block w-6 h-6 align-middle mx-1" />`,
      'love': `<img src="${LoveEmojiPath}" alt="❤️" class="inline-block w-6 h-6 align-middle mx-1" />`,
      'tired': `<img src="${TiredEmojiPath}" alt="😴" class="inline-block w-6 h-6 align-middle mx-1" />`,
      'stressed': `<img src="${StressedEmojiPath}" alt="😰" class="inline-block w-6 h-6 align-middle mx-1" />`,
      'worried': `<img src="${WorriedEmojiPath}" alt="😟" class="inline-block w-6 h-6 align-middle mx-1" />`,
      'annoyed': `<img src="${AnnoyedEmojiPath}" alt="😤" class="inline-block w-6 h-6 align-middle mx-1" />`,
      'hugs': `<img src="${HugsEmojiPath}" alt="🤗" class="inline-block w-6 h-6 align-middle mx-1" />`,
      'thanks': `<img src="${ThanksEmojiPath}" alt="🙏" class="inline-block w-6 h-6 align-middle mx-1" />`,
      'omg': `<img src="${OMGEmojiPath}" alt="😱" class="inline-block w-6 h-6 align-middle mx-1" />`,
      'brb': `<img src="${BRBEmojiPath}" alt="🏃‍♀️" class="inline-block w-6 h-6 align-middle mx-1" />`,
    };

    let processedText = text;
    
    Object.entries(emojiMap).forEach(([word, emoji]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      processedText = processedText.replace(regex, emoji);
    });

    return processedText;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const processedMessage = processEmojiReplacements(newMessage);
    sendMessage.mutate(processedMessage);
  };

  const handleRoomChange = (roomId: string) => {
    setActiveRoomId(roomId);
    setSearchUsers("");
  };

  const handleAIHelp = () => {
    setIsAIHelpOpen(true);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="h-screen bg-gradient-to-br from-pink-100 to-pink-200 font-serif flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="w-full py-3 px-6 md:px-6 px-3 border-b-2 border-white flex items-center justify-between flex-shrink-0" style={{ backgroundColor: '#fcb3c4' }}>
        <div className="flex-1 md:block hidden"></div>
        <h1 className="text-center text-white font-bold text-xl md:text-xl text-lg font-serif">
          Mum's Space Chatroom
        </h1>
        <div className="flex-1 flex justify-end gap-2 md:gap-2 gap-1">
          <Button 
            className="hover:bg-blue-200 text-blue-800 rounded-full px-3 py-2 md:px-3 px-2 text-xs md:text-xs text-xs border-4 border-white md:min-h-0 min-h-[44px]"
            style={{ backgroundColor: '#d5d8ed' }}
            onClick={() => setIsGuideOpen(!isGuideOpen)}
          >
            💡 Guide
          </Button>
          <Button 
            className="hover:bg-blue-200 text-blue-800 rounded-full px-4 py-2 md:px-4 px-3 text-sm md:text-sm text-xs border-4 border-white md:min-h-0 min-h-[44px]"
            style={{ backgroundColor: '#d5d8ed' }}
            onClick={handleAIHelp}
          >
            <HelpCircle size={14} className="mr-1" />
            AI Help
          </Button>
        </div>
      </div>

      {/* Room Tabs */}
      <div className="w-full px-6 py-2 md:px-6 px-3" style={{ backgroundColor: '#fcb3c4' }}>
        <div className="flex space-x-2 md:space-x-2 space-x-1 overflow-x-auto">
          {rooms.map((room: any) => {
            const isActive = activeRoomId === room.id.toString();
            const isPrivateGroup = room.isPrivateGroup;
            
            return (
              <button
                key={room.id}
                onClick={() => handleRoomChange(room.id.toString())}
                className={`px-4 py-2 md:px-4 px-3 md:py-2 py-3 rounded-lg text-sm md:text-sm text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 border-4 border-white md:min-h-0 min-h-[44px] ${
                  isActive 
                    ? 'bg-white bg-opacity-30 text-white shadow-md' 
                    : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                }`}
              >
                {isPrivateGroup ? (
                  <Users className="w-4 h-4" />
                ) : room.ageGroup === 'mums-to-be' ? (
                  <Heart className="w-4 h-4" />
                ) : room.ageGroup === '0-2' ? (
                  <Baby className="w-4 h-4" />
                ) : room.ageGroup === '2-5' ? (
                  <Users className="w-4 h-4" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
                {room.name}
                {isPrivateGroup && (
                  <span className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">
                    Private
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Simple Guide */}
      {isGuideOpen && (
        <div className="w-full border-b-2 border-white p-4" style={{ backgroundColor: '#fed1dc' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-pink-800">Quick Guide</h3>
            <Button onClick={() => setIsGuideOpen(false)} className="text-pink-700 border-2 border-white">✕</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-white p-3 rounded border">
              <strong>🎨 Custom Emojis:</strong> Type "lol", "crying", "excited", "love", "tired", "stressed" etc. and they become 3D emojis!
            </div>
            <div className="bg-white p-3 rounded border">
              <strong>👥 Private Groups:</strong> Click "Create Group" to start intimate conversations with 2-5 other mums.
            </div>
            <div className="bg-white p-3 rounded border">
              <strong>🤖 AI Help:</strong> Get instant parenting advice from our AI assistant based on your child's age.
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div 
          className="flex flex-col border-r-2 border-white relative" 
          style={{ backgroundColor: '#fed1dc', width: `${sidebarWidth}px` }}
        >
          <div className="p-4 space-y-3 border-b-2 border-white">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-pink-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="pl-10 bg-white/80 border-pink-200 rounded-full text-pink-800 placeholder-pink-400"
              />
            </div>

            <div className="text-blue-800 px-3 py-1 rounded-full text-center font-medium text-sm border-4 border-white" style={{ backgroundColor: '#d5d8ed' }}>
              {roomUsers.length} mums online
            </div>

            <Button
              onClick={() => setIsCreateGroupOpen(true)}
              className="w-full hover:bg-blue-200 text-blue-800 rounded-full flex items-center gap-2 border-4 border-white"
              style={{ backgroundColor: '#d5d8ed' }}
            >
              <Users size={16} />
              Create Group
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {roomUsers
              .filter((user: any) => 
                user.username.toLowerCase().includes(searchUsers.toLowerCase())
              )
              .map((user: any) => (
                <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: user.avatarColor || '#ec4899' }}
                  >
                    {user.initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{user.username}</div>
                    <div className="text-pink-100 text-xs">{user.ageGroup}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Room Title */}
          <div className="bg-pink-200 p-2 border-b border-white flex items-center justify-between flex-shrink-0">
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
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
            style={{ 
              height: 'calc(100vh - 280px)'
            }}
          >
            {!messages || messages.length === 0 ? (
              <div className="text-center text-pink-500 py-8">
                <Heart size={48} className="mx-auto mb-4 text-pink-300" />
                <p className="text-lg">Start a conversation with other mums!</p>
                <p className="text-sm text-pink-400 mt-2">
                  Share your experiences, ask questions, and support each other.
                </p>
              </div>
            ) : (
              <MessageList 
                messages={messages} 
                currentUserId={1}
                currentRoom={activeRoom}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div 
            className="border-t border-pink-200 flex-shrink-0" 
            style={{ 
              backgroundColor: '#fed1dc',
              height: '120px'
            }}
          >
            <div className="flex items-center space-x-3 px-6 pt-6 pb-3 md:px-6 px-4">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                disabled={sendMessage.isPending}
                rows={1}
                wrap="soft"
                className="flex-1 rounded-full px-6 py-3 md:px-6 px-4 md:py-3 py-4 border-2 border-white outline-none focus:ring-2 focus:ring-pink-300 resize-none overflow-x-hidden md:text-lg text-base"
                style={{ 
                  backgroundColor: '#d5d8ed',
                  color: '#000000',
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? '16px' : '18px',
                  fontWeight: '500',
                  minHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? '44px' : 'auto'
                }}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessage.isPending}
                className="bg-pink-300 hover:bg-pink-400 text-pink-800 rounded-full px-6 py-3 md:px-6 px-4 md:py-3 py-4 border-2 border-white md:min-h-0 min-h-[44px] md:min-w-0 min-w-[44px]"
              >
                <Send size={20} />
              </Button>
            </div>

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
                      </div>
                      <div className="space-y-1">
                        <div><span className="text-pink-600">love</span> → ❤️</div>
                        <div><span className="text-pink-600">hugs</span> → 🤗</div>
                        <div><span className="text-pink-600">tired</span> → 😴</div>
                        <div><span className="text-pink-600">excited</span> → 🎉</div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AIHelpModal 
        isOpen={isAIHelpOpen} 
        onClose={() => setIsAIHelpOpen(false)} 
      />

      <CreateGroupModal 
        isOpen={isCreateGroupOpen} 
        onClose={() => setIsCreateGroupOpen(false)}
        currentUserId={1}
      />
    </div>
  );
}