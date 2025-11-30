"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

interface LandingViewProps {
  onSearch: (username: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export function LandingView({ onSearch, loading, error }: LandingViewProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-6"
    >
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center text-center space-y-8">
        <div className="space-y-2">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-primary drop-shadow-lg"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            Commits on Christmas
          </motion.h1>
          <p className="text-md text-gray-300 font-light">
            Did you push to production on Christmas Eve?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="GitHub Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/20 border-white/10 text-white placeholder:text-white/40 h-12 pl-12 rounded-xl focus-visible:ring-primary"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}

          <Button 
            type="submit" 
            disabled={loading || !username}
            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-yellow-600 hover:from-yellow-400 hover:to-yellow-700 text-black rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Run `git status` 🎁"
            )}
          </Button>
        </form>

        <div className="text-xs text-white/30">
          Open Source &bull; Made with 🎄 by <a href="https://github.com/dohyun-ko/commits-on-christmas" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@dohyun-ko</a>
        </div>
      </div>
    </motion.div>
  );
}
