import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Send, Heart, HelpCircle, MoreHorizontal, Volume2, UserX, MessageSquare, Info, Users, MessageCircle, Baby, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AIHelpModal from "./AIHelpModal";
import CreateGroupModal from "./CreateGroupModal";
import ReportUserModal from "./ReportUserModal";
import type { ChatRoom, MessageWithUser, User } from "@shared/schema";
import LoveEmojiPath from "@assets/Love.png";
import BRBEmojiPath from "@assets/BRB.png";
import ClapEmojiPath from "@assets/Clap.png";
import HugsEmojiPath from "@assets/Hugs.png";
import OMGEmojiPath from "@assets/OMG.png";
import SmileEmojiPath from "@assets/Smile.png";
import ThanksEmojiPath from "@assets/Thanks.png";
import LOLEmojiPath from "@assets/LOL_transparent.png";
import FrustratedEmojiPath from "@assets/Frustrated_transparent.png";
import ExhaustedEmojiPath from "@assets/Exhausted_transparent.png";
import ExcitedEmojiPath from "@assets/Excited_transparent.png";
import MadEmojiPath from "@assets/Mad_transparent.png";
import AnnoyedEmojiPath from "@assets/Annoyed_transparent.png";
import CongratsEmojiPath from "@assets/congrats_transparent.png";
import ConfusedEmojiPath from "@assets/Confused_transparent.png";
import AngryEmojiPath from "@assets/Angry_transparent.png";
import CryingEmojiPath from "@assets/Crying_transparent.png";
import TiredEmojiPath from "@assets/Tired.png";
import WorriedEmojiPath from "@assets/worried.png";
import StressedEmojiPath from "@assets/Stressed.png";
import ShockedEmojiPath from "@assets/Shocked.png";
import SleepyEmojiPath from "@assets/sleepy.png";

