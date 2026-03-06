import { useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    icon: "😊",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐"],
  },
  {
    name: "Gestures",
    icon: "👋",
    emojis: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "💪", "🦾", "🦿"],
  },
  {
    name: "Hearts",
    icon: "❤️",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️", "🫶"],
  },
  {
    name: "Objects",
    icon: "🎉",
    emojis: ["🎉", "🎊", "🎈", "🎁", "🎀", "🏆", "🥇", "🥈", "🥉", "⚽", "🏀", "🏈", "⚾", "🎾", "🎮", "🎯", "🎲", "🧩", "🎸", "🎹", "🎺", "🎷", "🥁", "🎤", "🎧", "📱", "💻", "⌨️", "🖥️", "🖨️", "📷", "📹", "🔑", "🔒"],
  },
  {
    name: "Food",
    icon: "🍕",
    emojis: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🥑", "🍕", "🍔", "🍟", "🌭", "🍿", "🧂", "🥚", "🍳", "🧀", "🥩", "🍗", "🍖", "☕", "🍵", "🧃", "🍺", "🍻", "🥂", "🍷"],
  },
  {
    name: "Animals",
    icon: "🐶",
    emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧", "🐦", "🦆", "🦅", "🦉", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞"],
  },
  {
    name: "Flags",
    icon: "🚩",
    emojis: ["🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏴‍☠️", "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇯🇵", "🇰🇷", "🇩🇪", "🇫🇷", "🇮🇹", "🇪🇸", "🇧🇷", "🇮🇳", "🇲🇽"],
  },
];

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="w-80 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden" data-testid="emoji-picker">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <span className="text-xs font-medium text-zinc-400">{EMOJI_CATEGORIES[activeCategory].name}</span>
        <Button variant="ghost" size="icon" className="w-6 h-6 text-zinc-400 hover:text-white" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex px-2 py-1 gap-1 border-b border-zinc-800">
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(idx)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-colors",
              activeCategory === idx ? "bg-zinc-700" : "hover:bg-zinc-800"
            )}
            data-testid={`emoji-tab-${cat.name}`}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="h-48 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-0.5">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-700 text-xl transition-transform hover:scale-110 active:scale-95"
              data-testid={`emoji-${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
