import { useEffect, useRef } from "react";
import { format } from "date-fns";
import UserAvatar from "./UserAvatar";
import type { MessageWithUser } from "@shared/schema";

interface MessageListProps {
  messages: MessageWithUser[];
  currentUserId?: number;
  currentRoom?: any;
}

export default function MessageList({ messages, currentUserId, currentRoom }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return format(new Date(date), 'h:mm a');
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Room Welcome Banner */}
      {currentRoom && (
        <div className="bg-blue-50 border-l-4 border-primary p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="text-primary mt-0.5 mr-3">ℹ️</div>
            <div>
              <h3 className="text-sm font-medium text-primary">
                Welcome to the {currentRoom.name} Chatroom
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                {currentRoom.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.userId === currentUserId;
            
            // Safety check for message.user
            if (!message.user) {
              return null;
            }
            
            return (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${isCurrentUser ? 'justify-end' : ''}`}
              >
                {!isCurrentUser && (
                  <UserAvatar 
                    initials={message.user.initials}
                    ageGroup={message.user.ageGroup}
                    color={message.user.avatarColor}
                  />
                )}
                
                <div className={`flex-1 max-w-xs sm:max-w-md ${isCurrentUser ? 'flex flex-col items-end' : ''}`}>
                  <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                    {!isCurrentUser && (
                      <>
                        <span className="text-sm font-medium text-text-primary">
                          {message.user.username}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          message.user.ageGroup === '0-1' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {message.user.ageGroup}
                        </span>
                      </>
                    )}
                    <span className="text-xs text-text-secondary">
                      {formatTime(message.createdAt)}
                    </span>
                    {isCurrentUser && (
                      <>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          message.user.ageGroup === '0-1' 
                            ? 'bg-blue-100 text-primary' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {message.user.ageGroup}
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
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
                
                {isCurrentUser && (
                  <UserAvatar 
                    initials={message.user.initials}
                    ageGroup={message.user.ageGroup}
                    color={message.user.avatarColor}
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
