import { users, chatRooms, chatMessages, groupMemberships, userReports, type User, type InsertUser, type ChatRoom, type InsertChatRoom, type ChatMessage, type InsertChatMessage, type MessageWithUser, type GroupMembership, type InsertGroupMembership, type UserReport, type InsertUserReport } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Chat room operations
  getChatRooms(): Promise<ChatRoom[]>;
  getChatRoom(id: number): Promise<ChatRoom | undefined>;
  getChatRoomByAgeGroup(ageGroup: string): Promise<ChatRoom | undefined>;
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  getUserRooms(userId: number): Promise<ChatRoom[]>;

  // Group membership operations
  addGroupMember(membership: InsertGroupMembership): Promise<GroupMembership>;
  removeGroupMember(userId: number, roomId: number): Promise<void>;
  getGroupMembers(roomId: number): Promise<User[]>;
  getUserGroups(userId: number): Promise<ChatRoom[]>;

  // Message operations
  getMessages(roomId: number, limit?: number): Promise<MessageWithUser[]>;
  createMessage(message: InsertChatMessage): Promise<MessageWithUser>;

  // Report operations
  createUserReport(report: InsertUserReport): Promise<UserReport>;
  getUserReports(): Promise<UserReport[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatRooms: Map<number, ChatRoom>;
  private chatMessages: Map<number, ChatMessage>;
  private groupMemberships: Map<number, GroupMembership>;
  private userReports: Map<number, UserReport>;
  private currentUserId: number;
  private currentRoomId: number;
  private currentMessageId: number;
  private currentMembershipId: number;
  private currentReportId: number;

  constructor() {
    this.users = new Map();
    this.chatRooms = new Map();
    this.chatMessages = new Map();
    this.groupMemberships = new Map();
    this.userReports = new Map();
    this.currentUserId = 1;
    this.currentRoomId = 1;
    this.currentMessageId = 1;
    this.currentMembershipId = 1;
    this.currentReportId = 1;

    // Initialize default chat rooms and demo data
    this.initializeDefaultRooms();
    this.initializeDemoUsers();
    this.initializeDemoMessages();
  }

  private initializeDefaultRooms() {
    const defaultRooms = [
      {
        name: "Mums-to-Be",
        ageGroup: "mums-to-be",
        isPrivateGroup: false,
        description: "Connect with expecting mothers"
      },
      {
        name: "0-2 Years",
        ageGroup: "0-2",
        isPrivateGroup: false,
        description: "New mums with babies and toddlers"
      },
      {
        name: "2-5 Years",
        ageGroup: "2-5",
        isPrivateGroup: false,
        description: "Toddler and preschool stage"
      }
    ];

    defaultRooms.forEach(roomData => {
      const chatRoom: ChatRoom = {
        id: this.currentRoomId++,
        ...roomData,
        createdBy: null,
        createdAt: new Date()
      };
      this.chatRooms.set(chatRoom.id, chatRoom);
    });
  }

  private initializeDemoUsers() {
    const demoUsers = [
      {
        username: "Emma",
        password: "demo123",
        ageGroup: "mums-to-be",
        initials: "E",
        avatarColor: "pink"
      },
      {
        username: "Sarah",
        password: "demo123",
        ageGroup: "0-1",
        initials: "S",
        avatarColor: "blue"
      },
      {
        username: "Jessica",
        password: "demo123", 
        ageGroup: "0-1",
        initials: "J",
        avatarColor: "purple"
      },
      {
        username: "Megan",
        password: "demo123",
        ageGroup: "2-5", 
        initials: "M",
        avatarColor: "green"
      },
      {
        username: "Victoria",
        password: "demo123",
        ageGroup: "2-5",
        initials: "V",
        avatarColor: "orange"
      },
      {
        username: "Rachel",
        password: "demo123",
        ageGroup: "mums-to-be",
        initials: "R",
        avatarColor: "teal"
      },
      {
        username: "Amy",
        password: "demo123",
        ageGroup: "0-1",
        initials: "A",
        avatarColor: "red"
      },
      {
        username: "Sophie",
        password: "demo123",
        ageGroup: "2-5",
        initials: "So",
        avatarColor: "indigo"
      },
      {
        username: "Claire",
        password: "demo123",
        ageGroup: "mums-to-be",
        initials: "C",
        avatarColor: "yellow"
      },
      {
        username: "Lisa",
        password: "demo123",
        ageGroup: "0-1",
        initials: "L", 
        avatarColor: "cyan"
      },
      {
        username: "Hannah",
        password: "demo123",
        ageGroup: "2-5",
        initials: "H",
        avatarColor: "rose"
      }
    ];

    demoUsers.forEach(userData => {
      const user: User = {
        id: this.currentUserId++,
        ...userData,
        createdAt: new Date()
      };
      this.users.set(user.id, user);
    });
  }

  private initializeDemoMessages() {
    const demoMessages = [
      // Mums-to-Be messages (roomId: 1)
      {
        content: "Shared stories and challenges.",
        userId: 1,
        roomId: 1
      },
      {
        content: "Real-time chat with others in same stage.",
        userId: 6,
        roomId: 1
      },
      // 0-1 Years messages (roomId: 2)
      {
        content: "Invite other mums to private chat",
        userId: 7,
        roomId: 2
      },
      {
        content: "Anyone else struggling with sleep schedules?",
        userId: 2,
        roomId: 2
      },
      // 2-5 Years messages (roomId: 3)
      {
        content: "Toddler tantrums - any advice?",
        userId: 4,
        roomId: 3
      },
      {
        content: "Starting preschool prep - excited but nervous!",
        userId: 5,
        roomId: 3
      }
    ];

    demoMessages.forEach(messageData => {
      const message: ChatMessage = {
        id: this.currentMessageId++,
        ...messageData,
        createdAt: new Date()
      };
      this.chatMessages.set(message.id, message);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      id: this.currentUserId++,
      ...insertUser,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async getChatRooms(): Promise<ChatRoom[]> {
    return Array.from(this.chatRooms.values());
  }

  async getChatRoom(id: number): Promise<ChatRoom | undefined> {
    return this.chatRooms.get(id);
  }

  async getChatRoomByAgeGroup(ageGroup: string): Promise<ChatRoom | undefined> {
    for (const room of this.chatRooms.values()) {
      if (room.ageGroup === ageGroup && !room.isPrivateGroup) {
        return room;
      }
    }
    return undefined;
  }

  async createChatRoom(insertRoom: InsertChatRoom): Promise<ChatRoom> {
    const room: ChatRoom = {
      id: this.currentRoomId++,
      ...insertRoom,
      createdAt: new Date()
    };
    this.chatRooms.set(room.id, room);
    return room;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserRooms(userId: number): Promise<ChatRoom[]> {
    const userGroups = Array.from(this.groupMemberships.values())
      .filter(membership => membership.userId === userId)
      .map(membership => membership.roomId);
    
    const publicRooms = Array.from(this.chatRooms.values())
      .filter(room => !room.isPrivateGroup);
    
    const privateRooms = Array.from(this.chatRooms.values())
      .filter(room => room.isPrivateGroup && userGroups.includes(room.id));
    
    return [...publicRooms, ...privateRooms];
  }

  async addGroupMember(membership: InsertGroupMembership): Promise<GroupMembership> {
    const groupMembership: GroupMembership = {
      id: this.currentMembershipId++,
      ...membership,
      joinedAt: new Date()
    };
    this.groupMemberships.set(groupMembership.id, groupMembership);
    return groupMembership;
  }

  async removeGroupMember(userId: number, roomId: number): Promise<void> {
    for (const [id, membership] of this.groupMemberships.entries()) {
      if (membership.userId === userId && membership.roomId === roomId) {
        this.groupMemberships.delete(id);
        break;
      }
    }
  }

  async getGroupMembers(roomId: number): Promise<User[]> {
    const memberIds = Array.from(this.groupMemberships.values())
      .filter(membership => membership.roomId === roomId)
      .map(membership => membership.userId);
    
    return Array.from(this.users.values())
      .filter(user => memberIds.includes(user.id));
  }

  async getUserGroups(userId: number): Promise<ChatRoom[]> {
    const groupIds = Array.from(this.groupMemberships.values())
      .filter(membership => membership.userId === userId)
      .map(membership => membership.roomId);
    
    return Array.from(this.chatRooms.values())
      .filter(room => groupIds.includes(room.id));
  }

  async getMessages(roomId: number, limit: number = 50): Promise<MessageWithUser[]> {
    const roomMessages = Array.from(this.chatMessages.values())
      .filter(message => message.roomId === roomId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(-limit);

    return roomMessages.map(message => {
      const user = this.users.get(message.userId);
      return {
        ...message,
        user: {
          username: user?.username || 'Unknown',
          ageGroup: user?.ageGroup || 'unknown',
          initials: user?.initials || 'U',
          avatarColor: user?.avatarColor || 'gray'
        }
      };
    });
  }

  async createMessage(insertMessage: InsertChatMessage): Promise<MessageWithUser> {
    const message: ChatMessage = {
      id: this.currentMessageId++,
      ...insertMessage,
      createdAt: new Date()
    };
    this.chatMessages.set(message.id, message);

    const user = this.users.get(message.userId);
    return {
      ...message,
      user: {
        username: user?.username || 'Unknown',
        ageGroup: user?.ageGroup || 'unknown', 
        initials: user?.initials || 'U',
        avatarColor: user?.avatarColor || 'gray'
      }
    };
  }
}

export const storage = new MemStorage();