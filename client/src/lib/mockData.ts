import { format } from "date-fns";
import varunAvatar from "@/assets/avatars/varun.png";
import aliceAvatar from "@/assets/avatars/alice.png";
import bobAvatar from "@/assets/avatars/bob.png";
import meAvatar from "@/assets/avatars/me.png";
import jacobAvatar from "@/assets/avatars/jacob.png";
import bulkAvatar from "@/assets/avatars/bulk.png";

export interface User {
  id: string;
  name: string;
  avatar?: string;
  isMe: boolean;
  color: string; // for the name color in groups or fallback avatar bg
  initials?: string;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name: string;
  participants: string[];
  avatar?: string; // specific avatar for the chat (group icon or user icon)
  color?: string; // fallback bg color
  initials?: string; // fallback initials
  unreadCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  replyToId?: string;
  isRead?: boolean;
  isDelivered?: boolean;
  reactions?: { emoji: string; count: number; reactedByMe: boolean }[];
}

export const USERS: Record<string, User> = {
  me: { id: "me", name: "Me", avatar: meAvatar, isMe: true, color: "text-signal-blue" },
  varun: { id: "varun", name: "Varun", avatar: varunAvatar, isMe: false, color: "text-orange-500" },
  alice: { id: "alice", name: "Alice", avatar: aliceAvatar, isMe: false, color: "text-purple-500" },
  bob: { id: "bob", name: "Bob", avatar: bobAvatar, isMe: false, color: "text-green-500" },
  jacob: { id: "jacob", name: "Jacob Harlow Ehman", avatar: jacobAvatar, isMe: false, color: "text-orange-500" },
  lincoln: { id: "lincoln", name: "Lincolnshire", isMe: false, color: "bg-blue-600", initials: "L" },
  bulk: { id: "bulk", name: "Bulk", avatar: bulkAvatar, isMe: false, color: "text-green-600" },
  agrim: { id: "agrim", name: "Agrim Dhingra", isMe: false, color: "bg-teal-600", initials: "AD" },
  naman: { id: "naman", name: "Naman Arora", isMe: false, color: "bg-purple-600", initials: "NA" },
  ishaan: { id: "ishaan", name: "Ishaan Bansal", isMe: false, color: "bg-pink-500", initials: "IB" },
};

export const CHATS: Chat[] = [
  {
    id: "group-product",
    type: "group",
    name: "Product Team",
    participants: ["varun", "alice", "bob", "me"],
    initials: "P",
    color: "bg-gradient-to-br from-blue-400 to-purple-500",
  },
  {
    id: "dm-jacob",
    type: "direct",
    name: "Jacob Harlow Ehman",
    participants: ["jacob", "me"],
    avatar: jacobAvatar,
  },
  {
    id: "dm-lincoln",
    type: "direct",
    name: "Lincolnshire",
    participants: ["lincoln", "me"],
    initials: "L",
    color: "bg-blue-600",
  },
  {
    id: "dm-bulk",
    type: "direct",
    name: "Bulk",
    participants: ["bulk", "me"],
    avatar: bulkAvatar,
  },
  {
    id: "dm-agrim",
    type: "direct",
    name: "Agrim Dhingra",
    participants: ["agrim", "me"],
    initials: "A",
    color: "bg-gray-600", // Using gray as he didn't send the last message in screenshot
  },
  {
    id: "dm-naman",
    type: "direct",
    name: "Naman Arora",
    participants: ["naman", "me"],
    initials: "NA",
    color: "bg-purple-600",
  },
  {
    id: "dm-ishaan",
    type: "direct",
    name: "Ishaan Bansal",
    participants: ["ishaan", "me"],
    initials: "IB",
    color: "bg-pink-500",
    unreadCount: 3,
  },
];

