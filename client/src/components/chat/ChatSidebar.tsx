import { useState } from "react";
import { cn } from "@/lib/utils";
import { type Chat, type User, useCreateChat, useMarkAllRead, useUsers } from "@/lib/api";
import { Search, PenSquare, Menu, MessageSquare, Phone, Disc, UserCircle, Settings, LogOut, PlusCircle, Check, X, Users, ArrowLeft } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CallsPanel, StoriesPanel, ContactsPanel } from "./SidebarPanels";
import { ProfileDialog, SettingsDialog } from "./ProfileSettingsDialogs";

const GROUP_COLORS = [
  "bg-gradient-to-br from-blue-400 to-purple-500",
  "bg-gradient-to-br from-green-400 to-teal-500",
  "bg-gradient-to-br from-orange-400 to-red-500",
  "bg-gradient-to-br from-pink-400 to-rose-500",
  "bg-gradient-to-br from-cyan-400 to-blue-500",
  "bg-gradient-to-br from-yellow-400 to-orange-500",
  "bg-gradient-to-br from-violet-400 to-indigo-500",
  "bg-gradient-to-br from-emerald-400 to-green-600",
];

type SidebarPanel = "chats" | "calls" | "stories" | "contacts";

interface ChatSidebarProps {
  activeChatId: string;
  onSelectChat: (chatId: string) => void;
  chats: Chat[];
  usersMap: Record<string, User>;
  onStartCall?: (contactName: string, contactInitials: string, contactColor: string, contactAvatar: string | null | undefined, callType: "video" | "audio") => void;
}

