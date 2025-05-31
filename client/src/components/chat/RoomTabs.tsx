import { MessageCircle, Baby, Blocks } from "lucide-react";
import type { ChatRoom } from "@shared/schema";

interface RoomTabsProps {
  rooms: ChatRoom[];
  activeRoom: string;
  onRoomChange: (roomId: string) => void;
  onlineCounts?: Record<string, number>;
}

export default function RoomTabs({ rooms, activeRoom, onRoomChange, onlineCounts = {} }: RoomTabsProps) {
  const getIcon = (ageGroup: string) => {
    return ageGroup === '0-1' ? Baby : Blocks;
  };

  return (
    <div className="flex mt-3 space-x-1">
      {rooms.map((room) => {
        const Icon = getIcon(room.ageGroup);
        const isActive = activeRoom === room.id.toString();
        const onlineCount = onlineCounts[room.id] || 0;
        
        return (
          <button
            key={room.id}
            onClick={() => onRoomChange(room.id.toString())}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 ${
              isActive 
                ? 'bg-white bg-opacity-20 text-white' 
                : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
            }`}
          >
            <Icon className="inline w-4 h-4 mr-2" />
            {room.name}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              isActive 
                ? 'bg-secondary text-text-primary' 
                : 'bg-white bg-opacity-30 text-white'
            }`}>
              {onlineCount} online
            </span>
          </button>
        );
      })}
    </div>
  );
}
