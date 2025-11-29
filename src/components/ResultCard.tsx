"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Share2, RefreshCcw } from "lucide-react";
import { ChristmasProfile } from "@/lib/christmas";
import confetti from "canvas-confetti";

interface ResultCardProps {
  username: string;
  streak: number;
  totalContributions: number;
  contributions: { date: string; contributionCount: number }[];
  profile: ChristmasProfile;
  onReset: () => void;
}

export function ResultCard({ username, streak, totalContributions, contributions, profile, onReset }: ResultCardProps) {
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
      className="flex flex-col items-center gap-4 md:gap-6 max-w-md w-full mx-auto p-4 md:p-0"
    >
      {/* The Card Itself - This is what gets captured */}
      <div 
        ref={cardRef}
        className="relative w-full bg-[#0f172a] rounded-3xl overflow-hidden shadow-2xl border border-white/10 p-6 md:p-8 flex flex-col justify-between"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-secondary/20 blur-[120px] rounded-full" />
        
        {/* Glass Effect Overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 md:mb-8">
            <div className="flex flex-col">
              <span className="text-xs md:text-sm text-white/40 font-medium tracking-wider uppercase">Christmas Commits</span>
              <h3 className="text-lg md:text-xl text-white font-semibold">@{username}</h3>
            </div>
            <div className="text-right">
              <div className="text-[10px] md:text-xs text-white/40 font-mono mb-1">Total Contributions</div>
              <div className="text-base md:text-lg text-white font-mono font-bold">{totalContributions}</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 md:gap-4 mb-6 md:mb-8">
            <div className="relative">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary bg-[length:200%_auto] animate-gradient">
                {profile.title}
              </h1>
              <div className="absolute -inset-4 bg-primary/20 blur-xl -z-10 rounded-full opacity-50" />
            </div>
            
            <div className="flex flex-col items-center gap-1 md:gap-2">
              <div className="text-6xl md:text-7xl font-bold text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                {streak}
              </div>
              <div className="text-xs md:text-sm text-white/60 font-medium tracking-[0.2em] uppercase">
                Year Streak
              </div>
            </div>

            <p className="text-base md:text-lg text-white/80 italic font-serif leading-relaxed max-w-[90%] md:max-w-[80%] mt-2 md:mt-4">
              &quot;{profile.message}&quot;
            </p>
          </div>

          {/* Heatmap */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-white/40 font-medium uppercase tracking-wider">
              <span>Activity History</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className={`grid grid-cols-[repeat(${contributions.length},minmax(12px,1fr))] gap-1`}>
              {[...contributions].reverse().map((day) => (
                <div 
                  key={day.date} 
                  className="group relative aspect-square rounded-sm overflow-hidden"
                >
                  <div 
                    className={`w-full h-full transition-all duration-500 ${
                      day.contributionCount > 0 
                        ? 'bg-primary shadow-[0_0_10px_rgba(34,197,94,0.4)]' 
                        : 'bg-white/5'
                    }`}
                    style={{
                      opacity: day.contributionCount > 0 ? Math.min(0.4 + (day.contributionCount * 0.1), 1) : 1
                    }}
                  />
                  {/* Tooltip-ish year label */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-[10px] text-white font-mono">
                    {day.date.split('-')[0]}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-white/30 font-mono pt-1">
              {/* Since we reversed, the first item is the newest (e.g. 2024), last is oldest (e.g. 2010) */}
              {/* But visually we want to show range. Left is newest now. */}
              <span>{contributions[contributions.length - 1]?.date.split('-')[0]}</span>
              <span>{contributions[0]?.date.split('-')[0]}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-white/40 uppercase tracking-widest">
            <span>commit.holiday</span>
            <span>2025 Edition</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 w-full">
        <Button 
          onClick={handleShare} 
          disabled={isGenerating}
          className="flex-1 bg-white text-black hover:bg-gray-200 font-bold h-12 rounded-xl transition-transform active:scale-95"
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
          className="w-12 h-12 p-0 rounded-xl border-white/20 hover:bg-white/10 text-white transition-transform active:scale-95"
        >
          <RefreshCcw className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}
