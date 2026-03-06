import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("text-zinc-400"),
  isMe: boolean("is_me").notNull().default(false),
});

export const chats = pgTable("chats", {
  id: varchar("id", { length: 100 }).primaryKey(),
  type: text("type").notNull().default("direct"), // 'direct' | 'group'
  name: text("name").notNull(),
  color: text("color"),
  initials: text("initials"),
  unreadCount: integer("unread_count").default(0),
});

export const chatParticipants = pgTable("chat_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: varchar("chat_id", { length: 100 }).notNull(),
  userId: varchar("user_id", { length: 50 }).notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id", { length: 100 }).primaryKey().default(sql`gen_random_uuid()`),
  chatId: varchar("chat_id", { length: 100 }).notNull(),
  senderId: varchar("sender_id", { length: 50 }).notNull(),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  replyToId: varchar("reply_to_id", { length: 100 }),
  isRead: boolean("is_read").default(false),
});

export const reactions = pgTable("reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id", { length: 100 }).notNull(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  emoji: text("emoji").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ });
export const insertChatSchema = createInsertSchema(chats).omit({ });
export const insertChatParticipantSchema = createInsertSchema(chatParticipants).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, timestamp: true });
export const insertReactionSchema = createInsertSchema(reactions).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;
export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = z.infer<typeof insertChatParticipantSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
