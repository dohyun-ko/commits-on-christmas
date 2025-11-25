"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, Share2, RefreshCcw } from "lucide-react";
import { ChristmasProfile } from "@/lib/christmas";
import confetti from "canvas-confetti";

interface ResultCardProps {
  username: string;
  streak: number;
  totalContributions: number;
  profile: ChristmasProfile;
  onReset: () => void;
}

export function ResultCard({ username, streak, totalContributions, profile, onReset }: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      
      // Create a blob and share if supported
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `christmas-commits-${username}.png`, { type: "image/png" });

      if (navigator.share) {
        await navigator.share({
          title: "My Christmas Commits 🎄",
          text: `I'm a ${profile.title}! Check your Christmas commit streak.`,
          files: [file],
        });
      } else {
        // Fallback to download
        const link = document.createElement("a");
        link.download = `christmas-commits-${username}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Failed to share", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#d42426', '#ffffff']
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onAnimationComplete={triggerConfetti}
      className="flex flex-col items-center gap-6 max-w-md w-full mx-auto p-4"
    >
      {/* The Card Itself - This is what gets captured */}
      <div 
        ref={cardRef}
        className="relative w-full aspect-[4/5] bg-gradient-to-br from-[#1a2342] to-[#0b1026] rounded-2xl overflow-hidden shadow-2xl border border-white/10 p-8 flex flex-col justify-between"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/20 blur-[100px] rounded-full" />

        <div className="relative z-10 flex flex-col h-full items-center text-center justify-between">
          <div className="space-y-2">
            <h3 className="text-xl text-white/60 font-medium">@{username}</h3>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">
              {profile.title}
            </h1>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 gap-4">
            <div className="text-8xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              {streak}
            </div>
            <div className="text-2xl text-white/80 font-light uppercase tracking-widest">
              Year Streak
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-white/90 italic font-serif leading-relaxed px-4">
              "{profile.message}"
            </p>
            
            <div className="pt-6 border-t border-white/10 w-full flex justify-between items-end text-sm text-white/40">
              <div className="flex flex-col items-start">
                <span>Total Contributions</span>
                <span className="text-white font-mono">{totalContributions}</span>
              </div>
              <div className="flex flex-col items-end">
                <span>commitsonchristmas.com</span>
                <span>2025 Edition</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 w-full">
        <Button 
          onClick={handleShare} 
          disabled={isGenerating}
          className="flex-1 bg-white text-black hover:bg-gray-200 font-bold h-12 rounded-xl"
        >
          {isGenerating ? (
            "Preparing..."
          ) : (
            <>
              <Share2 className="mr-2 h-4 w-4" /> Share Card
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={onReset}
          className="w-12 h-12 p-0 rounded-xl border-white/20 hover:bg-white/10 text-white"
        >
          <RefreshCcw className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}
