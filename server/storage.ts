import { eq, and, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  users, chats, chatParticipants, messages, reactions,
  type User, type InsertUser,
  type Chat, type InsertChat,
  type ChatParticipant, type InsertChatParticipant,
  type Message, type InsertMessage,
  type Reaction, type InsertReaction,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;

  getChats(): Promise<Chat[]>;
  getChat(id: string): Promise<Chat | undefined>;
  createChat(chat: InsertChat): Promise<Chat>;
  getChatParticipants(chatId: string): Promise<string[]>;
  addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant>;

  getMessagesByChat(chatId: string): Promise<Message[]>;
  getMessage(id: string): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: string): Promise<void>;
  getThreadReplies(messageId: string): Promise<Message[]>;

  getReactionsByMessage(messageId: string): Promise<Reaction[]>;
  addReaction(reaction: InsertReaction): Promise<Reaction>;
  removeReaction(messageId: string, userId: string, emoji: string): Promise<void>;
  markAllChatsRead(): Promise<void>;
  createChatWithParticipants(chatData: InsertChat, participantIds: string[]): Promise<Chat>;
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getChats(): Promise<Chat[]> {
    return db.select().from(chats);
  }

  async getChat(id: string): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    return chat;
  }

  async createChat(chat: InsertChat): Promise<Chat> {
    const [created] = await db.insert(chats).values(chat).returning();
    return created;
  }

  async getChatParticipants(chatId: string): Promise<string[]> {
    const rows = await db.select().from(chatParticipants).where(eq(chatParticipants.chatId, chatId));
    return rows.map(r => r.userId);
  }

  async addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant> {
    const [created] = await db.insert(chatParticipants).values(participant).returning();
    return created;
  }

  async getMessagesByChat(chatId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(asc(messages.timestamp));
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const [msg] = await db.select().from(messages).where(eq(messages.id, id));
    return msg;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async deleteMessage(id: string): Promise<void> {
    await db.delete(reactions).where(eq(reactions.messageId, id));
    await db.delete(messages).where(eq(messages.replyToId, id));
    await db.delete(messages).where(eq(messages.id, id));
  }

  async getThreadReplies(messageId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(eq(messages.replyToId, messageId))
      .orderBy(asc(messages.timestamp));
  }

  async getReactionsByMessage(messageId: string): Promise<Reaction[]> {
    return db.select().from(reactions).where(eq(reactions.messageId, messageId));
  }

  async addReaction(reaction: InsertReaction): Promise<Reaction> {
    const existing = await db.select().from(reactions).where(
      and(
        eq(reactions.messageId, reaction.messageId),
        eq(reactions.userId, reaction.userId),
        eq(reactions.emoji, reaction.emoji),
      )
    );
    if (existing.length > 0) return existing[0];
    const [created] = await db.insert(reactions).values(reaction).returning();
    return created;
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    await db.delete(reactions).where(
      and(
        eq(reactions.messageId, messageId),
        eq(reactions.userId, userId),
        eq(reactions.emoji, emoji),
      )
    );
  }

  async markAllChatsRead(): Promise<void> {
    await db.update(chats).set({ unreadCount: 0 });
    await db.update(messages).set({ isRead: true });
  }

  async createChatWithParticipants(
    chatData: InsertChat,
    participantIds: string[]
  ): Promise<Chat> {
    const [chat] = await db.insert(chats).values(chatData).returning();
    for (const userId of participantIds) {
      await db.insert(chatParticipants).values({ chatId: chat.id, userId });
    }
    return chat;
  }
}

export const storage = new DatabaseStorage();
