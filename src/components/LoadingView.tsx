"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const LOADING_MESSAGES = [
  "Checking the Naughty or Nice list...",
  "Feeding the reindeers...",
  "Counting your commits one by one...",
  "Asking Linus Torvalds for permission...",
  "Warming up the servers with hot cocoa...",
  "Untangling the Christmas lights...",
  "Debugging the North Pole mainframe...",
  "Consulting the Ghosts of Commits Past...",
];

export function LoadingView() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
      </div>
      
      <div className="h-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xl md:text-2xl font-medium text-white/90 font-serif italic"
          >
            {LOADING_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
