import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, insertUserSchema } from "@shared/schema";
import { WebSocketServer } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer });
  
  // Store active WebSocket connections by room
  const roomConnections = new Map<string, Set<any>>();
  
  wss.on('connection', (ws, req) => {
    let currentRoom: string | null = null;
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join_room') {
          // Leave previous room
          if (currentRoom && roomConnections.has(currentRoom)) {
            roomConnections.get(currentRoom)?.delete(ws);
          }
          
          // Join new room
          currentRoom = message.roomId;
          if (currentRoom && !roomConnections.has(currentRoom)) {
            roomConnections.set(currentRoom, new Set());
          }
          if (currentRoom) {
            roomConnections.get(currentRoom)?.add(ws);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      if (currentRoom && roomConnections.has(currentRoom)) {
        roomConnections.get(currentRoom)?.delete(ws);
      }
    });
  });
  
  // Broadcast message to all clients in a room
  function broadcastToRoom(roomId: string, data: any) {
    const connections = roomConnections.get(roomId);
    if (connections) {
      const messageStr = JSON.stringify(data);
      connections.forEach(ws => {
        if (ws.readyState === 1) { // WebSocket.OPEN
          ws.send(messageStr);
        }
      });
    }
  }

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
      
      // Broadcast the new message to all clients in the room
      broadcastToRoom(roomId.toString(), {
        type: 'new_message',
        message
      });
      
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

  return httpServer;
}
