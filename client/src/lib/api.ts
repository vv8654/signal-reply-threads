import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "./queryClient";
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
  color: string;
  initials?: string;
}

export interface Chat {
  id: string;
  type: string;
  name: string;
  participants: string[];
  avatar?: string;
  color?: string | null;
  initials?: string | null;
  unreadCount?: number | null;
  lastMessage?: Message | null;
}

export interface ReactionInfo {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  replyToId?: string | null;
  isRead?: boolean | null;
  reactions?: ReactionInfo[];
}

const AVATAR_MAP: Record<string, string> = {
  varun: varunAvatar,
  alice: aliceAvatar,
  bob: bobAvatar,
  me: meAvatar,
  jacob: jacobAvatar,
  bulk: bulkAvatar,
};

function mapUser(raw: any): User {
  return {
    id: raw.id,
    name: raw.name,
    avatar: AVATAR_MAP[raw.id],
    isMe: raw.isMe,
    color: raw.color,
    initials: raw.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2),
  };
}

function mapMessage(raw: any): Message {
  const rawReactions: any[] = raw.reactions || [];
  const reactionMap: Record<string, { count: number; reactedByMe: boolean }> = {};
  for (const r of rawReactions) {
    if (!reactionMap[r.emoji]) {
      reactionMap[r.emoji] = { count: 0, reactedByMe: false };
    }
    reactionMap[r.emoji].count++;
    if (r.userId === "me") {
      reactionMap[r.emoji].reactedByMe = true;
    }
  }
  const reactions: ReactionInfo[] = Object.entries(reactionMap).map(([emoji, data]) => ({
    emoji,
    ...data,
  }));

  return {
    id: raw.id,
    chatId: raw.chatId,
    senderId: raw.senderId,
    text: raw.text,
    timestamp: new Date(raw.timestamp),
    replyToId: raw.replyToId,
    isRead: raw.isRead,
    reactions: reactions.length > 0 ? reactions : undefined,
  };
}

function mapChat(raw: any): Chat {
  const chat: Chat = {
    id: raw.id,
    type: raw.type,
    name: raw.name,
    participants: raw.participants || [],
    color: raw.color,
    initials: raw.initials,
    unreadCount: raw.unreadCount,
    lastMessage: raw.lastMessage ? mapMessage(raw.lastMessage) : null,
  };
  if (raw.type === "direct") {
    const otherId = chat.participants.find((p: string) => p !== "me");
    if (otherId && AVATAR_MAP[otherId]) {
      chat.avatar = AVATAR_MAP[otherId];
    }
  }
  return chat;
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["/api/users"],
    select: (data: any[]) => data.map(mapUser),
  });
}

export function useUsersMap() {
  const { data: users } = useUsers();
  const map: Record<string, User> = {};
  if (users) {
    for (const u of users) {
      map[u.id] = u;
    }
  }
  return map;
}

export function useChats() {
  return useQuery<Chat[]>({
    queryKey: ["/api/chats"],
    select: (data: any[]) => data.map(mapChat),
  });
}

export function useMessages(chatId: string) {
  return useQuery<Message[]>({
    queryKey: ["/api/chats", chatId, "messages"],
    select: (data: any[]) => data.map(mapMessage),
    enabled: !!chatId,
  });
}

export function useThread(messageId: string | null) {
  return useQuery<{ original: Message; replies: Message[] }>({
    queryKey: ["/api/messages", messageId!, "thread"],
    select: (data: any) => ({
      original: mapMessage(data.original),
      replies: data.replies.map(mapMessage),
    }),
    enabled: !!messageId,
  });
}

export function useSendMessage(chatId: string) {
  return useMutation({
    mutationFn: async (data: { senderId: string; text: string; replyToId?: string }) => {
      const res = await apiRequest("POST", `/api/chats/${chatId}/messages`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats", chatId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });
}

export function useDeleteMessage(chatId: string) {
  return useMutation({
    mutationFn: async (messageId: string) => {
      const res = await apiRequest("DELETE", `/api/messages/${messageId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats", chatId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });
}

export function useCreateChat() {
  return useMutation({
    mutationFn: async (data: { name: string; type: string; participants: string[]; color?: string; initials?: string }) => {
      const res = await apiRequest("POST", "/api/chats", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    },
  });
}

export function useMarkAllRead() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/chats/mark-all-read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    },
  });
}

export function useToggleReaction(chatId: string) {
  return useMutation({
    mutationFn: async ({ messageId, emoji, isRemoving }: { messageId: string; emoji: string; isRemoving: boolean }) => {
      if (isRemoving) {
        const res = await apiRequest("DELETE", `/api/messages/${messageId}/reactions`, { emoji, userId: "me" });
        return res.json();
      } else {
        const res = await apiRequest("POST", `/api/messages/${messageId}/reactions`, { emoji, userId: "me" });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats", chatId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });
}
