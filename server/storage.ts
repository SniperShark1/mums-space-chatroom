import { users, chatRooms, chatMessages, groupMemberships, type User, type InsertUser, type ChatRoom, type InsertChatRoom, type ChatMessage, type InsertChatMessage, type MessageWithUser, type GroupMembership, type InsertGroupMembership } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatRooms: Map<number, ChatRoom>;
  private chatMessages: Map<number, ChatMessage>;
  private groupMemberships: Map<number, GroupMembership>;
  private currentUserId: number;
  private currentRoomId: number;
  private currentMessageId: number;
  private currentMembershipId: number;

  constructor() {
    this.users = new Map();
    this.chatRooms = new Map();
    this.chatMessages = new Map();
    this.groupMemberships = new Map();
    this.currentUserId = 1;
    this.currentRoomId = 1;
    this.currentMessageId = 1;
    this.currentMembershipId = 1;

    // Initialize default chat rooms and demo data
    this.initializeDefaultRooms();
    this.initializeDemoUsers();
    this.initializeDemoMessages();
  }

  private initializeDefaultRooms() {
    const rooms = [
      {
        name: "Mums-to-Be",
        ageGroup: "mums-to-be",
        description: "Connect with other expectant mothers. Share your pregnancy journey, ask questions, and prepare for motherhood together."
      },
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
        isPrivateGroup: false,
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
        initials: "S",
        avatarColor: "pink"
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
        content: "Sleep training has been such a journey! Anyone else going through this?",
        userId: 2,
        roomId: 2
      },
      // 2-5 Years messages (roomId: 3)
      {
        content: "Invite to private chat",
        userId: 4,
        roomId: 3
      },
      {
        content: "Potty training tips needed! My 3-year-old is being so stubborn.",
        userId: 8,
        roomId: 3
      }
    ];

    demoMessages.forEach(messageData => {
      const message: ChatMessage = {
        id: this.currentMessageId++,
        ...messageData,
        createdAt: new Date(Date.now() - Math.random() * 3600000) // Random time within last hour
      };
      this.chatMessages.set(message.id, message);
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
      avatarColor: insertUser.avatarColor || "blue",
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
      description: insertRoom.description || null,
      isPrivateGroup: insertRoom.isPrivateGroup ?? false,
      createdBy: insertRoom.createdBy ?? null,
      id,
      createdAt: new Date()
    };
    this.chatRooms.set(id, room);
    return room;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserRooms(userId: number): Promise<ChatRoom[]> {
    const publicRooms = Array.from(this.chatRooms.values()).filter(room => !room.isPrivateGroup);
    const userPrivateGroups = Array.from(this.groupMemberships.values())
      .filter(membership => membership.userId === userId)
      .map(membership => this.chatRooms.get(membership.roomId))
      .filter(room => room !== undefined) as ChatRoom[];
    
    return [...publicRooms, ...userPrivateGroups];
  }

  async addGroupMember(membership: InsertGroupMembership): Promise<GroupMembership> {
    const id = this.currentMembershipId++;
    const groupMembership: GroupMembership = {
      ...membership,
      id,
      joinedAt: new Date()
    };
    this.groupMemberships.set(id, groupMembership);
    return groupMembership;
  }

  async removeGroupMember(userId: number, roomId: number): Promise<void> {
    const membership = Array.from(this.groupMemberships.entries()).find(
      ([_, membership]) => membership.userId === userId && membership.roomId === roomId
    );
    if (membership) {
      this.groupMemberships.delete(membership[0]);
    }
  }

  async getGroupMembers(roomId: number): Promise<User[]> {
    const membershipUserIds = Array.from(this.groupMemberships.values())
      .filter(membership => membership.roomId === roomId)
      .map(membership => membership.userId);
    
    return membershipUserIds
      .map(userId => this.users.get(userId))
      .filter(user => user !== undefined) as User[];
  }

  async getUserGroups(userId: number): Promise<ChatRoom[]> {
    const userMemberships = Array.from(this.groupMemberships.values())
      .filter(membership => membership.userId === userId);
    
    return userMemberships
      .map(membership => this.chatRooms.get(membership.roomId))
      .filter(room => room !== undefined && room.isPrivateGroup) as ChatRoom[];
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
