import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { type Message, type User, useToggleReaction, useDeleteMessage } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Reply, Check, CheckCheck, Smile, MoreHorizontal, ChevronRight, Copy, Trash2, Forward, MousePointer2, Pin, Info, Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface MessageBubbleProps {
  message: Message;
  allMessages: Message[];
  usersMap: Record<string, User>;
  onReply: (messageId: string) => void;
  onThreadOpen: (originalMessageId: string) => void;
  onJumpToMessage: (messageId: string) => void;
  showAvatar?: boolean;
  onForward?: (text: string) => void;
  onPin?: (messageId: string) => void;
  onSelect?: (messageId: string) => void;
  isPinned?: boolean;
  hideActions?: boolean;
}

const bubbleSpring = {
  type: "spring" as const,
  damping: 25,
  stiffness: 350,
  mass: 0.6,
};

export function MessageBubble({
  message,
  allMessages,
  usersMap,
  onReply,
  onThreadOpen,
  onJumpToMessage,
  showAvatar = true,
  onForward,
  onPin,
  onSelect,
  isPinned = false,
  hideActions = false,
}: MessageBubbleProps) {
  const sender = usersMap[message.senderId];
  const isMe = sender?.isMe ?? false;
  const { toast } = useToast();
  const toggleReaction = useToggleReaction(message.chatId);
  const deleteMessage = useDeleteMessage(message.chatId);

  const replies = allMessages.filter(m => m.replyToId === message.id);
  const hasReplies = replies.length > 0;

  const replyToMessage = message.replyToId ? allMessages.find(m => m.id === message.replyToId) : null;
  const replyToSender = replyToMessage ? usersMap[replyToMessage.senderId] : null;

  const handleReaction = (emoji: string) => {
    const existing = message.reactions?.find(r => r.emoji === emoji);
    toggleReaction.mutate({
      messageId: message.id,
      emoji,
      isRemoving: existing?.reactedByMe ?? false,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    toast({ description: "Copied to clipboard" });
  };

  const handleDelete = () => {
    deleteMessage.mutate(message.id);
    toast({ description: "Message deleted" });
  };

  const handleForward = () => {
    if (onForward) {
      onForward(message.text);
    } else {
      navigator.clipboard.writeText(message.text);
      toast({ description: "Message copied for forwarding" });
    }
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(message.id);
    } else {
      toast({ description: "Message selected" });
    }
  };

  const handlePin = () => {
    if (onPin) {
      onPin(message.id);
    } else {
      toast({ description: "Message pinned" });
    }
  };

  const handleInfo = () => {
    const time = format(message.timestamp, "MMM d, yyyy 'at' h:mm a");
    toast({ title: "Message Info", description: `Sent ${time} by ${sender?.name}` });
  };

  if (!sender) return null;

  const uniqueRepliers = Array.from(new Set(replies.map(r => r.senderId)));

  const truncateText = (text: string, max: number) => {
    if (text.length <= max) return text;
    return text.slice(0, max) + "...";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={bubbleSpring}
      layout="position"
      className={cn(
        "flex w-full mb-0.5 group px-4 relative",
        isMe ? "justify-end" : "justify-start"
      )}
      data-testid={`message-bubble-${message.id}`}
    >
      {!isMe && showAvatar && (
        <div className="w-7 h-7 mr-2.5 mt-auto flex-shrink-0">
          {sender.avatar ? (
            <img src={sender.avatar} className="w-full h-full rounded-full object-cover" alt="" />
          ) : (
            <div className={cn("w-full h-full rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm",
              sender.id === 'varun' ? 'bg-orange-700' :
              sender.id === 'alice' ? 'bg-purple-700' :
              sender.id === 'bob' ? 'bg-green-700' : 'bg-zinc-600'
            )}>
              {sender.name[0]}
            </div>
          )}
        </div>
      )}
      {!isMe && !showAvatar && <div className="w-7 h-7 mr-2.5 flex-shrink-0" />}

      <div className={cn("max-w-[65%] flex flex-col relative", isMe ? "items-end" : "items-start")}>
        {!isMe && showAvatar && (
          <span className={cn("text-[11px] font-semibold mb-0.5 ml-3 opacity-80", sender.color)}>
            {sender.name}
          </span>
        )}

        {replyToMessage && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={() => onJumpToMessage(replyToMessage.id)}
            className={cn(
              "flex items-stretch gap-0 rounded-xl mb-1 cursor-pointer group/reply transition-all hover:brightness-110 overflow-hidden max-w-full",
              isMe ? "bg-white/10" : "bg-zinc-700/60"
            )}
            data-testid={`reply-preview-${message.id}`}
          >
            <div className={cn(
              "w-1 shrink-0 rounded-l-xl",
              replyToSender?.isMe ? "bg-signal-blue" :
              replyToSender?.id === 'varun' ? 'bg-orange-500' :
              replyToSender?.id === 'alice' ? 'bg-purple-500' :
              replyToSender?.id === 'bob' ? 'bg-green-500' : 'bg-zinc-400'
            )} />
            <div className="px-2.5 py-1.5 min-w-0 flex-1">
              <p className={cn(
                "text-[11px] font-semibold leading-none mb-0.5",
                replyToSender?.isMe ? "text-signal-blue" :
                replyToSender?.color || "text-zinc-300"
              )}>
                {replyToSender?.isMe ? "You" : replyToSender?.name || "Unknown"}
              </p>
              <p className={cn(
                "text-[12px] leading-snug truncate",
                isMe ? "text-white/60" : "text-zinc-400"
              )}>
                {truncateText(replyToMessage.text, 80)}
              </p>
            </div>
          </motion.div>
        )}

        {!replyToMessage && message.replyToId && (
          <div className={cn(
            "flex items-center gap-1.5 rounded-xl mb-1 px-3 py-1.5",
            isMe ? "bg-white/10" : "bg-zinc-700/60"
          )}>
            <Reply className="w-3 h-3 text-zinc-500" />
            <span className="text-[11px] text-zinc-500 italic">Original message unavailable</span>
          </div>
        )}

        <motion.div
          whileHover={{ scale: 1.005 }}
          transition={{ type: "spring", damping: 30, stiffness: 500 }}
          className={cn(
            "relative px-3.5 py-2 rounded-[20px] text-[15px] leading-snug",
            isMe
              ? "bg-signal-blue text-white rounded-br-[6px]"
              : "bg-zinc-800 text-zinc-100 rounded-bl-[6px] border border-white/[0.04]"
          )}
        >
          <div className="whitespace-pre-wrap break-words">{message.text}</div>

          <div
            className={cn(
              "flex items-center justify-end gap-1 text-[10px] mt-0.5 select-none",
              isMe ? "text-white/50" : "text-zinc-500"
            )}
          >
            <Lock className="w-2.5 h-2.5" />
            <span>{format(message.timestamp, "h:mm a")}</span>
            {isMe && (
              <span className="ml-0.5">
                {message.isRead ? <CheckCheck className="w-3 h-3 inline" /> : <Check className="w-3 h-3 inline" />}
              </span>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {message.reactions && message.reactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", damping: 20, stiffness: 400 }}
              className={cn("flex flex-wrap gap-1 -mt-1.5 relative z-10", isMe ? "justify-end mr-2" : "ml-2")}
            >
              {message.reactions.map((r) => (
                <motion.button
                  key={r.emoji}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleReaction(r.emoji)}
                  className={cn(
                    "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors",
                    r.reactedByMe
                      ? "bg-signal-blue/20 border-signal-blue/40 text-signal-blue"
                      : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                  )}
                  data-testid={`reaction-${message.id}-${r.emoji}`}
                >
                  <span>{r.emoji}</span>
                  <span className="font-medium text-[11px]">{r.count}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {hasReplies && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onThreadOpen(message.id)}
            className={cn(
              "mt-1 flex items-center gap-1.5 cursor-pointer transition-colors rounded-full px-2.5 py-1 -mx-1",
              "hover:bg-signal-blue/10",
              isMe ? "flex-row-reverse mr-1" : "ml-1"
            )}
            data-testid={`thread-indicator-${message.id}`}
          >
            <div className="flex -space-x-1.5">
              {uniqueRepliers.slice(0, 3).map(senderId => {
                const replySender = usersMap[senderId];
                return (
                  <div key={senderId} className={cn("w-4 h-4 rounded-full ring-2 ring-background flex items-center justify-center text-[7px] font-bold text-white overflow-hidden",
                    senderId === 'varun' ? 'bg-orange-700' :
                    senderId === 'alice' ? 'bg-purple-700' :
                    senderId === 'bob' ? 'bg-green-700' :
                    senderId === 'me' ? 'bg-signal-blue' : 'bg-zinc-600'
                  )}>
                    {replySender?.name[0] || "?"}
                  </div>
                );
              })}
            </div>
            <span className="text-signal-blue font-semibold text-xs">
              View Thread ({replies.length})
            </span>
            <ChevronRight className="w-3 h-3 text-signal-blue" />
          </motion.div>
        )}

        {!hideActions && (
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 flex items-center bg-zinc-800/95 backdrop-blur-sm border border-zinc-700/80 shadow-xl rounded-xl p-0.5 gap-0.5 z-20",
            isMe ? "left-0 -translate-x-[calc(100%+8px)]" : "right-0 translate-x-[calc(100%+8px)]"
          )}>
            <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors" title="Reply" onClick={() => onReply(message.id)} data-testid={`button-reply-${message.id}`}>
              <Reply className="w-3.5 h-3.5" />
            </Button>

            <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors" title="View Thread" onClick={() => onThreadOpen(message.id)} data-testid={`button-thread-${message.id}`}>
              <MessageSquare className="w-3.5 h-3.5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors" title="React">
                  <Smile className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="flex gap-0.5 bg-zinc-800/95 backdrop-blur-sm border-zinc-700 p-1.5 rounded-xl">
                {["👍", "❤️", "😂", "😮", "😢", "😡"].map(emoji => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(emoji)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-zinc-700 rounded-lg text-lg"
                    data-testid={`button-react-${emoji}`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-800/95 backdrop-blur-sm border-zinc-700 text-zinc-100 w-44 rounded-xl">
                <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer gap-2 rounded-lg" onClick={handleForward} data-testid={`menu-forward-${message.id}`}>
                  <Forward className="w-4 h-4" /> Forward
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer gap-2 rounded-lg" onClick={handleSelect} data-testid={`menu-select-${message.id}`}>
                  <MousePointer2 className="w-4 h-4" /> Select
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer gap-2 rounded-lg" onClick={handleCopy} data-testid={`menu-copy-${message.id}`}>
                  <Copy className="w-4 h-4" /> Copy text
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer gap-2 rounded-lg" onClick={handlePin} data-testid={`menu-pin-${message.id}`}>
                  <Pin className="w-4 h-4" /> {isPinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer gap-2 rounded-lg" onClick={handleInfo} data-testid={`menu-info-${message.id}`}>
                  <Info className="w-4 h-4" /> Info
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-700/50" />
                <DropdownMenuItem className="focus:bg-zinc-700 focus:text-red-400 text-red-400 cursor-pointer gap-2 rounded-lg" onClick={handleDelete} data-testid={`menu-delete-${message.id}`}>
                  <Trash2 className="w-4 h-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </motion.div>
  );
}
