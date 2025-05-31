import { users, chatRooms, chatMessages, type User, type InsertUser, type ChatRoom, type InsertChatRoom, type ChatMessage, type InsertChatMessage, type MessageWithUser } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Chat room operations
  getChatRooms(): Promise<ChatRoom[]>;
  getChatRoom(id: number): Promise<ChatRoom | undefined>;
  getChatRoomByAgeGroup(ageGroup: string): Promise<ChatRoom | undefined>;
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;

  // Message operations
  getMessages(roomId: number, limit?: number): Promise<MessageWithUser[]>;
  createMessage(message: InsertChatMessage): Promise<MessageWithUser>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatRooms: Map<number, ChatRoom>;
  private chatMessages: Map<number, ChatMessage>;
  private currentUserId: number;
  private currentRoomId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.chatRooms = new Map();
    this.chatMessages = new Map();
    this.currentUserId = 1;
    this.currentRoomId = 1;
    this.currentMessageId = 1;

    // Initialize default chat rooms
    this.initializeDefaultRooms();
  }

  private initializeDefaultRooms() {
    const rooms = [
      {
        name: "0-1 Years",
        ageGroup: "0-1",
        description: "Connect with other parents navigating the early months. Share experiences, ask questions, and find support."
      },
      {
        name: "2-5 Years",
        ageGroup: "2-5", 
        description: "Discuss toddler challenges, development milestones, and parenting strategies for growing children."
      }
    ];

    rooms.forEach(room => {
      const chatRoom: ChatRoom = {
        id: this.currentRoomId++,
        name: room.name,
        ageGroup: room.ageGroup,
        description: room.description,
        createdAt: new Date()
      };
      this.chatRooms.set(chatRoom.id, chatRoom);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getChatRooms(): Promise<ChatRoom[]> {
    return Array.from(this.chatRooms.values());
  }

  async getChatRoom(id: number): Promise<ChatRoom | undefined> {
    return this.chatRooms.get(id);
  }

  async getChatRoomByAgeGroup(ageGroup: string): Promise<ChatRoom | undefined> {
    return Array.from(this.chatRooms.values()).find(
      room => room.ageGroup === ageGroup
    );
  }

  async createChatRoom(insertRoom: InsertChatRoom): Promise<ChatRoom> {
    const id = this.currentRoomId++;
    const room: ChatRoom = {
      ...insertRoom,
      id,
      createdAt: new Date()
    };
    this.chatRooms.set(id, room);
    return room;
  }

  async getMessages(roomId: number, limit: number = 50): Promise<MessageWithUser[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter(message => message.roomId === roomId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(-limit);

    return messages.map(message => {
      const user = this.users.get(message.userId);
      return {
        ...message,
        user: {
          username: user?.username || 'Unknown',
          ageGroup: user?.ageGroup || '0-1',
          initials: user?.initials || 'UN',
          avatarColor: user?.avatarColor || 'blue'
        }
      };
    });
  }

  async createMessage(insertMessage: InsertChatMessage): Promise<MessageWithUser> {
    const id = this.currentMessageId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    this.chatMessages.set(id, message);

    const user = this.users.get(message.userId);
    return {
      ...message,
      user: {
        username: user?.username || 'Unknown',
        ageGroup: user?.ageGroup || '0-1',
        initials: user?.initials || 'UN',
        avatarColor: user?.avatarColor || 'blue'
      }
    };
  }
}

export const storage = new MemStorage();
