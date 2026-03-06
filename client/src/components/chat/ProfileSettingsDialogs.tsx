import { useState } from "react";
import { cn } from "@/lib/utils";
import { type User } from "@/lib/api";
import { X, Camera, Bell, BellOff, Moon, Sun, Shield, Lock, Palette, Globe, HardDrive, Info, ShieldCheck, Fingerprint, Eye, EyeOff, KeyRound, Phone, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | undefined;
}

export function ProfileDialog({ isOpen, onClose, user }: ProfileDialogProps) {
  const [name, setName] = useState(user?.name || "Me");
  const [about, setAbout] = useState("Hey there! I'm using Signal.");
  const [phone, setPhone] = useState("+1 (512) 555-0123");
  const [editing, setEditing] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
          data-testid="profile-dialog"
        >
          <div className="relative h-32 bg-gradient-to-br from-signal-blue to-blue-700">
            <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-white/70 hover:text-white hover:bg-white/10" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="px-6 -mt-12 pb-6">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {user?.avatar ? (
                <img src={user.avatar} className="w-24 h-24 rounded-full object-cover ring-4 ring-zinc-900" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-signal-blue ring-4 ring-zinc-900 flex items-center justify-center text-3xl font-bold text-white">
                  {user?.name?.[0] || "M"}
                </div>
              )}
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-signal-blue flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors" data-testid="button-change-avatar">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-500 font-medium mb-1 block">NAME</label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    data-testid="input-profile-name"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-medium mb-1 block">ABOUT</label>
                  <Input
                    value={about}
                    onChange={e => setAbout(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    data-testid="input-profile-about"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => setEditing(false)} variant="outline" className="flex-1 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-100">Cancel</Button>
                  <Button onClick={() => setEditing(false)} className="flex-1 bg-signal-blue hover:bg-blue-600 text-white" data-testid="button-save-profile">Save</Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <h2 className="text-xl font-bold text-white">{name}</h2>
                <p className="text-sm text-zinc-400">{about}</p>
                <div className="bg-zinc-800 rounded-xl p-3 text-left">
                  <p className="text-xs text-zinc-500 font-medium mb-1">PHONE NUMBER</p>
                  <p className="text-sm text-zinc-200">{phone}</p>
                </div>
                <Button onClick={() => setEditing(true)} variant="outline" className="w-full bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-100" data-testid="button-edit-profile">
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [screenLock, setScreenLock] = useState(false);
  const [screenSecurity, setScreenSecurity] = useState(true);
  const [incognitoKeyboard, setIncognitoKeyboard] = useState(true);
  const [registrationLock, setRegistrationLock] = useState(true);
  const [sealedSender, setSealedSender] = useState(true);
  const [alwaysRelayCalls, setAlwaysRelayCalls] = useState(false);
  const [showSealedSenderIndicator, setShowSealedSenderIndicator] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [linkPreviews, setLinkPreviews] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
          data-testid="settings-dialog"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
            <h2 className="text-lg font-bold text-white">Settings</h2>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
            <SettingsSection title="Encryption" icon={<Lock className="w-4 h-4" />}>
              <div className="flex items-center gap-3 py-3">
                <div className="flex-1">
                  <p className="text-sm text-zinc-200">Signal Protocol</p>
                  <p className="text-[11px] text-zinc-500">All messages use the Signal Protocol for end-to-end encryption</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
              </div>
            </SettingsSection>

            <SettingsSection title="Security" icon={<Shield className="w-4 h-4" />}>
              <SettingsToggle label="Screen Security" value={screenSecurity} onChange={setScreenSecurity} testId="toggle-screen-security" description="Block screenshots in recent apps list" />
              <SettingsToggle label="Incognito Keyboard" value={incognitoKeyboard} onChange={setIncognitoKeyboard} testId="toggle-incognito-keyboard" description="Request keyboard not to learn from what you type" />
              <SettingsToggle label="Registration Lock" value={registrationLock} onChange={setRegistrationLock} testId="toggle-registration-lock" description="Require PIN to register this number on a new device" />
              <SettingsToggle label="Screen Lock" value={screenLock} onChange={setScreenLock} testId="toggle-screen-lock" description="Require biometric or passcode to unlock Signal" />
            </SettingsSection>

            <SettingsSection title="Sealed Sender" icon={<Fingerprint className="w-4 h-4" />}>
              <SettingsToggle label="Allow from Anyone" value={sealedSender} onChange={setSealedSender} testId="toggle-sealed-sender" description="Allow sealed sender messages from non-contacts" />
              <SettingsToggle label="Status Indicator" value={showSealedSenderIndicator} onChange={setShowSealedSenderIndicator} testId="toggle-sealed-indicator" description="Show sealed sender status on messages" />
            </SettingsSection>

            <SettingsSection title="Calls" icon={<Phone className="w-4 h-4" />}>
              <SettingsToggle label="Always Relay Calls" value={alwaysRelayCalls} onChange={setAlwaysRelayCalls} testId="toggle-relay-calls" description="Route all calls through Signal server to avoid revealing IP address" />
            </SettingsSection>

            <SettingsSection title="Privacy" icon={<Eye className="w-4 h-4" />}>
              <SettingsToggle label="Read Receipts" value={readReceipts} onChange={setReadReceipts} testId="toggle-read-receipts" />
              <SettingsToggle label="Typing Indicators" value={typingIndicators} onChange={setTypingIndicators} testId="toggle-typing" />
            </SettingsSection>

            <SettingsSection title="Notifications" icon={<Bell className="w-4 h-4" />}>
              <SettingsToggle label="Message Notifications" value={notifications} onChange={setNotifications} testId="toggle-notifications" />
            </SettingsSection>

            <SettingsSection title="Appearance" icon={<Palette className="w-4 h-4" />}>
              <SettingsToggle label="Dark Mode" value={darkMode} onChange={setDarkMode} testId="toggle-dark-mode" />
              <SettingsToggle label="Link Previews" value={linkPreviews} onChange={setLinkPreviews} testId="toggle-link-previews" />
            </SettingsSection>

            <SettingsSection title="Storage" icon={<HardDrive className="w-4 h-4" />}>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-zinc-300">Storage Used</span>
                <span className="text-sm text-zinc-400">1.2 GB</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-signal-blue h-2 rounded-full" style={{ width: "24%" }} />
              </div>
              <p className="text-xs text-zinc-500 mt-1">1.2 GB of 5 GB used</p>
            </SettingsSection>

            <SettingsSection title="About" icon={<Info className="w-4 h-4" />}>
              <div className="space-y-2 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Version</span>
                  <span className="text-zinc-300">7.6.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Protocol</span>
                  <span className="text-green-400">Signal Protocol v3</span>
                </div>
              </div>
            </SettingsSection>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SettingsSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-signal-blue">{icon}</span>
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="bg-zinc-800/50 rounded-xl px-4 py-1 divide-y divide-zinc-700/50">
        {children}
      </div>
    </div>
  );
}

function SettingsToggle({ label, value, onChange, testId, description }: { label: string; value: boolean; onChange: (v: boolean) => void; testId: string; description?: string }) {
  return (
    <div className="flex items-center justify-between py-3 gap-3">
      <div className="flex-1">
        <span className="text-sm text-zinc-200">{label}</span>
        {description && <p className="text-[11px] text-zinc-500 mt-0.5">{description}</p>}
      </div>
      <Switch checked={value} onCheckedChange={onChange} data-testid={testId} />
    </div>
  );
}
