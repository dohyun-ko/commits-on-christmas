"use client";

import { useState } from "react";
import { Snowfall } from "@/components/Snowfall";
import { LandingView } from "@/components/LandingView";
import { LoadingView } from "@/components/LoadingView";
import { ResultCard } from "@/components/ResultCard";
import { getChristmasProfile, ChristmasProfile } from "@/lib/christmas";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"landing" | "result">("landing");
  
  const [data, setData] = useState<{
    username: string;
    streak: number;
    totalContributions: number;
    contributions: { date: string; contributionCount: number }[];
    profile: ChristmasProfile;
  } | null>(null);

  const handleSearch = async (username: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/christmas?username=" + username);
      const result = await response.json();

      if (result.error) {
        setError(result.error);
        return;
      }

      const profile = getChristmasProfile(result.streak, result.totalContributions);
      
      console.log(result);

      setData({
        username,
        streak: result.streak,
        totalContributions: result.totalContributions,
        contributions: result.contributions,
        profile
      });
      
      setStep("result");
    } catch {
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("landing");
    setData(null);
    setError("");
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-[#0b1026]">
      <Snowfall />
      
      <div className="relative z-10 w-full px-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingView />
            </motion.div>
          ) : step === "landing" ? (
            <LandingView 
              key="landing"
              onSearch={handleSearch} 
              loading={loading} 
              error={error} 
            />
          ) : (
            data && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ResultCard 
                  username={data.username}
                  streak={data.streak}
                  totalContributions={data.totalContributions}
                  contributions={data.contributions}
                  profile={data.profile}
                  onReset={handleReset}
                />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
