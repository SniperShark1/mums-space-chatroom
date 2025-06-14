import express, { type Request, Response } from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

// Basic chat rooms endpoint
app.get("/api/chat/rooms", (req, res) => {
  const defaultRooms = [
    { id: 1, name: "Mums-to-Be", ageGroup: "pregnancy", isPrivate: false, memberCount: 25 },
    { id: 2, name: "0-2 Years", ageGroup: "0-2", isPrivate: false, memberCount: 18 },
    { id: 3, name: "2-5 Years", ageGroup: "2-5", isPrivate: false, memberCount: 22 }
  ];
  res.json(defaultRooms);
});

// Basic messages endpoint
app.get("/api/chat/rooms/:roomId/messages", (req, res) => {
  const roomId = req.params.roomId;
  const messages = [
    {
      id: 1,
      content: "Welcome to the chat!",
      user: { username: "Mom123", ageGroup: "0-2", initials: "M1", avatarColor: "#ff69b4" },
      timestamp: new Date().toISOString()
    }
  ];
  res.json(messages);
});

// Basic users endpoint
app.get("/api/users", (req, res) => {
  const users = [
    { id: 1, username: "Mom123", ageGroup: "0-2", initials: "M1", avatarColor: "#ff69b4" },
    { id: 2, username: "NewMom", ageGroup: "pregnancy", initials: "NM", avatarColor: "#9d4edd" }
  ];
  res.json(users);
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  res.status(500).json({ error: "Internal server error" });
});

// Export for Vercel
export default app;