import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, desc, and } from 'drizzle-orm';
import { users, chatRooms, chatMessages, groupMemberships, userReports, type User, type InsertUser, type ChatRoom, type InsertChatRoom, type ChatMessage, type InsertChatMessage, type MessageWithUser, type GroupMembership, type InsertGroupMembership, type UserReport, type InsertUserReport } from "@shared/schema";
import type { IStorage } from './storage';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Chat room operations
  async getChatRooms(): Promise<ChatRoom[]> {
    return await db.select().from(chatRooms);
  }

  async getChatRoom(id: number): Promise<ChatRoom | undefined> {
    const result = await db.select().from(chatRooms).where(eq(chatRooms.id, id)).limit(1);
    return result[0];
  }

  async getChatRoomByAgeGroup(ageGroup: string): Promise<ChatRoom | undefined> {
    const result = await db.select().from(chatRooms).where(eq(chatRooms.ageGroup, ageGroup)).limit(1);
    return result[0];
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const result = await db.insert(chatRooms).values(room).returning();
    return result[0];
  }

  async getUserRooms(userId: number): Promise<ChatRoom[]> {
    const result = await db
      .select({
        id: chatRooms.id,
        name: chatRooms.name,
        ageGroup: chatRooms.ageGroup,
        description: chatRooms.description,
        isPrivateGroup: chatRooms.isPrivateGroup,
        createdBy: chatRooms.createdBy,
        createdAt: chatRooms.createdAt
      })
      .from(chatRooms)
      .innerJoin(groupMemberships, eq(chatRooms.id, groupMemberships.roomId))
      .where(eq(groupMemberships.userId, userId));
    
    return result;
  }

  // Group membership operations
  async addGroupMember(membership: InsertGroupMembership): Promise<GroupMembership> {
    const result = await db.insert(groupMemberships).values(membership).returning();
    return result[0];
  }

  async removeGroupMember(userId: number, roomId: number): Promise<void> {
    await db.delete(groupMemberships)
      .where(and(
        eq(groupMemberships.userId, userId),
        eq(groupMemberships.roomId, roomId)
      ));
  }

  async getGroupMembers(roomId: number): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .innerJoin(groupMemberships, eq(users.id, groupMemberships.userId))
      .where(eq(groupMemberships.roomId, roomId));
    
    return result.map(row => row.users);
  }

  async getUserGroups(userId: number): Promise<ChatRoom[]> {
    return await this.getUserRooms(userId);
  }

  // Message operations
  async getMessages(roomId: number, limit: number = 50): Promise<MessageWithUser[]> {
    const result = await db
      .select({
        id: chatMessages.id,
        content: chatMessages.content,
        userId: chatMessages.userId,
        roomId: chatMessages.roomId,
        createdAt: chatMessages.createdAt,
        user: {
          username: users.username,
          ageGroup: users.ageGroup,
          initials: users.initials,
          avatarColor: users.avatarColor
        }
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    return result.reverse(); // Return in chronological order
  }

  async createMessage(message: InsertChatMessage): Promise<MessageWithUser> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    
    const [userInfo] = await db
      .select({
        username: users.username,
        ageGroup: users.ageGroup,
        initials: users.initials,
        avatarColor: users.avatarColor
      })
      .from(users)
      .where(eq(users.id, message.userId));

    return {
      ...newMessage,
      user: userInfo
    };
  }

  // Report operations
  async createUserReport(report: InsertUserReport): Promise<UserReport> {
    const result = await db.insert(userReports).values(report).returning();
    return result[0];
  }

  async getUserReports(): Promise<UserReport[]> {
    return await db.select().from(userReports).orderBy(desc(userReports.createdAt));
  }
}

export const storage = new DatabaseStorage();