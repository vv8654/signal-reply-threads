import { useState, useRef, useEffect } from "react";
import { useUsersMap, useChats, useMessages, useSendMessage, type Message, type Chat } from "@/lib/api";
import { MessageBubble } from "./MessageBubble";
import { ThreadView } from "./ThreadView";
import { ChatSidebar } from "./ChatSidebar";
import { EmojiPicker } from "./EmojiPicker";
import { CallScreen } from "./CallScreen";
import { DisappearingMessagesDialog, AllMediaDialog, ConversationSettingsDialog, BlockDialog, ForwardDialog, LocationDialog, ChatSearchOverlay, SafetyNumberDialog } from "./ChatDialogs";
import { Phone, Video, MoreHorizontal, Plus, Search, Sticker, Mic, Send, StopCircle, Paperclip, Image, FileText, MapPin, X, Lock, ShieldCheck, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";

export function ChatInterface() {
  const [activeChatId, setActiveChatId] = useState<string>("group-product");
  const [threadOpen, setThreadOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState<"video" | "audio">("video");
  const [callContactName, setCallContactName] = useState("");
  const [callContactInitials, setCallContactInitials] = useState("");
  const [callContactColor, setCallContactColor] = useState("bg-zinc-700");
  const [callContactAvatar, setCallContactAvatar] = useState<string | null | undefined>(null);

  const [showChatSearch, setShowChatSearch] = useState(false);
  const [showDisappearing, setShowDisappearing] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [showConvoSettings, setShowConvoSettings] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [forwardMessageText, setForwardMessageText] = useState("");
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showSafetyNumbers, setShowSafetyNumbers] = useState(false);
  const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const usersMap = useUsersMap();
  const { data: chats = [] } = useChats();
  const { data: messages = [] } = useMessages(activeChatId);
  const sendMessage = useSendMessage(activeChatId);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const replyingToMessage = replyingTo ? messages.find(m => m.id === replyingTo) : null;
  const replyingToSender = replyingToMessage ? usersMap[replyingToMessage.senderId] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    setReplyingTo(null);
    setThreadOpen(false);
  }, [activeChatId]);

  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      recordingInterval.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    }
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    };
  }, [isRecording]);

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text && !attachedFile) return;
    let messageText = text;
    if (attachedFile) {
      const fileInfo = `📎 ${attachedFile.name}`;
      messageText = text ? `${fileInfo}\n${text}` : fileInfo;
    }
    if (messageText) {
      sendMessage.mutate({
        senderId: "me",
        text: messageText,
        ...(replyingTo ? { replyToId: replyingTo } : {}),
      });
    }
    setInputValue("");
    setAttachedFile(null);
    setReplyingTo(null);
  };

  const handleSendReply = (text: string, parentId: string) => {
    sendMessage.mutate({ senderId: "me", text, replyToId: parentId });
  };

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
    inputRef.current?.focus();
  };

  const openThread = (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg?.replyToId) {
      setActiveThreadId(msg.replyToId);
    } else {
      setActiveThreadId(messageId);
    }
    setThreadOpen(true);
  };

  const handleCall = (type: "video" | "audio") => {
    setCallType(type);
    setCallContactName(activeChat?.name || "");
    setCallContactInitials(activeChat?.initials || activeChat?.name?.[0] || "?");
    setCallContactColor(activeChat?.color || "bg-zinc-700");
    setCallContactAvatar(activeChat?.avatar);
    setCallActive(true);
  };

  const handleStartCallFromSidebar = (contactName: string, contactInitials: string, contactColor: string, contactAvatar: string | null | undefined, callType: "video" | "audio") => {
    setCallType(callType);
    setCallContactName(contactName);
    setCallContactInitials(contactInitials);
    setCallContactColor(contactColor);
    setCallContactAvatar(contactAvatar);
    setCallActive(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      toast({ description: `Attached: ${file.name}` });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleRecording = () => {
    if (isRecording) {
      const duration = formatRecordingTime(recordingTime);
      setIsRecording(false);
      sendMessage.mutate({ senderId: "me", text: `🎤 Voice note (${duration})` });
      toast({ description: `Voice note sent (${duration})` });
    } else {
      setIsRecording(true);
    }
  };

  const cancelRecording = () => {
    setIsRecording(false);
    toast({ description: "Recording cancelled" });
  };

  const handleForward = (text: string) => {
    setForwardMessageText(text);
    setShowForwardDialog(true);
  };

  const handlePin = (messageId: string) => {
    setPinnedMessageId(prev => prev === messageId ? null : messageId);
    toast({ description: pinnedMessageId === messageId ? "Message unpinned" : "Message pinned" });
  };

  const handleSelect = (messageId: string) => {
    setSelectMode(true);
    setSelectedMessages(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedMessages(new Set());
  };

  const handleLocationSend = (text: string) => {
    sendMessage.mutate({ senderId: "me", text });
  };

  const handleJumpToMessage = (messageId: string) => {
    const el = document.querySelector(`[data-testid="message-bubble-${messageId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-signal-blue/50", "rounded-2xl");
      setTimeout(() => el.classList.remove("ring-2", "ring-signal-blue/50", "rounded-2xl"), 2000);
    } else {
      toast({ description: "Message not found in current view" });
    }
  };

  if (!activeChat || Object.keys(usersMap).length === 0) {
    return (
      <div className="flex h-screen bg-background text-zinc-100 items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  const pinnedMessage = pinnedMessageId ? messages.find(m => m.id === pinnedMessageId) : null;

  return (
    <div className="flex h-screen bg-background text-zinc-100 overflow-hidden font-sans">
      <ChatSidebar
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        chats={chats}
        usersMap={usersMap}
        onStartCall={handleStartCallFromSidebar}
      />

      <div className={cn("flex-1 flex flex-col relative min-w-0 bg-background transition-all duration-300", threadOpen && "mr-0")}>
        <div className="h-16 flex items-center justify-between px-6 bg-background z-10 shrink-0 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            {activeChat.avatar ? (
              <img src={activeChat.avatar} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm", activeChat.color)}>
                {activeChat.initials || activeChat.name[0]}
              </div>
            )}
            <div>
              <h2 className="font-bold text-sm leading-none text-zinc-100 mb-1">{activeChat.name}</h2>
              {activeChat.type === 'group' ? (
                <div className="text-xs text-zinc-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-green-500" />
                  <span>Signal Group</span>
                  <span className="text-zinc-600">·</span>
                  <span>{activeChat.participants.length} members</span>
                </div>
              ) : (
                <div className="text-xs text-zinc-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-green-500" />
                  <span>End-to-end encrypted</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button onClick={() => handleCall("video")} variant="ghost" size="icon" className="rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white" data-testid="button-video-call"><Video className="w-5 h-5" /></Button>
            <Button onClick={() => handleCall("audio")} variant="ghost" size="icon" className="rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white" data-testid="button-audio-call"><Phone className="w-5 h-5" /></Button>
            <Button onClick={() => setShowChatSearch(true)} variant="ghost" size="icon" className="rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white" data-testid="button-search"><Search className="w-5 h-5" /></Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white" data-testid="button-more-options">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-800/95 backdrop-blur-sm border-zinc-700 text-zinc-100 rounded-xl">
                <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer rounded-lg" onClick={() => setShowSafetyNumbers(true)}>
                  <ShieldCheck className="w-4 h-4 mr-2 text-green-500" /> Verify Safety Number
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer rounded-lg" onClick={() => setShowDisappearing(true)}>Disappearing Messages</DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer rounded-lg" onClick={() => setShowAllMedia(true)}>All Media</DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer rounded-lg" onClick={() => setShowConvoSettings(true)}>Conversation Settings</DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white text-red-400 cursor-pointer rounded-lg" onClick={() => setShowBlockDialog(true)}>
                  {activeChat.type === 'group' ? 'Block Group' : 'Block Contact'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <AnimatePresence>
          {showChatSearch && (
            <ChatSearchOverlay
              isOpen={showChatSearch}
              onClose={() => setShowChatSearch(false)}
              messages={messages}
              usersMap={usersMap}
              onJumpToMessage={handleJumpToMessage}
            />
          )}
        </AnimatePresence>

        {pinnedMessage && (
          <div className="mx-4 mt-2 flex items-center gap-3 bg-signal-blue/10 border border-signal-blue/20 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-signal-blue/15 transition-colors" onClick={() => handleJumpToMessage(pinnedMessage.id)} data-testid="pinned-message-banner">
            <div className="w-1 h-8 bg-signal-blue rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-signal-blue uppercase tracking-wide">Pinned Message</p>
              <p className="text-xs text-zinc-300 truncate">{pinnedMessage.text}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); setPinnedMessageId(null); toast({ description: "Message unpinned" }); }} className="text-zinc-500 hover:text-white shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {selectMode && (
          <div className="mx-4 mt-2 flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5">
            <span className="text-sm text-zinc-200">{selectedMessages.size} selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="bg-zinc-700 border-zinc-600 text-zinc-200 hover:bg-zinc-600 text-xs" onClick={() => {
                const texts = messages.filter(m => selectedMessages.has(m.id)).map(m => m.text).join("\n");
                navigator.clipboard.writeText(texts);
                toast({ description: `${selectedMessages.size} messages copied` });
                exitSelectMode();
              }} data-testid="button-copy-selected">Copy</Button>
              <Button size="sm" variant="outline" className="bg-zinc-700 border-zinc-600 text-zinc-200 hover:bg-zinc-600 text-xs" onClick={() => {
                const texts = messages.filter(m => selectedMessages.has(m.id)).map(m => m.text).join("\n");
                handleForward(texts);
                exitSelectMode();
              }} data-testid="button-forward-selected">Forward</Button>
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white text-xs" onClick={exitSelectMode} data-testid="button-cancel-select">Cancel</Button>
            </div>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-0.5 scrollbar-hide overscroll-contain">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", damping: 20 }}
            className="flex justify-center my-4"
          >
            <div className="flex items-center gap-2 bg-zinc-800/40 border border-zinc-700/30 rounded-full px-4 py-1.5 backdrop-blur-sm" data-testid="encryption-banner">
              <Lock className="w-3 h-3 text-green-500" />
              <span className="text-[11px] text-zinc-500">Messages and calls are end-to-end encrypted. No one outside of this chat, not even Signal, can read or listen to them.</span>
            </div>
          </motion.div>

          <div className="flex justify-center my-4">
            <span className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase">Today</span>
          </div>

          {messages.map((msg, idx) => {
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const nextMsg = messages[idx + 1];
            const isSameSenderAsNext = nextMsg?.senderId === msg.senderId && !nextMsg?.replyToId && !msg.replyToId;

            return (
              <div key={msg.id} className={cn("relative", selectMode && "cursor-pointer")} onClick={() => selectMode && handleSelect(msg.id)}>
                {selectMode && (
                  <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", selectedMessages.has(msg.id) ? "bg-signal-blue border-signal-blue" : "border-zinc-600")}>
                    {selectedMessages.has(msg.id) && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                )}
                <div className={cn(selectMode && "pl-8")}>
                  <MessageBubble
                    message={msg}
                    allMessages={messages}
                    usersMap={usersMap}
                    onReply={handleReply}
                    onThreadOpen={openThread}
                    onJumpToMessage={handleJumpToMessage}
                    showAvatar={!isSameSenderAsNext}
                    onForward={handleForward}
                    onPin={handlePin}
                    onSelect={handleSelect}
                    isPinned={pinnedMessageId === msg.id}
                    hideActions={selectMode}
                  />
                </div>
              </div>
            );
          })}
          <div className="h-4" />
        </div>

        <AnimatePresence>
          {attachedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mx-6 mb-2 flex items-center gap-3 bg-zinc-800 rounded-xl px-4 py-3 border border-zinc-700"
            >
              <FileText className="w-5 h-5 text-signal-blue shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 truncate">{attachedFile.name}</p>
                <p className="text-xs text-zinc-500">{(attachedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button variant="ghost" size="icon" className="w-6 h-6 text-zinc-400 hover:text-white" onClick={() => setAttachedFile(null)}>
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {replyingToMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: 8 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="mx-6 overflow-hidden"
              data-testid="composer-reply-preview"
            >
              <div className="flex items-stretch gap-0 bg-zinc-800 rounded-xl border border-zinc-700/50 mb-2 overflow-hidden">
                <div className={cn(
                  "w-1 shrink-0",
                  replyingToSender?.isMe ? "bg-signal-blue" :
                  replyingToSender?.id === 'varun' ? 'bg-orange-500' :
                  replyingToSender?.id === 'alice' ? 'bg-purple-500' :
                  replyingToSender?.id === 'bob' ? 'bg-green-500' : 'bg-zinc-400'
                )} />
                <div className="flex-1 px-3 py-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "text-[12px] font-semibold",
                      replyingToSender?.isMe ? "text-signal-blue" :
                      replyingToSender?.color || "text-zinc-300"
                    )}>
                      <Reply className="w-3 h-3 inline mr-1 opacity-60" />
                      {replyingToSender?.isMe ? "You" : replyingToSender?.name || "Unknown"}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-5 h-5 text-zinc-500 hover:text-white shrink-0"
                      onClick={() => setReplyingTo(null)}
                      data-testid="button-cancel-reply"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-[12px] text-zinc-400 truncate mt-0.5 leading-snug">
                    {replyingToMessage.text.length > 100 ? replyingToMessage.text.slice(0, 100) + "..." : replyingToMessage.text}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="shrink-0 px-6 pb-6 pt-2 relative">
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-20 right-6 z-30">
                <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip" />

          <form onSubmit={handleSendMessage} className="flex items-end gap-3 w-full">
            <div className={cn("flex-1 bg-zinc-800 rounded-[24px] flex items-center px-4 py-2 min-h-[48px] border border-transparent transition-all", isRecording ? "border-red-500/50 bg-red-950/20" : "focus-within:border-zinc-600")}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="rounded-full w-8 h-8 shrink-0 text-zinc-400 hover:text-zinc-200 hover:bg-transparent -ml-1" data-testid="button-attachment">
                    <Plus className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="bg-zinc-800 border-zinc-700 text-zinc-100 w-48 rounded-xl">
                  <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer gap-2 rounded-lg" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="w-4 h-4" /> File
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer gap-2 rounded-lg" onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); } }}>
                    <Image className="w-4 h-4" /> Photo
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer gap-2 rounded-lg" onClick={() => setShowLocationDialog(true)}>
                    <MapPin className="w-4 h-4" /> Location
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isRecording ? (
                <div className="flex-1 px-3 py-2 text-red-400 font-medium flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-mono text-sm">Recording... {formatRecordingTime(recordingTime)}</span>
                  <Button type="button" onClick={cancelRecording} variant="ghost" size="icon" className="w-6 h-6 text-zinc-400 hover:text-white ml-auto">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={replyingTo ? "Reply..." : "Signal message"}
                  className="border-0 shadow-none bg-transparent focus-visible:ring-0 px-3 py-1 text-[15px] placeholder:text-zinc-500 text-zinc-100"
                  data-testid="input-message"
                />
              )}

              <div className="flex items-center gap-1">
                {!isRecording && (
                  <Button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} variant="ghost" size="icon" className={cn("rounded-full w-8 h-8 shrink-0 hover:bg-transparent transition-colors", showEmojiPicker ? "text-signal-blue" : "text-zinc-400 hover:text-zinc-200")} data-testid="button-sticker">
                    <Sticker className="w-6 h-6" />
                  </Button>
                )}
                <Button type="button" onClick={toggleRecording} variant="ghost" size="icon" className={cn("rounded-full w-8 h-8 shrink-0 hover:bg-transparent transition-colors", isRecording ? "text-red-500 hover:text-red-400" : "text-zinc-400 hover:text-zinc-200")} data-testid="button-record">
                  {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {(inputValue.trim() || attachedFile) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 400 }}
                >
                  <Button type="submit" size="icon" className="rounded-full bg-signal-blue hover:bg-blue-500 w-12 h-12 shrink-0 transition-colors shadow-lg shadow-signal-blue/20 active:scale-95" data-testid="button-send">
                    <Send className="w-5 h-5 ml-0.5 text-white" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {threadOpen && (
          <ThreadView
            isOpen={threadOpen}
            originalMessageId={activeThreadId}
            chatId={activeChatId}
            usersMap={usersMap}
            onClose={() => setThreadOpen(false)}
            onSendReply={handleSendReply}
          />
        )}
      </AnimatePresence>

      <CallScreen
        isOpen={callActive}
        callType={callType}
        contactName={callContactName}
        contactInitials={callContactInitials}
        contactColor={callContactColor}
        contactAvatar={callContactAvatar}
        onEnd={() => setCallActive(false)}
      />

      <DisappearingMessagesDialog isOpen={showDisappearing} onClose={() => setShowDisappearing(false)} chatName={activeChat?.name || ""} />
      <AllMediaDialog isOpen={showAllMedia} onClose={() => setShowAllMedia(false)} chatName={activeChat?.name || ""} messages={messages} />
      <ConversationSettingsDialog isOpen={showConvoSettings} onClose={() => setShowConvoSettings(false)} chat={activeChat} usersMap={usersMap} />
      <BlockDialog isOpen={showBlockDialog} onClose={() => setShowBlockDialog(false)} chatName={activeChat?.name || ""} isGroup={activeChat?.type === "group"} />
      <ForwardDialog isOpen={showForwardDialog} onClose={() => { setShowForwardDialog(false); setForwardMessageText(""); }} messageText={forwardMessageText} chats={chats} />
      <LocationDialog isOpen={showLocationDialog} onClose={() => setShowLocationDialog(false)} onSend={handleLocationSend} />
      <SafetyNumberDialog isOpen={showSafetyNumbers} onClose={() => setShowSafetyNumbers(false)} chatName={activeChat?.name || ""} />
    </div>
  );
}
