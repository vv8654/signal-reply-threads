import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, MonitorUp, MessageSquare, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallScreenProps {
  isOpen: boolean;
  callType: "video" | "audio";
  contactName: string;
  contactInitials: string;
  contactColor: string;
  contactAvatar?: string | null;
  participantCount?: number;
  onEnd: () => void;
}

type CallState = "ringing" | "connecting" | "connected";

export function CallScreen({
  isOpen,
  callType,
  contactName,
  contactInitials,
  contactColor,
  contactAvatar,
  participantCount = 1,
  onEnd,
}: CallScreenProps) {
  const [callState, setCallState] = useState<CallState>("ringing");
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(callType === "audio");
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCallState("ringing");
      setElapsed(0);
      setIsMuted(false);
      setIsCameraOff(callType === "audio");
      setIsSpeakerOff(false);
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        setLocalStream(null);
      }
      return;
    }

    const ringTimer = setTimeout(() => setCallState("connecting"), 1500);
    const connectTimer = setTimeout(() => setCallState("connected"), 3000);

    return () => {
      clearTimeout(ringTimer);
      clearTimeout(connectTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (callState === "connected") {
      timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  useEffect(() => {
    if (isOpen && callType === "video" && !isCameraOff) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {});
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen, callType, isCameraOff]);

  const handleEnd = () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }
    onEnd();
  };

  const toggleCamera = () => {
    if (!isCameraOff && localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }
    setIsCameraOff(!isCameraOff);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const statusText = callState === "ringing" ? "Ringing..." : callState === "connecting" ? "Connecting..." : formatTime(elapsed);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-between overflow-hidden"
          data-testid="call-screen"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black" />
          
          {/* Animated rings during ringing */}
          {callState === "ringing" && (
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="absolute w-32 h-32 rounded-full border border-signal-blue/20 -left-16 -top-16"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2 + i * 0.5, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
                />
              ))}
            </div>
          )}

          {/* Top bar */}
          <div className="relative z-10 w-full flex items-center justify-between px-6 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-zinc-400 font-medium">
                {callType === "video" ? "Signal Video Call" : "Signal Voice Call"}
                {callState === "connected" && " • Encrypted"}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-zinc-400 hover:text-white" onClick={handleEnd}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Main content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 w-full">
            {/* Remote video / avatar area */}
            {callType === "video" && callState === "connected" ? (
              <div className="w-full max-w-2xl aspect-video bg-zinc-900 rounded-2xl flex items-center justify-center relative overflow-hidden mx-4">
                {/* Simulated remote video = avatar placeholder */}
                <div className="flex flex-col items-center gap-4">
                  {contactAvatar ? (
                    <img src={contactAvatar} className="w-24 h-24 rounded-full object-cover ring-4 ring-zinc-700" />
                  ) : (
                    <div className={cn("w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white ring-4 ring-zinc-700", contactColor)}>
                      {contactInitials}
                    </div>
                  )}
                  <p className="text-zinc-400 text-sm">Camera off on their end</p>
                </div>

                {/* Local video pip */}
                {!isCameraOff && localStream ? (
                  <div className="absolute bottom-4 right-4 w-36 h-28 rounded-xl overflow-hidden bg-zinc-800 border-2 border-zinc-600 shadow-xl">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                  </div>
                ) : (
                  <div className="absolute bottom-4 right-4 w-36 h-28 rounded-xl bg-zinc-800 border-2 border-zinc-600 shadow-xl flex items-center justify-center">
                    <VideoOff className="w-6 h-6 text-zinc-500" />
                  </div>
                )}
              </div>
            ) : (
              <>
                {contactAvatar ? (
                  <motion.img
                    src={contactAvatar}
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-zinc-700 shadow-2xl"
                    animate={callState === "ringing" ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                ) : (
                  <motion.div
                    className={cn("w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white ring-4 ring-zinc-700 shadow-2xl", contactColor)}
                    animate={callState === "ringing" ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {contactInitials}
                  </motion.div>
                )}
              </>
            )}

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-1">{contactName}</h2>
              <motion.p
                className={cn(
                  "text-sm font-medium",
                  callState === "connected" ? "text-green-400" : "text-zinc-400"
                )}
                key={statusText}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {statusText}
              </motion.p>
              {participantCount > 1 && (
                <p className="text-xs text-zinc-500 mt-1">{participantCount} participants</p>
              )}
            </div>
          </div>

          {/* Bottom controls */}
          <div className="relative z-10 w-full pb-10 pt-6">
            <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
              <CallButton
                icon={isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                label={isMuted ? "Unmute" : "Mute"}
                active={isMuted}
                onClick={() => setIsMuted(!isMuted)}
              />
              {callType === "video" && (
                <CallButton
                  icon={isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                  label={isCameraOff ? "Camera On" : "Camera Off"}
                  active={isCameraOff}
                  onClick={toggleCamera}
                />
              )}
              <CallButton
                icon={isSpeakerOff ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                label={isSpeakerOff ? "Speaker" : "Speaker Off"}
                active={isSpeakerOff}
                onClick={() => setIsSpeakerOff(!isSpeakerOff)}
              />
              {callType === "video" && (
                <CallButton
                  icon={<MonitorUp className="w-6 h-6" />}
                  label="Share"
                  onClick={() => {}}
                />
              )}

              {/* End call button */}
              <button
                onClick={handleEnd}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-all shadow-lg shadow-red-900/30 active:scale-95"
                data-testid="button-end-call"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CallButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 transition-all active:scale-95",
      )}
      data-testid={`button-call-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className={cn(
        "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
        active ? "bg-white text-zinc-900" : "bg-zinc-800 text-white hover:bg-zinc-700"
      )}>
        {icon}
      </div>
      <span className="text-[10px] text-zinc-400 font-medium">{label}</span>
    </button>
  );
}
