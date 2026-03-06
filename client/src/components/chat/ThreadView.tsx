import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThread, type User } from "@/lib/api";
import { X, Send, Lock, MessageSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ThreadViewProps {
  isOpen: boolean;
  originalMessageId: string | null;
  chatId: string;
  usersMap: Record<string, User>;
  onClose: () => void;
  onSendReply: (text: string, parentId: string) => void;
}

const panelSpring = {
  type: "spring" as const,
  damping: 28,
  stiffness: 280,
  mass: 0.8,
};

function SenderAvatar({ user, size = "sm" }: { user?: User; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "w-9 h-9 text-sm" : "w-7 h-7 text-[10px]";
  if (user?.avatar) {
    return <img src={user.avatar} className={cn(sizeClass, "rounded-full object-cover")} alt="" />;
  }
  return (
    <div className={cn(sizeClass, "rounded-full flex items-center justify-center font-bold text-white shadow-sm",
      user?.id === 'varun' ? 'bg-orange-700' :
      user?.id === 'alice' ? 'bg-purple-700' :
      user?.id === 'bob' ? 'bg-green-700' :
      user?.isMe ? 'bg-signal-blue' : 'bg-zinc-600'
    )}>
      {user?.isMe ? "M" : user?.name?.[0] || "?"}
    </div>
  );
}

function ThreadPanelContent({
  originalMessage,
  sortedReplies,
  usersMap,
  onClose,
  onSendReply,
  originalMessageId,
}: {
  originalMessage: any;
  sortedReplies: any[];
  usersMap: Record<string, User>;
  onClose: () => void;
  onSendReply: (text: string, parentId: string) => void;
  originalMessageId: string | null;
}) {
  const [inputValue, setInputValue] = useState("");
  const [justSent, setJustSent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: justSent ? "smooth" : "auto",
        });
      });
    }
  }, [justSent]);

  useEffect(() => {
    scrollToBottom();
    setJustSent(false);
  }, [sortedReplies.length, scrollToBottom]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = originalMessage?.id || originalMessageId;
    if (inputValue.trim() && targetId) {
      setJustSent(true);
      onSendReply(inputValue, targetId);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  const originalSender = originalMessage ? usersMap[originalMessage.senderId] : null;

  return (
    <>
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-signal-blue" />
          <span className="text-sm font-semibold text-zinc-200">Thread</span>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">{sortedReplies.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 rounded-full">
            <Lock className="w-2.5 h-2.5 text-green-500" />
            <span className="text-[10px] font-medium text-green-500">E2E</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-7 h-7 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
            data-testid="button-close-thread"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-4 scrollbar-hide overscroll-contain">
        {originalMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...panelSpring }}
            className="mb-4"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <SenderAvatar user={originalSender!} size="md" />
              <div>
                <span className="font-semibold text-sm text-zinc-200">
                  {originalSender?.isMe ? "You" : originalSender?.name}
                </span>
                <span className="text-[11px] text-zinc-500 ml-2">
                  {format(originalMessage.timestamp, "h:mm a")}
                </span>
              </div>
            </div>

            <div className={cn(
              "px-4 py-3 rounded-2xl text-[15px] leading-relaxed",
              originalSender?.isMe
                ? "bg-signal-blue text-white rounded-br-[6px]"
                : "bg-zinc-800 text-zinc-100 rounded-bl-[6px] border border-white/5"
            )}>
              {originalMessage.text}
            </div>
          </motion.div>
        ) : (
          <div className="mb-4 flex items-center gap-2 bg-zinc-800/60 rounded-2xl px-4 py-3 border border-zinc-700/50">
            <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="text-sm text-zinc-400 italic">Original message unavailable</span>
          </div>
        )}

        {sortedReplies.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px bg-zinc-700/40 flex-1" />
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider" data-testid="text-reply-count">
              {sortedReplies.length} {sortedReplies.length === 1 ? "Reply" : "Replies"}
            </span>
            <div className="h-px bg-zinc-700/40 flex-1" />
          </div>
        )}

        <div className="space-y-0.5">
          {sortedReplies.map((reply, i) => {
            const replySender = usersMap[reply.senderId];
            const isMe = replySender?.isMe;
            const prevReply = sortedReplies[i - 1];
            const sameSenderAsPrev = prevReply?.senderId === reply.senderId;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: justSent && i === sortedReplies.length - 1 ? 0 : 0.03 * Math.min(i, 8),
                  type: "spring",
                  damping: 25,
                  stiffness: 350,
                }}
                key={reply.id}
                className={cn(
                  "flex w-full",
                  isMe ? "justify-end" : "justify-start",
                  !sameSenderAsPrev ? "mt-3" : "mt-0.5"
                )}
                data-testid={`thread-reply-${reply.id}`}
              >
                <div className={cn("flex gap-2 max-w-[85%]", isMe ? "flex-row-reverse" : "")}>
                  {!sameSenderAsPrev ? (
                    <SenderAvatar user={replySender} />
                  ) : (
                    <div className="w-7 shrink-0" />
                  )}

                  <div className={cn("min-w-0", isMe ? "flex flex-col items-end" : "")}>
                    {!sameSenderAsPrev && (
                      <div className={cn("flex items-baseline gap-1.5 mb-0.5", isMe ? "flex-row-reverse" : "")}>
                        <span className={cn("font-semibold text-[11px]", replySender?.color || "text-zinc-300")}>
                          {isMe ? "You" : replySender?.name}
                        </span>
                        <span className="text-[10px] text-zinc-600">
                          {format(reply.timestamp, "h:mm a")}
                        </span>
                      </div>
                    )}
                    <div className={cn(
                      "px-3 py-2 rounded-[18px] text-[14px] leading-snug inline-block max-w-full break-words",
                      isMe
                        ? "bg-signal-blue text-white rounded-br-[5px]"
                        : "bg-zinc-800 text-zinc-200 rounded-bl-[5px] border border-white/5"
                    )}>
                      {reply.text}
                    </div>
                    {sameSenderAsPrev && (
                      <span className={cn("text-[9px] text-zinc-600 mt-0.5 px-1", isMe ? "text-right" : "")}>
                        {format(reply.timestamp, "h:mm a")}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="h-4" />
      </div>

      <div className="px-3 pb-4 pt-2 border-t border-white/[0.06] shrink-0">
        <form onSubmit={handleSendReply} className="flex items-end gap-2">
          <div className="flex-1 bg-zinc-800 rounded-full flex items-center px-3 py-1.5 min-h-[40px] border border-white/5 focus-within:border-zinc-600 transition-colors">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Reply in thread..."
              className="border-0 shadow-none bg-transparent focus-visible:ring-0 px-1 py-0.5 text-[14px] placeholder:text-zinc-500 text-zinc-100 h-auto"
              data-testid="input-thread-reply"
            />
          </div>
          <AnimatePresence mode="popLayout">
            {inputValue.trim() && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 400 }}
              >
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full w-10 h-10 shrink-0 bg-signal-blue hover:bg-blue-500 transition-colors shadow-lg shadow-signal-blue/20 active:scale-95"
                  data-testid="button-send-reply"
                >
                  <Send className="w-4 h-4 ml-0.5 text-white" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </>
  );
}

export function ThreadView({
  isOpen,
  originalMessageId,
  chatId,
  usersMap,
  onClose,
  onSendReply,
}: ThreadViewProps) {
  const { data: threadData, refetch } = useThread(isOpen ? originalMessageId : null);

  const originalMessage = threadData?.original;
  const sortedReplies = threadData?.replies || [];

  const handleSendReply = (text: string, parentId: string) => {
    onSendReply(text, parentId);
    setTimeout(() => refetch(), 300);
  };

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 380, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={panelSpring}
      className="h-full bg-zinc-900 border-l border-white/[0.06] flex flex-col overflow-hidden shrink-0"
      data-testid="thread-panel"
    >
      <ThreadPanelContent
        originalMessage={originalMessage}
        sortedReplies={sortedReplies}
        usersMap={usersMap}
        onClose={onClose}
        onSendReply={handleSendReply}
        originalMessageId={originalMessageId}
      />
    </motion.div>
  );
}