export function ChatSidebar({ activeChatId, onSelectChat, chats, usersMap, onStartCall }: ChatSidebarProps) {
  const { toast } = useToast();
  const me = usersMap["me"];
  const createChat = useCreateChat();
  const markAllRead = useMarkAllRead();
  const { data: allUsers = [] } = useUsers();

  const [activePanel, setActivePanel] = useState<SidebarPanel>("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnread, setFilterUnread] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const otherUsers = allUsers.filter(u => !u.isMe);

  const filteredChats = chats.filter(chat => {
    const matchesSearch = searchQuery === "" || chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnread = !filterUnread || (chat.unreadCount && chat.unreadCount > 0);
    return matchesSearch && matchesUnread;
  });

  const formatTime = (date: Date) => {
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) { toast({ description: "Please enter a group name" }); return; }
    if (selectedMembers.length === 0) { toast({ description: "Select at least one member" }); return; }
    const color = GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)];
    createChat.mutate(
      { name: newGroupName.trim(), type: "group", participants: selectedMembers, color },
      {
        onSuccess: (data: any) => {
          setNewGroupOpen(false);
          setNewChatDialogOpen(false);
          setNewGroupName("");
          setSelectedMembers([]);
          onSelectChat(data.id);
          toast({ description: `Group "${data.name}" created!` });
        },
      }
    );
  };

  const handleStartDM = (userId: string) => {
    const existingDM = chats.find(c => c.type === "direct" && c.participants.includes(userId));
    if (existingDM) { onSelectChat(existingDM.id); setNewChatDialogOpen(false); return; }
    const user = usersMap[userId];
    createChat.mutate(
      { name: user?.name || userId, type: "direct", participants: [userId] },
      {
        onSuccess: (data: any) => {
          setNewChatDialogOpen(false);
          onSelectChat(data.id);
          toast({ description: `Chat with ${user?.name || userId} created!` });
        },
      }
    );
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, { onSuccess: () => toast({ description: "All chats marked as read" }) });
  };

  const handleSelectContact = (userId: string) => {
    handleStartDM(userId);
    setActivePanel("chats");
  };

  const panelTitles: Record<SidebarPanel, string> = {
    chats: "Chats",
    calls: "Calls",
    stories: "Stories",
    contacts: "Contacts",
  };

  return (
    <>
      <div className="flex h-full hidden md:flex border-r border-zinc-800">
        {/* Left Rail */}
        <div className="w-16 bg-signal-sidebar-rail flex flex-col items-center py-4 gap-6 shrink-0 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 hover:ring-2 hover:ring-zinc-500 transition-all outline-none" data-testid="button-profile">
                {me?.avatar ? <img src={me.avatar} className="w-8 h-8 rounded-full object-cover" /> : me?.name[0] || "M"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56 ml-2 bg-zinc-800 border-zinc-700 text-zinc-100">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-700" />
              <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer" onClick={() => setProfileOpen(true)}>
                <UserCircle className="mr-2 h-4 w-4" /><span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer" onClick={() => setSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" /><span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-700" />
              <DropdownMenuItem className="text-red-400 focus:bg-zinc-700 focus:text-red-400 cursor-pointer" onClick={() => toast({ description: "Logged out (prototype)" })}>
                <LogOut className="mr-2 h-4 w-4" /><span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex flex-col gap-6">
            <button onClick={() => setActivePanel("chats")} className={cn("transition-colors p-1", activePanel === "chats" ? "text-zinc-200" : "text-zinc-500 hover:text-white")} data-testid="button-chats-nav">
              <MessageSquare className={cn("w-6 h-6", activePanel === "chats" && "fill-current")} />
            </button>
            <button onClick={() => setActivePanel("calls")} className={cn("transition-colors p-1", activePanel === "calls" ? "text-zinc-200" : "text-zinc-500 hover:text-white")} data-testid="button-calls-nav">
              <Phone className={cn("w-6 h-6", activePanel === "calls" && "fill-current")} />
            </button>
            <button onClick={() => setActivePanel("stories")} className={cn("transition-colors p-1", activePanel === "stories" ? "text-zinc-200" : "text-zinc-500 hover:text-white")} data-testid="button-stories-nav">
              <Disc className={cn("w-6 h-6", activePanel === "stories" && "fill-current")} />
            </button>
          </div>

          <div className="mt-auto">
            <button onClick={() => setActivePanel("contacts")} className={cn("transition-colors p-1", activePanel === "contacts" ? "text-zinc-200" : "text-zinc-500 hover:text-white")} data-testid="button-contacts-nav">
              <UserCircle className={cn("w-6 h-6", activePanel === "contacts" && "fill-current")} />
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="w-80 bg-signal-sidebar flex flex-col h-full">
          {activePanel === "chats" ? (
            <>
              <div className="h-16 px-4 flex items-center justify-between shrink-0">
                <h1 className="font-bold text-xl text-white">Chats</h1>
                <div className="flex gap-1">
                  <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors" data-testid="button-new-chat"><PenSquare className="w-5 h-5 text-zinc-400" /></button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 sm:max-w-md">
                      {!newGroupOpen ? (
                        <>
                          <DialogHeader>
                            <DialogTitle>New Chat</DialogTitle>
                            <DialogDescription className="text-zinc-400">Start a new conversation or create a group.</DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-2">
                            <Button onClick={() => setNewGroupOpen(true)} variant="outline" className="w-full justify-start gap-3 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-white h-12" data-testid="button-new-group">
                              <div className="w-8 h-8 rounded-full bg-signal-blue flex items-center justify-center"><Users className="w-4 h-4 text-white" /></div>
                              New Group
                            </Button>
                            <div className="pt-2">
                              <p className="text-xs text-zinc-500 font-medium mb-2 px-1">CONTACTS</p>
                              <div className="space-y-1 max-h-64 overflow-y-auto">
                                {otherUsers.map(user => (
                                  <button key={user.id} onClick={() => handleStartDM(user.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors text-left" data-testid={`contact-${user.id}`}>
                                    {user.avatar ? <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" /> : <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-white">{user.initials || user.name[0]}</div>}
                                    <span className="text-sm font-medium text-zinc-200">{user.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="w-8 h-8 -ml-2 text-zinc-400 hover:text-white" onClick={() => { setNewGroupOpen(false); setSelectedMembers([]); setNewGroupName(""); }}><X className="w-4 h-4" /></Button>
                              New Group
                            </DialogTitle>
                            <DialogDescription className="text-zinc-400">Name your group and pick members.</DialogDescription>
                          </DialogHeader>
                          <div className="py-2 space-y-4">
                            <div>
                              <label className="text-xs text-zinc-500 font-medium mb-1.5 block">GROUP NAME</label>
                              <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g. Weekend Plans" className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-signal-blue" data-testid="input-group-name" autoFocus />
                            </div>
                            {selectedMembers.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {selectedMembers.map(id => {
                                  const u = usersMap[id];
                                  return (
                                    <div key={id} className="flex items-center gap-1.5 bg-signal-blue/20 text-signal-blue rounded-full px-3 py-1 text-xs font-medium">
                                      {u?.name || id}
                                      <button onClick={() => toggleMember(id)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <div>
                              <label className="text-xs text-zinc-500 font-medium mb-1.5 block">ADD MEMBERS ({selectedMembers.length} selected)</label>
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {otherUsers.map(user => {
                                  const isSelected = selectedMembers.includes(user.id);
                                  return (
                                    <button key={user.id} onClick={() => toggleMember(user.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left", isSelected ? "bg-signal-blue/10" : "hover:bg-zinc-800")} data-testid={`member-${user.id}`}>
                                      {user.avatar ? <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" /> : <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-white">{user.initials || user.name[0]}</div>}
                                      <span className="flex-1 text-sm font-medium text-zinc-200">{user.name}</span>
                                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", isSelected ? "bg-signal-blue border-signal-blue" : "border-zinc-600")}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleCreateGroup} disabled={!newGroupName.trim() || selectedMembers.length === 0 || createChat.isPending} className="bg-signal-blue hover:bg-blue-600 text-white w-full" data-testid="button-create-group">
                              {createChat.isPending ? "Creating..." : `Create Group (${selectedMembers.length} members)`}
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors" data-testid="button-menu"><Menu className="w-5 h-5 text-zinc-400" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-zinc-800 border-zinc-700 text-zinc-100">
                      <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="focus:bg-zinc-700 focus:text-white cursor-pointer">Preferences</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setFilterUnread(!filterUnread); toast({ description: filterUnread ? "Showing all chats" : "Showing unread only" }); }} className="focus:bg-zinc-700 focus:text-white cursor-pointer">
                        {filterUnread ? "Show All Chats" : "Filter Unread"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleMarkAllRead} className="focus:bg-zinc-700 focus:text-white cursor-pointer">Mark All Read</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                  <input type="text" placeholder="Search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-zinc-800 rounded-lg py-2 pl-10 pr-8 text-sm outline-none text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-700 transition-colors" data-testid="input-search" />
                  {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>}
                </div>
                {filterUnread && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-signal-blue font-medium">Showing unread only</span>
                    <button onClick={() => setFilterUnread(false)} className="text-xs text-zinc-500 hover:text-zinc-300 underline">Clear</button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                  <div className="px-6 py-10 text-center text-zinc-500 text-sm">
                    {searchQuery ? `No chats matching "${searchQuery}"` : filterUnread ? "No unread chats" : "No chats yet"}
                  </div>
                ) : (
                  filteredChats.map(chat => {
                    const lastMsg = chat.lastMessage;
                    const sender = lastMsg ? usersMap[lastMsg.senderId] : null;
                    const isActive = chat.id === activeChatId;
                    return (
                      <div key={chat.id} className="px-3 py-1" data-testid={`chat-item-${chat.id}`}>
                        <div onClick={() => onSelectChat(chat.id)} className={cn("p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-colors", isActive ? "bg-zinc-800" : "hover:bg-zinc-800/50")}>
                          <div className="shrink-0">
                            {chat.avatar ? <img src={chat.avatar} className="w-12 h-12 rounded-full object-cover" alt="" /> : <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white/90 font-bold text-lg", chat.color || "bg-zinc-600")}>{chat.initials || chat.name[0]}</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <h3 className={cn("font-medium text-sm truncate", isActive ? "text-white" : "text-zinc-100")} data-testid={`text-chat-name-${chat.id}`}>{chat.name}</h3>
                              {lastMsg && <span className={cn("text-[11px]", isActive ? "text-zinc-400" : "text-zinc-500")}>{formatTime(lastMsg.timestamp)}</span>}
                            </div>
                            <div className="flex justify-between items-center">
                              <p className={cn("text-xs truncate max-w-[85%]", isActive ? "text-zinc-300" : "text-zinc-500")}>
                                {lastMsg ? <>{sender?.isMe ? "You: " : ""}{lastMsg.text}</> : "No messages yet"}
                              </p>
                              {chat.unreadCount ? <div className="min-w-[18px] h-[18px] px-1 rounded-full bg-signal-blue flex items-center justify-center text-[10px] font-bold text-white" data-testid={`badge-unread-${chat.id}`}>{chat.unreadCount}</div> : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <>
              <div className="h-16 px-4 flex items-center gap-3 shrink-0">
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white -ml-1" onClick={() => setActivePanel("chats")}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="font-bold text-xl text-white">{panelTitles[activePanel]}</h1>
              </div>
              <div className="flex-1 overflow-y-auto">
                {activePanel === "calls" && <CallsPanel users={allUsers} usersMap={usersMap} onStartCall={(userId, type) => {
                  const user = usersMap[userId];
                  if (user && onStartCall) {
                    onStartCall(user.name, user.initials || user.name[0], user.color || "bg-zinc-700", user.avatar, type);
                  }
                }} />}
                {activePanel === "stories" && <StoriesPanel users={allUsers} usersMap={usersMap} />}
                {activePanel === "contacts" && <ContactsPanel users={allUsers} usersMap={usersMap} onSelectContact={handleSelectContact} />}
              </div>
            </>
          )}
        </div>
      </div>

      <ProfileDialog isOpen={profileOpen} onClose={() => setProfileOpen(false)} user={me} />
      <SettingsDialog isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
