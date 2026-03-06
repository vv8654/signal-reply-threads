import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertReactionSchema } from "@shared/schema";
import crypto from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/users", async (_req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.get("/api/chats", async (_req, res) => {
    const allChats = await storage.getChats();
    const result = await Promise.all(allChats.map(async (chat) => {
      const participants = await storage.getChatParticipants(chat.id);
      const msgs = await storage.getMessagesByChat(chat.id);
      const lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;
      return { ...chat, participants, lastMessage };
    }));
    res.json(result);
  });

  app.get("/api/chats/:id", async (req, res) => {
    const chat = await storage.getChat(req.params.id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    const participants = await storage.getChatParticipants(chat.id);
    res.json({ ...chat, participants });
  });

  app.get("/api/chats/:chatId/messages", async (req, res) => {
    const msgs = await storage.getMessagesByChat(req.params.chatId);
    const msgsWithReactions = await Promise.all(msgs.map(async (msg) => {
      const rxns = await storage.getReactionsByMessage(msg.id);
      return { ...msg, reactions: rxns };
    }));
    res.json(msgsWithReactions);
  });

  app.post("/api/chats/:chatId/messages", async (req, res) => {
    const parsed = insertMessageSchema.safeParse({
      ...req.body,
      chatId: req.params.chatId,
    });
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid message data", errors: parsed.error.flatten() });
    }
    const message = await storage.createMessage(parsed.data);
    res.status(201).json(message);
  });

  app.delete("/api/messages/:messageId", async (req, res) => {
    const msg = await storage.getMessage(req.params.messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    await storage.deleteMessage(req.params.messageId);
    res.json({ success: true });
  });

  app.get("/api/messages/:messageId/thread", async (req, res) => {
    const original = await storage.getMessage(req.params.messageId);
    if (!original) return res.status(404).json({ message: "Message not found" });
    const replies = await storage.getThreadReplies(req.params.messageId);
    const originalReactions = await storage.getReactionsByMessage(original.id);
    const repliesWithReactions = await Promise.all(replies.map(async (r) => {
      const rxns = await storage.getReactionsByMessage(r.id);
      return { ...r, reactions: rxns };
    }));
    res.json({ original: { ...original, reactions: originalReactions }, replies: repliesWithReactions });
  });

  app.post("/api/messages/:messageId/reactions", async (req, res) => {
    const { emoji, userId } = req.body;
    if (!emoji || !userId) {
      return res.status(400).json({ message: "emoji and userId required" });
    }
    const reaction = await storage.addReaction({
      messageId: req.params.messageId,
      userId,
      emoji,
    });
    res.status(201).json(reaction);
  });

  app.delete("/api/messages/:messageId/reactions", async (req, res) => {
    const { emoji, userId } = req.body;
    if (!emoji || !userId) {
      return res.status(400).json({ message: "emoji and userId required" });
    }
    await storage.removeReaction(req.params.messageId, userId, emoji);
    res.json({ success: true });
  });

  app.post("/api/chats", async (req, res) => {
    const { name, type, participants, color, initials } = req.body;
    if (!name || !participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: "name and participants[] required" });
    }
    const chatType = type || "group";
    const chatId = `${chatType === "direct" ? "dm" : "group"}-${crypto.randomUUID().slice(0, 8)}`;
    const allParticipants = participants.includes("me") ? participants : ["me", ...participants];
    const chat = await storage.createChatWithParticipants(
      {
        id: chatId,
        name,
        type: chatType,
        color: color || "bg-gradient-to-br from-blue-400 to-purple-500",
        initials: initials || name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
        unreadCount: 0,
      },
      allParticipants
    );
    res.status(201).json({ ...chat, participants: allParticipants, lastMessage: null });
  });

  app.post("/api/chats/mark-all-read", async (_req, res) => {
    await storage.markAllChatsRead();
    res.json({ success: true });
  });

  return httpServer;
}
