import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, insertUserSchema } from "@shared/schema";
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

  return httpServer;
}