export const INITIAL_MESSAGES: Message[] = [
  // Product Team Messages
  {
    id: "m1",
    chatId: "group-product",
    senderId: "varun",
    text: "Hey everyone! For this pitch, I’m proposing a reply-threads experience in Signal.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "m2",
    chatId: "group-product",
    senderId: "alice",
    text: "Oh interesting. Like Slack threads?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9),
    replyToId: "m1",
  },
  {
    id: "m3",
    chatId: "group-product",
    senderId: "varun",
    text: "Exactly. The problem is context switching. Jumping back to the original message breaks flow.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.8),
    replyToId: "m2",
  },
  {
    id: "m4",
    chatId: "group-product",
    senderId: "bob",
    text: "I hate scrolling back up in active groups. This would be huge.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
    replyToId: "m1",
  },
  {
    id: "m5",
    chatId: "group-product",
    senderId: "me",
    text: "How would it handle nested threads though? Does it get complicated?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.4),
    replyToId: "m1",
  },
  {
    id: "m6",
    chatId: "group-product",
    senderId: "varun",
    text: "To keep it simple, I'd limit it to single-level threads. No nested replies inside threads.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.3),
    replyToId: "m5",
  },
  {
    id: "m7",
    chatId: "group-product",
    senderId: "alice",
    text: "Makes sense. Keep it lightweight.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.2),
    replyToId: "m6",
  },
  {
    id: "m8",
    chatId: "group-product",
    senderId: "me",
    text: "I'm in. Let's prototype it.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },

  // Jacob Messages
  {
    id: "j1",
    chatId: "dm-jacob",
    senderId: "jacob",
    text: "Thank you my friend",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
  {
    id: "j2",
    chatId: "dm-jacob",
    senderId: "me",
    text: "U gonna be in Virginia this summer??",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    isRead: true,
  },
  {
    id: "j3",
    chatId: "dm-jacob",
    senderId: "jacob",
    text: "I hope so",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  {
    id: "j4",
    chatId: "dm-jacob",
    senderId: "me",
    text: "LMK if you want a room, brother man",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    isRead: true,
  },
  {
    id: "j5",
    chatId: "dm-jacob",
    senderId: "me",
    text: "Down to live in Reston, Virginia",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    isRead: true,
  },
  {
    id: "j6",
    chatId: "dm-jacob",
    senderId: "jacob",
    text: "Most definitely",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    id: "j7",
    chatId: "dm-jacob",
    senderId: "jacob",
    text: "So are you fs doing Amazon",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    id: "j8",
    chatId: "dm-jacob",
    senderId: "me",
    text: "As of now, yeah I don't got shit",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    isRead: true,
  },
  {
    id: "j9",
    chatId: "dm-jacob",
    senderId: "me",
    text: "Will be good for the résumé extra recruiting cycle!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    isRead: true,
  },
  {
    id: "j10",
    chatId: "dm-jacob",
    senderId: "jacob",
    text: "Smart man",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "j11",
    chatId: "dm-jacob",
    senderId: "jacob",
    text: "I hope I will see you in va my friend",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "j12",
    chatId: "dm-jacob",
    senderId: "jacob",
    text: "Would be very fun",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "j13",
    chatId: "dm-jacob",
    senderId: "jacob",
    text: "🙏 ❤️",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "j14",
    chatId: "dm-jacob",
    senderId: "me",
    text: "Fs",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
    isRead: true,
  },
  {
    id: "j15",
    chatId: "dm-jacob",
    senderId: "jacob",
    text: "When is your meeting with them?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "j16",
    chatId: "dm-jacob",
    senderId: "me",
    text: "Haven't gotten anything",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    isRead: true,
  },

  // Other Chats (Single last message)
  {
    id: "l1",
    chatId: "dm-lincoln",
    senderId: "lincoln",
    text: "I'm on a high",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: "b1",
    chatId: "dm-bulk",
    senderId: "bulk",
    text: "Agrim: rate amazon brisket on beli lmao",
    timestamp: new Date("2025-05-20"),
  },
  {
    id: "a1",
    chatId: "dm-agrim",
    senderId: "agrim",
    text: "with ayan",
    timestamp: new Date("2025-04-26"),
  },
  {
    id: "n1",
    chatId: "dm-naman",
    senderId: "naman",
    text: "❤️",
    timestamp: new Date("2025-04-05"),
  },
  {
    id: "i1",
    chatId: "dm-ishaan",
    senderId: "ishaan",
    text: "lmao it's varun from UT?",
    timestamp: new Date("2025-03-29"),
  },
];
