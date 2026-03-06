import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { type User } from "@/lib/api";
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Plus,
  Search,
  Camera,
  X,
  Clock,
  Type,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  Send,
} from "lucide-react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PanelProps {
  users: User[];
  usersMap: Record<string, User>;
  onStartCall?: (userId: string, type: "video" | "audio") => void;
  onSelectContact?: (userId: string) => void;
}

type CallType = "incoming" | "outgoing" | "missed";
type CallMediaType = "audio" | "video";

interface CallEntry {
  id: string;
  userId: string;
  type: CallType;
  mediaType: CallMediaType;
  timestamp: Date;
}

const DEMO_CALLS: CallEntry[] = [
  { id: "c1", userId: "varun", type: "incoming", mediaType: "video", timestamp: new Date(Date.now() - 1000 * 60 * 15) },
  { id: "c2", userId: "alice", type: "missed", mediaType: "audio", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: "c3", userId: "bob", type: "outgoing", mediaType: "audio", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: "c4", userId: "jacob", type: "incoming", mediaType: "audio", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: "c5", userId: "varun", type: "outgoing", mediaType: "video", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48) },
  { id: "c6", userId: "alice", type: "missed", mediaType: "video", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72) },
];

interface StoryEntry {
  id: string;
  userId: string;
  timestamp: Date;
  viewed: boolean;
  type: "text" | "image";
  text?: string;
  bgColor?: string;
}

const STORY_COLORS = [
  "from-blue-600 to-purple-600",
  "from-green-600 to-teal-600",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600",
  "from-violet-600 to-indigo-600",
  "from-emerald-500 to-green-700",
  "from-amber-500 to-orange-600",
];

const DEMO_STORIES: StoryEntry[] = [
  { id: "s1", userId: "varun", timestamp: new Date(Date.now() - 1000 * 60 * 30), viewed: false, type: "text", text: "Building the future of messaging 🚀", bgColor: "from-blue-600 to-purple-600" },
  { id: "s2", userId: "alice", timestamp: new Date(Date.now() - 1000 * 60 * 60), viewed: false, type: "text", text: "Just finished a 10k run! 🏃‍♀️", bgColor: "from-green-600 to-teal-600" },
  { id: "s3", userId: "bob", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), viewed: true, type: "text", text: "Coffee and code ☕", bgColor: "from-orange-500 to-red-600" },
  { id: "s4", userId: "jacob", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), viewed: true, type: "text", text: "Weekend vibes 🌊", bgColor: "from-cyan-500 to-blue-600" },
];

const CONTACT_STATUSES: Record<string, string> = {
  varun: "Building the future 🚀",
  alice: "Available",
  bob: "At work",
  jacob: "Busy",
  bulk: "Hey there! I am using Signal",
};

function CallTypeIcon({ type, mediaType }: { type: CallType; mediaType: CallMediaType }) {
  if (type === "missed") {
    return <PhoneMissed className="w-4 h-4 text-red-400" />;
  }
  if (type === "incoming") {
    return <PhoneIncoming className={cn("w-4 h-4", mediaType === "video" ? "text-blue-400" : "text-green-400")} />;
  }
  return <PhoneOutgoing className={cn("w-4 h-4", mediaType === "video" ? "text-blue-400" : "text-green-400")} />;
}

function formatCallTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return format(date, "h:mm a");
  }
  if (diffHours < 48) {
    return "Yesterday";
  }
  return format(date, "MMM d");
}

function formatStoryTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));

  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return format(date, "MMM d");
}