export default function MumsSpaceChat() {
  const [activeRoomId, setActiveRoomId] = useState("1");
  const [newMessage, setNewMessage] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [privateChatUser, setPrivateChatUser] = useState<string | null>(null);
  const [isAIHelpOpen, setIsAIHelpOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [textSize, setTextSize] = useState("16");
  const [inputAreaHeight, setInputAreaHeight] = useState(120);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportedUsername, setReportedUsername] = useState("");
  
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
        // Force scroll to bottom after sending message - multiple attempts
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTop = container.scrollHeight;
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
            setTimeout(() => container.scrollTop = container.scrollHeight, 10);
            setTimeout(() => container.scrollTop = container.scrollHeight, 50);
            setTimeout(() => container.scrollTop = container.scrollHeight, 100);
          });
        }
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
      'lol': '🔥CUSTOM_LOL_EMOJI🔥',
      'brb': '🔥CUSTOM_BRB_EMOJI🔥',
      'omg': '🔥CUSTOM_OMG_EMOJI🔥',
      'thanks': '🔥CUSTOM_THANKS_EMOJI🔥',
      'thank you': '🔥CUSTOM_THANKS_EMOJI🔥',
      'love': '🔥CUSTOM_LOVE_EMOJI🔥',
      'congrats': '🔥CUSTOM_CONGRATS_EMOJI🔥',
      'congratulations': '🔥CUSTOM_CONGRATS_EMOJI🔥',
      'hugs': '🔥CUSTOM_HUGS_EMOJI🔥',
      'clap': '🔥CUSTOM_CLAP_EMOJI🔥',

      'sleepy': '🔥CUSTOM_SLEEPY_EMOJI🔥',
      'tired': '🔥CUSTOM_TIRED_EMOJI🔥',
      'angry': '🔥CUSTOM_ANGRY_EMOJI🔥',
      'mad': '🔥CUSTOM_MAD_EMOJI🔥',
      'frustrated': '🔥CUSTOM_FRUSTRATED_EMOJI🔥',
      'crying': '🔥CUSTOM_CRYING_EMOJI🔥',
      'happy': '🔥CUSTOM_SMILE_EMOJI🔥',
      'sad': '🔥CUSTOM_CRYING_EMOJI🔥',
      'excited': '🔥CUSTOM_EXCITED_EMOJI🔥',
      'worried': '🔥CUSTOM_WORRIED_EMOJI🔥',
      'stressed': '🔥CUSTOM_STRESSED_EMOJI🔥',
      'exhausted': '🔥CUSTOM_EXHAUSTED_EMOJI🔥',
      'confused': '🔥CUSTOM_CONFUSED_EMOJI🔥',
      'shocked': '🔥CUSTOM_SHOCKED_EMOJI🔥',
      'annoyed': '🔥CUSTOM_ANNOYED_EMOJI🔥'
    };

    let result = text;
    Object.entries(emojiMap).forEach(([word, emoji]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, emoji);
    });
    return result;
  };

  // Render message content with custom emojis
  const renderMessageContent = (content: string) => {
    // Define all custom emoji mappings
    const customEmojis = {
      '🔥CUSTOM_LOVE_EMOJI🔥': { src: LoveEmojiPath, alt: 'love' },
      '🔥CUSTOM_BRB_EMOJI🔥': { src: BRBEmojiPath, alt: 'brb' },
      '🔥CUSTOM_OMG_EMOJI🔥': { src: OMGEmojiPath, alt: 'omg' },
      '🔥CUSTOM_THANKS_EMOJI🔥': { src: ThanksEmojiPath, alt: 'thanks' },
      '🔥CUSTOM_HUGS_EMOJI🔥': { src: HugsEmojiPath, alt: 'hugs' },
      '🔥CUSTOM_SMILE_EMOJI🔥': { src: SmileEmojiPath, alt: 'smile' },
      '🔥CUSTOM_CLAP_EMOJI🔥': { src: ClapEmojiPath, alt: 'clap' },
      '🔥CUSTOM_LOL_EMOJI🔥': { src: LOLEmojiPath, alt: 'lol' },
      '🔥CUSTOM_FRUSTRATED_EMOJI🔥': { src: FrustratedEmojiPath, alt: 'frustrated' },
      '🔥CUSTOM_EXHAUSTED_EMOJI🔥': { src: ExhaustedEmojiPath, alt: 'exhausted' },
      '🔥CUSTOM_EXCITED_EMOJI🔥': { src: ExcitedEmojiPath, alt: 'excited' },
      '🔥CUSTOM_MAD_EMOJI🔥': { src: MadEmojiPath, alt: 'mad' },
      '🔥CUSTOM_ANNOYED_EMOJI🔥': { src: AnnoyedEmojiPath, alt: 'annoyed' },
      '🔥CUSTOM_CONGRATS_EMOJI🔥': { src: CongratsEmojiPath, alt: 'congrats' },
      '🔥CUSTOM_CONFUSED_EMOJI🔥': { src: ConfusedEmojiPath, alt: 'confused' },
      '🔥CUSTOM_ANGRY_EMOJI🔥': { src: AngryEmojiPath, alt: 'angry' },
      '🔥CUSTOM_CRYING_EMOJI🔥': { src: CryingEmojiPath, alt: 'crying' },
      '🔥CUSTOM_TIRED_EMOJI🔥': { src: TiredEmojiPath, alt: 'tired' },
      '🔥CUSTOM_WORRIED_EMOJI🔥': { src: WorriedEmojiPath, alt: 'worried' },
      '🔥CUSTOM_STRESSED_EMOJI🔥': { src: StressedEmojiPath, alt: 'stressed' },
      '🔥CUSTOM_SHOCKED_EMOJI🔥': { src: ShockedEmojiPath, alt: 'shocked' },
      '🔥CUSTOM_SLEEPY_EMOJI🔥': { src: SleepyEmojiPath, alt: 'sleepy' }
    };

    // Check if any custom emojis exist in the content
    const hasCustomEmojis = Object.keys(customEmojis).some(placeholder => content.includes(placeholder));
    
    if (!hasCustomEmojis) {
      return content;
    }

    // Process content to handle multiple emojis
    let processedContent = content;
    const elements: (string | JSX.Element)[] = [];
    let elementIndex = 0;

    // Replace each custom emoji with a unique marker and collect the emoji data
    const emojiMarkers: { [key: string]: { src: string; alt: string } } = {};
    
    Object.entries(customEmojis).forEach(([placeholder, emojiData]) => {
      if (processedContent.includes(placeholder)) {
        const marker = `__EMOJI_${elementIndex}__`;
        emojiMarkers[marker] = emojiData;
        processedContent = processedContent.replace(new RegExp(placeholder, 'g'), marker);
        elementIndex++;
      }
    });

    // Split by markers and build the final JSX
    const parts = processedContent.split(/(__EMOJI_\d+__)/);
    
    return (
      <span>
        {parts.map((part, index) => {
          if (part.match(/^__EMOJI_\d+__$/)) {
            const emojiData = emojiMarkers[part];
            return (
              <img 
                key={index}
                src={emojiData.src} 
                alt={emojiData.alt} 
                className="inline-block w-10 h-10 mx-1 align-middle" 
              />
            );
          }
          return part ? <span key={index}>{part}</span> : null;
        })}
      </span>
    );
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      const messageWithEmojis = replaceWithEmojis(newMessage);
      
      sendMessage.mutate(messageWithEmojis);
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

  const handleReportUser = (userName: string) => {
    setReportedUsername(userName);
    setIsReportModalOpen(true);
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

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // Handle scroll events to determine if we should auto-scroll
  const handleScroll = () => {
    setShouldAutoScroll(checkIfAtBottom());
  };

  useEffect(() => {
    // Force scroll to bottom to show latest message
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
      
      // Additional attempts with delays
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 200);
    }
  }, [messages]);

  // Scroll to bottom on component mount
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  // Room change handler
  const handleRoomChange = (roomId: string) => {
    setActiveRoomId(roomId);
    setSearchUsers("");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-pink-100 to-pink-200 font-serif flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="w-full py-3 px-6 md:px-6 px-3 border-b-2 border-white flex items-center justify-between flex-shrink-0" style={{ backgroundColor: '#fcb3c4' }}>
        <div className="flex-1 md:block hidden"></div>
        <h1 className="text-center text-white font-bold text-3xl md:text-3xl text-xl font-serif">
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
          {rooms.map((room) => {
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

      {/* Feature Guide Modal */}
      {isGuideOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsGuideOpen(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto" 
            style={{ backgroundColor: '#fed1dc' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-pink-800 text-lg">How to Use Mum's Space Chat</h3>
                <Button 
                  onClick={() => setIsGuideOpen(false)}
                  variant="ghost" 
                  size="sm"
                  className="text-pink-700 hover:bg-pink-200 border-2 border-white"
                >
                  ✕
                </Button>
              </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg border-2 border-pink-200 shadow-sm">
                <h4 className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
                  🎨 Custom 3D Emojis
                </h4>
                <p className="text-gray-700 mb-2">Type these words and they automatically become beautiful 3D emojis:</p>
                <div className="text-xs text-pink-600 space-y-1">
                  <div>• "lol", "crying", "excited", "love"</div>
                  <div>• "tired", "stressed", "worried", "annoyed"</div>
                  <div>• "hugs", "thanks", "omg", "brb"</div>
                  <div>• Plus many more!</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-pink-200 shadow-sm">
                <h4 className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
                  👥 Private Group Chats
                </h4>
                <p className="text-gray-700 mb-2">Create intimate conversations with 2-5 other mums:</p>
                <div className="text-xs text-pink-600 space-y-1">
                  <div>• Click "Create Group" button</div>
                  <div>• Enter a group name</div>
                  <div>• Select participants</div>
                  <div>• Start your private conversation</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-pink-200 shadow-sm">
                <h4 className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
                  🤖 AI Parenting Help
                </h4>
                <p className="text-gray-700 mb-2">Get personalized advice and support:</p>
                <div className="text-xs text-pink-600 space-y-1">
                  <div>• Click "AI Help" for instant guidance</div>
                  <div>• Ask about sleep, feeding, behavior</div>
                  <div>• Get age-appropriate suggestions</div>
                  <div>• Available 24/7</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-pink-200 shadow-sm">
                <h4 className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
                  🔇 User Management
                </h4>
                <p className="text-gray-700 mb-2">Control your chat experience:</p>
                <div className="text-xs text-pink-600 space-y-1">
                  <div>• Click ⋯ next to usernames</div>
                  <div>• Mute users temporarily</div>
                  <div>• Block inappropriate users</div>
                  <div>• Start private conversations</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-pink-200 shadow-sm">
                <h4 className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
                  📱 Age-Based Rooms
                </h4>
                <p className="text-gray-700 mb-2">Connect with mums at similar stages:</p>
                <div className="text-xs text-pink-600 space-y-1">
                  <div>• Mums-to-Be: Expecting mothers</div>
                  <div>• 0-2 Years: Babies & toddlers</div>
                  <div>• 2-5 Years: Preschool stage</div>
                  <div>• Switch rooms anytime</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-pink-200 shadow-sm">
                <h4 className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
                  ⚙️ Customization
                </h4>
                <p className="text-gray-700 mb-2">Personalize your experience:</p>
                <div className="text-xs text-pink-600 space-y-1">
                  <div>• Adjust text size for comfort</div>
                  <div>• Resize sidebar and input areas</div>
                  <div>• Auto-scroll chat messages</div>
                  <div>• Responsive design for all devices</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-pink-100 rounded-lg border border-pink-300">
              <p className="text-xs text-pink-800 text-center">
                🔒 <strong>Privacy & Safety:</strong> Messages are not permanently saved. Block or mute users if needed. 
                Report serious issues to our support team. Your safety and comfort are our priorities.
              </p>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Left Sidebar - Online Users - Resizable */}
        <div 
          className="flex flex-col border-r-2 border-white relative" 
          style={{ backgroundColor: '#fed1dc', width: `${sidebarWidth}px` }}
        >
          {/* Search and Controls */}
        <div className="p-4 space-y-3">
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

          {/* Online Count and Create Group Button */}
          <div className="flex items-center justify-between">
            <div className="text-blue-800 px-3 py-1 rounded-full text-center font-medium text-sm border-4 border-white" style={{ backgroundColor: '#d5d8ed' }}>
              {roomUsers.length} mums online
            </div>
            <Button
              onClick={() => setIsCreateGroupOpen(true)}
              className="hover:bg-blue-200 text-blue-800 rounded-full flex items-center gap-2 border-4 border-white px-3 py-1 text-sm"
              style={{ backgroundColor: '#d5d8ed' }}
            >
              <Users size={14} />
              Create Group
            </Button>
          </div>

          {/* Divider Line */}
          <div className="border-t-2 border-white mt-2"></div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4 space-y-3 user-list" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'scroll' }}>
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-red-600 hover:bg-red-50"
                      onClick={() => handleReportUser(user.name)}
                    >
                      <Flag size={16} className="mr-2" />
                      Report
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
      <div className="flex-1 flex flex-col bg-white">
        {/* Room Title Bar with Text Size */}
        <div className="bg-pink-200 p-2 border-b border-white flex items-center justify-between flex-shrink-0">
          <h2 className="text-3xl font-bold text-pink-800">
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
          className="px-6 py-4 space-y-4 chat-messages"
          onScroll={handleScroll}
          style={{ 
            height: 'calc(100vh - 160px)',
            overflowY: 'scroll',
            paddingBottom: '90px'
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
                    className="text-pink-700 leading-relaxed break-words"
                    style={{ 
                      fontSize: `${textSize}px`,
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word'
                    }}
                  >
                    {renderMessageContent(message.content)}
                  </div>
                </div>
              </div>
            ))
          )}
          {/* Scroll anchor */}
          <div ref={messagesEndRef} style={{ height: '20px', clear: 'both' }} />
        </div>

        {/* Fixed Message Input - Always at bottom */}
        <div 
          className="border-t border-pink-200 flex-shrink-0 fixed bottom-0 z-10" 
          style={{ 
            backgroundColor: '#fed1dc',
            height: '80px',
            left: `${sidebarWidth}px`,
            right: '0'
          }}
        >
          
          <div className="flex items-center px-6 py-4">
            <div className="flex items-center space-x-3 w-full">
              <input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={sendMessage.isPending}
                className="flex-1 rounded-full px-6 py-3 border-2 border-white outline-none focus:ring-2 focus:ring-pink-300 text-lg"
                style={{ 
                  backgroundColor: '#d5d8ed',
                  color: '#000000',
                  fontSize: window.innerWidth < 768 ? '16px' : '18px',
                  fontWeight: '500',
                  height: '50px'
                }}
              />
              <Button 
                onClick={handleSend}
                disabled={!newMessage.trim() || sendMessage.isPending}
                className="bg-pink-300 hover:bg-pink-400 text-pink-800 rounded-full px-6 py-3 border-2 border-white min-h-[50px] min-w-[50px]"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
          
          {/* Emoji Info Button */}
          <div className="flex justify-center px-6 pb-2">
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
                      <div><span className="text-pink-600">lol</span> → <img src={LOLEmojiPath} alt="😂" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">brb</span> → <img src={BRBEmojiPath} alt="🏃‍♀️" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">omg</span> → <img src={OMGEmojiPath} alt="😱" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">thanks</span> → <img src={ThanksEmojiPath} alt="🙏" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">love</span> → <img src={LoveEmojiPath} alt="❤️" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">hugs</span> → <img src={HugsEmojiPath} alt="🤗" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">happy</span> → <img src={SmileEmojiPath} alt="😊" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">clap</span> → <img src={ClapEmojiPath} alt="👏" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">crying</span> → <img src={CryingEmojiPath} alt="😭" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">excited</span> → <img src={ExcitedEmojiPath} alt="🎉" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">congrats</span> → <img src={CongratsEmojiPath} alt="🎉" className="inline-block w-4 h-4 align-middle" /></div>
                    </div>
                    <div className="space-y-1">
                      <div><span className="text-pink-600">tired</span> → <img src={TiredEmojiPath} alt="😴" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">sleepy</span> → <img src={SleepyEmojiPath} alt="😴" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">angry</span> → <img src={AngryEmojiPath} alt="😠" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">mad</span> → <img src={MadEmojiPath} alt="😡" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">frustrated</span> → <img src={FrustratedEmojiPath} alt="😤" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">worried</span> → <img src={WorriedEmojiPath} alt="😰" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">stressed</span> → <img src={StressedEmojiPath} alt="😰" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">exhausted</span> → <img src={ExhaustedEmojiPath} alt="😵" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">confused</span> → <img src={ConfusedEmojiPath} alt="😕" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">shocked</span> → <img src={ShockedEmojiPath} alt="😲" className="inline-block w-4 h-4 align-middle" /></div>
                      <div><span className="text-pink-600">annoyed</span> → <img src={AnnoyedEmojiPath} alt="😒" className="inline-block w-4 h-4 align-middle" /></div>
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

      {/* Create Group Modal */}
      <CreateGroupModal 
        isOpen={isCreateGroupOpen} 
        onClose={() => setIsCreateGroupOpen(false)}
        currentUserId={1}
      />

      {/* Report User Modal */}
      <ReportUserModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportedUsername={reportedUsername}
        reporterId={1}
      />
    </div>
  );
}