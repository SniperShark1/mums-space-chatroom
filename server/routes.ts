import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, insertUserSchema, insertChatRoomSchema, insertGroupMembershipSchema } from "@shared/schema";
import { getParentingHelp } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Get chat rooms
  app.get("/api/chat/rooms", async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat rooms" });
    }
  });

  // Get messages for a room
  app.get("/api/chat/rooms/:roomId/messages", async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      if (isNaN(roomId)) {
        return res.status(400).json({ error: "Invalid room ID" });
      }
      
      const messages = await storage.getMessages(roomId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post("/api/chat/rooms/:roomId/messages", async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      
      if (isNaN(roomId)) {
        return res.status(400).json({ error: "Invalid room ID" });
      }

      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        roomId
      });

      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });

  // Create a user (for demo purposes)
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  });

  // AI Help endpoint
  app.post("/api/ai/help", async (req, res) => {
    try {
      const { question } = req.body;
      
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: "Question is required" });
      }

      const response = await getParentingHelp(question);
      res.json({ response });
    } catch (error) {
      console.error("AI Help error:", error);
      res.status(500).json({ error: "Unable to get AI response" });
    }
  });

  // Get all users (for group creation)
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get user's accessible rooms (including private groups)
  app.get("/api/users/:userId/rooms", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const rooms = await storage.getUserRooms(userId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user rooms" });
    }
  });

  // Create a private group
  app.post("/api/groups", async (req, res) => {
    try {
      const groupData = insertChatRoomSchema.parse({
        ...req.body,
        isPrivateGroup: true,
        ageGroup: "group" // Private groups use generic age group
      });

      const group = await storage.createChatRoom(groupData);
      
      // Add creator as first member
      if (groupData.createdBy) {
        await storage.addGroupMember({
          userId: groupData.createdBy,
          roomId: group.id
        });
      }

      res.json(group);
    } catch (error) {
      console.error("Group creation error:", error);
      res.status(500).json({ error: "Failed to create group" });
    }
  });

  // Add member to group
  app.post("/api/groups/:groupId/members", async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      if (isNaN(groupId)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }

      const membershipData = insertGroupMembershipSchema.parse({
        ...req.body,
        roomId: groupId
      });

      const membership = await storage.addGroupMember(membershipData);
      res.json(membership);
    } catch (error) {
      res.status(500).json({ error: "Failed to add member to group" });
    }
  });

  // Remove member from group
  app.delete("/api/groups/:groupId/members/:userId", async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const userId = parseInt(req.params.userId);
      
      if (isNaN(groupId) || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid group or user ID" });
      }

      await storage.removeGroupMember(userId, groupId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove member from group" });
    }
  });

  // Get group members
  app.get("/api/groups/:groupId/members", async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      if (isNaN(groupId)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }

      const members = await storage.getGroupMembers(groupId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch group members" });
    }
  });

  return httpServer;
}