function Avatar({ user, size = "md" }: { user?: User; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-10 h-10 text-sm" : size === "lg" ? "w-16 h-16 text-2xl" : "w-12 h-12 text-lg";
  if (user?.avatar) {
    return <img src={user.avatar} className={cn(sizeClass, "rounded-full object-cover")} alt="" />;
  }
  return (
    <div className={cn(sizeClass, "rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white")}>
      {user?.initials || user?.name?.[0] || "?"}
    </div>
  );
}

export function CallsPanel({ users, usersMap, onStartCall }: PanelProps) {
  const [showNewCallPicker, setShowNewCallPicker] = useState(false);
  const [callSearchQuery, setCallSearchQuery] = useState("");

  const contacts = users
    .filter(u => !u.isMe)
    .filter(u => callSearchQuery === "" || u.name.toLowerCase().includes(callSearchQuery.toLowerCase()));

  return (
    <div className="w-80 bg-zinc-900 flex flex-col h-full">
      <div className="h-16 px-4 flex items-center justify-between shrink-0">
        <h1 className="font-bold text-xl text-white">Calls</h1>
        <button
          onClick={() => setShowNewCallPicker(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-full transition-colors"
          data-testid="button-new-call"
        >
          <Plus className="w-4 h-4" />
          New Call
        </button>
      </div>

      {showNewCallPicker ? (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pb-3 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-zinc-400 hover:text-white shrink-0" onClick={() => { setShowNewCallPicker(false); setCallSearchQuery(""); }}>
              <X className="w-4 h-4" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search contacts"
                value={callSearchQuery}
                onChange={e => setCallSearchQuery(e.target.value)}
                className="w-full bg-zinc-800 rounded-lg py-2 pl-10 pr-3 text-sm outline-none text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-700 transition-colors"
                autoFocus
                data-testid="input-call-search"
              />
            </div>
          </div>
          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Choose contact</p>
          </div>
          {contacts.map(user => (
            <div key={user.id} className="px-3 py-0.5">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors">
                <Avatar user={user} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{CONTACT_STATUSES[user.id] || "Hey there! I am using Signal"}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { onStartCall?.(user.id, "audio"); setShowNewCallPicker(false); setCallSearchQuery(""); }}
                    className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
                    data-testid={`button-audio-call-${user.id}`}
                  >
                    <Phone className="w-5 h-5 text-green-400" />
                  </button>
                  <button
                    onClick={() => { onStartCall?.(user.id, "video"); setShowNewCallPicker(false); setCallSearchQuery(""); }}
                    className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
                    data-testid={`button-video-call-${user.id}`}
                  >
                    <Video className="w-5 h-5 text-blue-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="px-6 py-10 text-center text-zinc-500 text-sm">
              No contacts matching "{callSearchQuery}"
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {DEMO_CALLS.map((call) => {
            const user = usersMap[call.userId];
            const isMissed = call.type === "missed";
            return (
              <div
                key={call.id}
                className="px-3 py-1"
                data-testid={`call-item-${call.id}`}
              >
                <div
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                  onClick={() => onStartCall?.(call.userId, call.mediaType)}
                >
                  <Avatar user={user} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", isMissed ? "text-red-400" : "text-zinc-100")}>
                      {user?.name || call.userId}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CallTypeIcon type={call.type} mediaType={call.mediaType} />
                      <span className={cn("text-xs", isMissed ? "text-red-400/70" : "text-zinc-500")}>
                        {call.type === "incoming" ? "Incoming" : call.type === "outgoing" ? "Outgoing" : "Missed"}
                      </span>
                      <span className="text-zinc-600 text-xs">·</span>
                      <span className="text-xs text-zinc-500">{formatCallTime(call.timestamp)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartCall?.(call.userId, call.mediaType);
                    }}
                    className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
                    data-testid={`button-call-${call.id}`}
                  >
                    {call.mediaType === "video" ? (
                      <Video className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Phone className="w-5 h-5 text-green-400" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function StoriesPanel({ users, usersMap }: PanelProps) {
  const me = users.find(u => u.isMe);
  const [stories, setStories] = useState<StoryEntry[]>(DEMO_STORIES);
  const [myStories, setMyStories] = useState<StoryEntry[]>([]);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [viewingStory, setViewingStory] = useState<{ userId: string; storyIndex: number } | null>(null);
  const [storyText, setStoryText] = useState("");
  const [selectedBgColor, setSelectedBgColor] = useState(STORY_COLORS[0]);

  const handleCreateStory = () => {
    if (!storyText.trim()) return;
    const newStory: StoryEntry = {
      id: `my-${Date.now()}`,
      userId: "me",
      timestamp: new Date(),
      viewed: false,
      type: "text",
      text: storyText.trim(),
      bgColor: selectedBgColor,
    };
    setMyStories(prev => [newStory, ...prev]);
    setStoryText("");
    setShowCreateStory(false);
  };

  const handleViewStory = (userId: string) => {
    setViewingStory({ userId, storyIndex: 0 });
    setStories(prev => prev.map(s => s.userId === userId ? { ...s, viewed: true } : s));
  };

  const getStoriesForUser = (userId: string): StoryEntry[] => {
    if (userId === "me") return myStories;
    return stories.filter(s => s.userId === userId);
  };

  const unviewedStories = stories.filter(s => !s.viewed);
  const viewedStories = stories.filter(s => s.viewed);

  return (
    <>
      <div className="w-80 bg-zinc-900 flex flex-col h-full">
        <div className="h-16 px-4 flex items-center shrink-0">
          <h1 className="font-bold text-xl text-white">Stories</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-1">
            <button
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors"
              data-testid="button-my-story"
              onClick={() => setShowCreateStory(true)}
            >
              <div className="relative">
                <Avatar user={me} />
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-zinc-100">My Story</p>
                <p className="text-xs text-zinc-500">
                  {myStories.length > 0 ? formatStoryTime(myStories[0].timestamp) : "Add to my story"}
                </p>
              </div>
            </button>
            {myStories.length > 0 && (
              <button
                onClick={() => handleViewStory("me")}
                className="w-full mt-1 flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                data-testid="button-view-my-story"
              >
                <div className={cn("w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center", myStories[0].bgColor || "from-blue-500 to-purple-500")}>
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">View My Story</p>
                  <p className="text-xs text-zinc-500">{myStories.length} {myStories.length === 1 ? "story" : "stories"} posted</p>
                </div>
              </button>
            )}
            {myStories.length === 0 && (
              <button
                onClick={() => setShowCreateStory(true)}
                className="w-full mt-1 flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                data-testid="button-create-text-story"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Type className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">Text Story</p>
                  <p className="text-xs text-zinc-500">Share a thought with your contacts</p>
                </div>
              </button>
            )}
          </div>

          {unviewedStories.length > 0 && (
            <>
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Updates</p>
              </div>
              {unviewedStories.map((story) => {
                const user = usersMap[story.userId];
                return (
                  <div key={story.id} className="px-3 py-1" data-testid={`story-item-${story.id}`}>
                    <button
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                      onClick={() => handleViewStory(story.userId)}
                    >
                      <div className="rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-purple-500">
                        <div className="rounded-full border-2 border-zinc-900">
                          <Avatar user={user} size="sm" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-zinc-100 truncate">
                          {user?.name || story.userId}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span className="text-xs text-zinc-500">{formatStoryTime(story.timestamp)}</span>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </>
          )}

          {viewedStories.length > 0 && (
            <>
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Viewed</p>
              </div>
              {viewedStories.map((story) => {
                const user = usersMap[story.userId];
                return (
                  <div key={story.id} className="px-3 py-1" data-testid={`story-item-${story.id}`}>
                    <button
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                      onClick={() => handleViewStory(story.userId)}
                    >
                      <div className="rounded-full p-[2px] bg-zinc-600">
                        <div className="rounded-full border-2 border-zinc-900">
                          <Avatar user={user} size="sm" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-zinc-100 truncate">
                          {user?.name || story.userId}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Eye className="w-3 h-3 text-zinc-500" />
                          <span className="text-xs text-zinc-500">{formatStoryTime(story.timestamp)}</span>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreateStory && (
          <StoryCreator
            selectedBgColor={selectedBgColor}
            onSelectBgColor={setSelectedBgColor}
            storyText={storyText}
            onChangeText={setStoryText}
            onClose={() => { setShowCreateStory(false); setStoryText(""); }}
            onSubmit={handleCreateStory}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingStory && (
          <StoryViewer
            userId={viewingStory.userId}
            stories={getStoriesForUser(viewingStory.userId)}
            usersMap={usersMap}
            onClose={() => setViewingStory(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function StoryCreator({
  selectedBgColor,
  onSelectBgColor,
  storyText,
  onChangeText,
  onClose,
  onSubmit,
}: {
  selectedBgColor: string;
  onSelectBgColor: (color: string) => void;
  storyText: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm mx-4 flex flex-col gap-4"
        data-testid="story-creator"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Create Story</h2>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className={cn("w-full aspect-[9/16] max-h-[60vh] rounded-2xl bg-gradient-to-br flex items-center justify-center p-8 relative overflow-hidden", selectedBgColor)}>
          <textarea
            value={storyText}
            onChange={e => onChangeText(e.target.value)}
            placeholder="Type your story..."
            className="bg-transparent text-white text-2xl font-bold text-center resize-none outline-none placeholder:text-white/40 w-full h-full flex items-center justify-center"
            style={{ display: "flex", alignItems: "center" }}
            autoFocus
            maxLength={200}
            data-testid="input-story-text"
          />
          <div className="absolute bottom-3 right-3 text-xs text-white/50">
            {storyText.length}/200
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          {STORY_COLORS.map((color, i) => (
            <button
              key={i}
              onClick={() => onSelectBgColor(color)}
              className={cn(
                "w-8 h-8 rounded-full bg-gradient-to-br transition-all",
                color,
                selectedBgColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110" : "opacity-70 hover:opacity-100"
              )}
              data-testid={`button-story-color-${i}`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-signal-blue hover:bg-blue-600 text-white"
            onClick={onSubmit}
            disabled={!storyText.trim()}
            data-testid="button-post-story"
          >
            <Send className="w-4 h-4 mr-2" />
            Post Story
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StoryViewer({
  userId,
  stories,
  usersMap,
  onClose,
}: {
  userId: string;
  stories: StoryEntry[];
  usersMap: Record<string, User>;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const user = usersMap[userId];
  const story = stories[currentIndex];
  const STORY_DURATION = 5000;

  useEffect(() => {
    if (stories.length === 0) {
      onClose();
      return;
    }
  }, [stories.length]);

  useEffect(() => {
    if (stories.length === 0) return;
    setProgress(0);
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          onClose();
        }
      }
    }, 50);

    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [currentIndex, stories.length]);

  const goNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!story) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      data-testid="story-viewer"
    >
      <div className="relative w-full h-full max-w-md mx-auto flex flex-col">
        <div className={cn("absolute inset-0 bg-gradient-to-br", story.bgColor || "from-zinc-800 to-zinc-900")} />

        <div className="relative z-10 flex flex-col h-full">
          <div className="px-4 pt-4">
            <div className="flex gap-1 mb-3">
              {stories.map((_, i) => (
                <div key={i} className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100"
                    style={{
                      width: i < currentIndex ? "100%" : i === currentIndex ? `${progress * 100}%` : "0%"
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar user={user} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-white">{userId === "me" ? "My Story" : user?.name || userId}</p>
                  <p className="text-[11px] text-white/60">{formatStoryTime(story.timestamp)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-white/50" />
                  <span className="text-[10px] text-white/50">E2E</span>
                </div>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10" onClick={onClose} data-testid="button-close-story">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-8">
            <p className="text-3xl font-bold text-white text-center leading-relaxed drop-shadow-lg">
              {story.text}
            </p>
          </div>

          <div className="absolute inset-0 flex z-20">
            <button className="w-1/3 h-full" onClick={goPrev} data-testid="button-story-prev" />
            <div className="w-1/3 h-full" />
            <button className="w-1/3 h-full" onClick={goNext} data-testid="button-story-next" />
          </div>

          <div className="relative z-30 px-4 pb-6">
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-5 h-5 text-white/40 cursor-pointer hover:text-white" onClick={goPrev} />
              <div className="flex-1 text-center">
                <p className="text-xs text-white/40">{currentIndex + 1} of {stories.length}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 cursor-pointer hover:text-white" onClick={goNext} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ContactsPanel({ users, usersMap, onSelectContact }: PanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const contacts = users
    .filter(u => !u.isMe)
    .filter(u => searchQuery === "" || u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const grouped: Record<string, User[]> = {};
  for (const contact of contacts) {
    const letter = contact.name[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(contact);
  }
  const sortedLetters = Object.keys(grouped).sort();

  return (
    <div className="w-80 bg-zinc-900 flex flex-col h-full">
      <div className="h-16 px-4 flex items-center shrink-0">
        <h1 className="font-bold text-xl text-white">Contacts</h1>
      </div>

      <div className="px-4 pb-4">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
          <input
            type="text"
            placeholder="Search contacts"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800 rounded-lg py-2 pl-10 pr-8 text-sm outline-none text-zinc-200 placeholder:text-zinc-500 focus:bg-zinc-700 transition-colors"
            data-testid="input-search-contacts"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
              data-testid="button-clear-search-contacts"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="px-6 py-10 text-center text-zinc-500 text-sm">
            {searchQuery ? `No contacts matching "${searchQuery}"` : "No contacts"}
          </div>
        ) : (
          sortedLetters.map(letter => (
            <div key={letter}>
              <div className="px-4 py-1.5">
                <p className="text-xs font-semibold text-zinc-500 uppercase">{letter}</p>
              </div>
              {grouped[letter].map(contact => (
                <div key={contact.id} className="px-3 py-0.5">
                  <button
                    onClick={() => onSelectContact?.(contact.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                    data-testid={`contact-item-${contact.id}`}
                  >
                    <Avatar user={contact} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-100 truncate">{contact.name}</p>
                      <p className="text-xs text-zinc-500 truncate">
                        {CONTACT_STATUSES[contact.id] || "Hey there! I am using Signal"}
                      </p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
