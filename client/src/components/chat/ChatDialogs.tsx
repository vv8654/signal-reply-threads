import { useState } from "react";
import { cn } from "@/lib/utils";
import { type Chat, type User, type Message } from "@/lib/api";
import { X, Clock, Image, FileText, Video, Music, Search, ArrowLeft, Check, Send, MapPin, Lock, ShieldCheck, Fingerprint, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface DisappearingMessagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chatName: string;
}

const TIMER_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "30 seconds", value: 30 },
  { label: "5 minutes", value: 300 },
  { label: "1 hour", value: 3600 },
  { label: "8 hours", value: 28800 },
  { label: "1 day", value: 86400 },
  { label: "1 week", value: 604800 },
  { label: "4 weeks", value: 2419200 },
];

export function DisappearingMessagesDialog({ isOpen, onClose, chatName }: DisappearingMessagesDialogProps) {
  const [selected, setSelected] = useState(0);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSave = () => {
    const option = TIMER_OPTIONS.find(o => o.value === selected);
    toast({ description: selected === 0 ? "Disappearing messages turned off" : `Messages will disappear after ${option?.label}` });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl" data-testid="disappearing-dialog">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-white">Disappearing Messages</h2>
            <p className="text-xs text-zinc-400">{chatName}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>
        <div className="px-5 py-4 space-y-1 max-h-80 overflow-y-auto">
          {TIMER_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setSelected(opt.value)} className={cn("w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left", selected === opt.value ? "bg-signal-blue/10" : "hover:bg-zinc-800")} data-testid={`timer-${opt.value}`}>
              <div className="flex items-center gap-3">
                <Clock className={cn("w-4 h-4", selected === opt.value ? "text-signal-blue" : "text-zinc-500")} />
                <span className={cn("text-sm", selected === opt.value ? "text-signal-blue font-medium" : "text-zinc-200")}>{opt.label}</span>
              </div>
              {selected === opt.value && <Check className="w-4 h-4 text-signal-blue" />}
            </button>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-zinc-800">
          <Button onClick={handleSave} className="w-full bg-signal-blue hover:bg-blue-600 text-white" data-testid="button-save-disappearing">Apply</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface AllMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chatName: string;
  messages: Message[];
}

export function AllMediaDialog({ isOpen, onClose, chatName, messages }: AllMediaDialogProps) {
  const [tab, setTab] = useState<"media" | "files" | "links">("media");

  const mediaMessages = messages.filter(m => m.text.includes("📷") || m.text.includes("🖼") || m.text.includes("Photo"));
  const fileMessages = messages.filter(m => m.text.includes("📎"));
  const linkMessages = messages.filter(m => m.text.match(/https?:\/\//));

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[70vh] flex flex-col" data-testid="all-media-dialog">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">All Media</h2>
            <p className="text-xs text-zinc-400">{chatName}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="flex border-b border-zinc-800 shrink-0">
          {(["media", "files", "links"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn("flex-1 py-3 text-sm font-medium transition-colors capitalize", tab === t ? "text-signal-blue border-b-2 border-signal-blue" : "text-zinc-400 hover:text-zinc-200")} data-testid={`tab-${t}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "media" && (
            mediaMessages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {mediaMessages.map(m => (
                  <div key={m.id} className="aspect-square bg-zinc-800 rounded-lg flex items-center justify-center">
                    <Image className="w-8 h-8 text-zinc-600" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Image className="w-10 h-10" />} text="No media shared yet" />
            )
          )}
          {tab === "files" && (
            fileMessages.length > 0 ? (
              <div className="space-y-2">
                {fileMessages.map(m => (
                  <div key={m.id} className="flex items-center gap-3 bg-zinc-800 rounded-xl px-4 py-3">
                    <FileText className="w-5 h-5 text-signal-blue shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{m.text}</p>
                      <p className="text-xs text-zinc-500">{format(m.timestamp, "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<FileText className="w-10 h-10" />} text="No files shared yet" />
            )
          )}
          {tab === "links" && (
            linkMessages.length > 0 ? (
              <div className="space-y-2">
                {linkMessages.map(m => (
                  <div key={m.id} className="bg-zinc-800 rounded-xl px-4 py-3">
                    <p className="text-sm text-signal-blue truncate">{m.text}</p>
                    <p className="text-xs text-zinc-500">{format(m.timestamp, "MMM d, h:mm a")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Search className="w-10 h-10" />} text="No links shared yet" />
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
      {icon}
      <p className="text-sm mt-3">{text}</p>
    </div>
  );
}

interface ConversationSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | undefined;
  usersMap: Record<string, User>;
}

export function ConversationSettingsDialog({ isOpen, onClose, chat, usersMap }: ConversationSettingsDialogProps) {
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [pinConversation, setPinConversation] = useState(false);
  const { toast } = useToast();

  if (!isOpen || !chat) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl max-h-[80vh] flex flex-col" data-testid="conversation-settings-dialog">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <h2 className="text-base font-bold text-white">Conversation Settings</h2>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div className="flex flex-col items-center gap-3 pb-4 border-b border-zinc-800">
            {chat.avatar ? (
              <img src={chat.avatar} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className={cn("w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white", chat.color)}>
                {chat.initials || chat.name[0]}
              </div>
            )}
            <h3 className="text-lg font-bold text-white">{chat.name}</h3>
            <p className="text-xs text-zinc-400">{chat.type === "group" ? `Group • ${chat.participants.length} members` : "Direct Message"}</p>
          </div>

          <div className="bg-zinc-800/50 rounded-xl px-4 divide-y divide-zinc-700/50">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-zinc-200">Mute Notifications</span>
              <Switch checked={muteNotifications} onCheckedChange={setMuteNotifications} data-testid="toggle-mute" />
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-zinc-200">Pin Conversation</span>
              <Switch checked={pinConversation} onCheckedChange={setPinConversation} data-testid="toggle-pin-conversation" />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">Security</h4>
            <div className="bg-zinc-800/50 rounded-xl px-4 divide-y divide-zinc-700/50">
              <div className="flex items-center gap-3 py-3">
                <Lock className="w-4 h-4 text-green-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-200">End-to-End Encrypted</p>
                  <p className="text-[11px] text-zinc-500">Messages use the Signal Protocol</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
              </div>
              <div className="flex items-center gap-3 py-3">
                <Fingerprint className="w-4 h-4 text-signal-blue shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-200">Sealed Sender</p>
                  <p className="text-[11px] text-zinc-500">Metadata is protected from the server</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
              </div>
            </div>
          </div>

          {chat.type === "group" && (
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">Members ({chat.participants.length})</h4>
              <div className="space-y-1">
                {chat.participants.map(pid => {
                  const u = usersMap[pid];
                  if (!u) return null;
                  return (
                    <div key={pid} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors">
                      {u.avatar ? (
                        <img src={u.avatar} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                          {u.initials || u.name[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-zinc-200">{u.name}{u.isMe ? " (You)" : ""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

interface BlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chatName: string;
  isGroup: boolean;
}

export function BlockDialog({ isOpen, onClose, chatName, isGroup }: BlockDialogProps) {
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleBlock = () => {
    toast({ description: `${chatName} has been blocked` });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl" data-testid="block-dialog">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <X className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-white">Block {chatName}?</h2>
          <p className="text-sm text-zinc-400">
            {isGroup
              ? "You will no longer receive messages from this group. You can unblock it later."
              : "This contact will no longer be able to send you messages or calls. You can unblock them later."}
          </p>
          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-100" data-testid="button-cancel-block">Cancel</Button>
            <Button onClick={handleBlock} className="flex-1 bg-red-600 hover:bg-red-500 text-white" data-testid="button-confirm-block">Block</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ForwardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messageText: string;
  chats: Chat[];
}

export function ForwardDialog({ isOpen, onClose, messageText, chats }: ForwardDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  if (!isOpen) return null;

  const handleForward = () => {
    if (!selectedChat) return;
    const chat = chats.find(c => c.id === selectedChat);
    toast({ description: `Message forwarded to ${chat?.name}` });
    onClose();
    setSelectedChat(null);
    setSearch("");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl max-h-[70vh] flex flex-col" data-testid="forward-dialog">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <h2 className="text-base font-bold text-white">Forward Message</h2>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="px-5 py-3 border-b border-zinc-800 shrink-0">
          <div className="bg-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 line-clamp-2">"{messageText}"</div>
        </div>

        <div className="px-5 py-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats" className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" data-testid="input-forward-search" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 space-y-1">
          {filteredChats.map(chat => (
            <button key={chat.id} onClick={() => setSelectedChat(chat.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left", selectedChat === chat.id ? "bg-signal-blue/10" : "hover:bg-zinc-800")} data-testid={`forward-chat-${chat.id}`}>
              {chat.avatar ? (
                <img src={chat.avatar} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm", chat.color || "bg-zinc-700")}>
                  {chat.initials || chat.name[0]}
                </div>
              )}
              <span className="flex-1 text-sm text-zinc-200">{chat.name}</span>
              {selectedChat === chat.id && <Check className="w-4 h-4 text-signal-blue" />}
            </button>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-zinc-800 shrink-0">
          <Button onClick={handleForward} disabled={!selectedChat} className="w-full bg-signal-blue hover:bg-blue-600 text-white disabled:opacity-50" data-testid="button-forward-send">
            <Send className="w-4 h-4 mr-2" /> Forward
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
}

export function LocationDialog({ isOpen, onClose, onSend }: LocationDialogProps) {
  const [locationText, setLocationText] = useState("Austin, TX");
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSend = () => {
    onSend(`📍 Location: ${locationText}`);
    toast({ description: "Location shared" });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl" data-testid="location-dialog">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-bold text-white">Share Location</h2>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="p-5 space-y-4">
          <div className="aspect-[4/3] bg-zinc-800 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-green-900/20" />
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-px opacity-10">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-zinc-600" />
              ))}
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-signal-blue flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-white bg-zinc-900/80 px-3 py-1 rounded-full">{locationText}</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">LOCATION NAME</label>
            <Input value={locationText} onChange={e => setLocationText(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" data-testid="input-location" />
          </div>

          <Button onClick={handleSend} className="w-full bg-signal-blue hover:bg-blue-600 text-white" data-testid="button-send-location">
            <MapPin className="w-4 h-4 mr-2" /> Share Location
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ChatSearchProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  usersMap: Record<string, User>;
  onJumpToMessage?: (messageId: string) => void;
}

export function ChatSearchOverlay({ isOpen, onClose, messages, usersMap, onJumpToMessage }: ChatSearchProps) {
  const [query, setQuery] = useState("");

  const results = query.length > 0 ? messages.filter(m => m.text.toLowerCase().includes(query.toLowerCase())) : [];

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-0 left-0 right-0 z-30 bg-zinc-900 border-b border-zinc-700 shadow-xl" data-testid="chat-search-overlay">
      <div className="flex items-center gap-3 px-4 py-3">
        <Button variant="ghost" size="icon" className="shrink-0 text-zinc-400 hover:text-white" onClick={() => { onClose(); setQuery(""); }}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search in conversation" className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" autoFocus data-testid="input-chat-search" />
        </div>
        {query && <span className="text-xs text-zinc-400 shrink-0">{results.length} found</span>}
      </div>

      {query && (
        <div className="max-h-64 overflow-y-auto border-t border-zinc-800">
          {results.length > 0 ? (
            results.map(m => {
              const sender = usersMap[m.senderId];
              return (
                <button key={m.id} onClick={() => { onJumpToMessage?.(m.id); onClose(); setQuery(""); }} className="w-full flex items-start gap-3 px-5 py-3 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800/50" data-testid={`search-result-${m.id}`}>
                  <div className="shrink-0 mt-0.5">
                    {sender?.avatar ? (
                      <img src={sender.avatar} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                        {sender?.name?.[0] || "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-medium text-zinc-300">{sender?.name || "Unknown"}</span>
                      <span className="text-[10px] text-zinc-500">{format(m.timestamp, "MMM d, h:mm a")}</span>
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2 mt-0.5">{m.text}</p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-5 py-8 text-center text-zinc-500 text-sm">No messages found</div>
          )}
        </div>
      )}
    </motion.div>
  );
}

interface SafetyNumberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chatName: string;
}

function generateSafetyNumbers(): string[] {
  const numbers: string[] = [];
  for (let i = 0; i < 12; i++) {
    numbers.push(String(Math.floor(10000 + Math.random() * 90000)));
  }
  return numbers;
}

export function SafetyNumberDialog({ isOpen, onClose, chatName }: SafetyNumberDialogProps) {
  const [verified, setVerified] = useState(false);
  const [safetyNumbers] = useState(() => generateSafetyNumbers());
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleVerify = () => {
    setVerified(true);
    toast({ description: `Safety number verified for ${chatName}` });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl max-h-[85vh] flex flex-col" data-testid="safety-number-dialog">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">Verify Safety Number</h2>
            <p className="text-xs text-zinc-400">{chatName}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Each Signal conversation has a unique safety number. Verify this number matches your contact's device to confirm end-to-end encryption.
          </p>

          <div className="flex justify-center py-4">
            <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center relative overflow-hidden" data-testid="safety-qr-code">
              <div className="grid grid-cols-8 gap-[2px] p-3">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-[14px] h-[14px] rounded-[1px]",
                      (i * 7 + 3) % 3 === 0 || (i * 11 + 5) % 4 === 0 ? "bg-zinc-900" : "bg-white"
                    )}
                  />
                ))}
              </div>
              {verified && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-12 h-12 text-green-600" />
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3 text-center">Your Safety Number</p>
            <div className="grid grid-cols-4 gap-x-4 gap-y-2 font-mono text-center">
              {safetyNumbers.map((num, i) => (
                <span key={i} className="text-sm text-zinc-200 tracking-widest">{num}</span>
              ))}
            </div>
          </div>

          {verified ? (
            <div className="flex items-center justify-center gap-2 py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-400">Verified</span>
            </div>
          ) : (
            <Button onClick={handleVerify} className="w-full bg-signal-blue hover:bg-blue-600 text-white" data-testid="button-verify-safety">
              <Fingerprint className="w-4 h-4 mr-2" /> Mark as Verified
            </Button>
          )}

          <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
            If you and your contact see the same number, your conversation is secure. 
            Safety numbers change when either person reinstalls Signal or changes devices.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
