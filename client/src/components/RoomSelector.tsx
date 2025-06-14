import { useState } from 'react';

interface RoomSelectorProps {
  onRoomChange?: (roomId: string) => void;
}

const RoomSelector = ({ onRoomChange }: RoomSelectorProps) => {
  const [activeRoom, setActiveRoom] = useState('mums-to-be');

  const rooms = [
    { id: 'mums-to-be', name: 'Mums-to-Be', icon: '🤱' },
    { id: '0-1', name: '0–1 Years', icon: '👶' },
    { id: '2-5', name: '2–5 Years', icon: '🧒' }
  ];

  const handleRoomClick = (roomId: string) => {
    setActiveRoom(roomId);
    if (onRoomChange) {
      onRoomChange(roomId);
    }
  };

  return (
    <div className="flex justify-center gap-4 mt-4 px-4">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => handleRoomClick(room.id)}
          className={`px-4 py-2 rounded font-medium transition-all ${
            activeRoom === room.id
              ? 'bg-white text-pink-600 shadow-lg border-2 border-pink-300'
              : 'bg-white text-black hover:bg-gray-100 shadow-md'
          }`}
        >
          {room.icon} {room.name}
        </button>
      ))}
    </div>
  );
};

export default RoomSelector;