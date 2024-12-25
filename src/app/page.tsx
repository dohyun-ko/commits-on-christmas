"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalContributions, setTotalContributions] = useState(0);

  const handleSubmit = async () => {
    if (!username) {
      setError("Please enter a valid username");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/christmas?username=" + username);

    if (response.ok) {
      const data = await response.json();
      console.log(data);

      if (data.error) {
        setError(data.error);
      } else {
        setStreak(data.streak);
        setTotalContributions(data.totalContributions);

        setStep(1);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {step === 0 ? (
          <div
            className={
              "flex flex-col border border-red-800 bg-[#8c261a] p-4 rounded-xl items-stretch"
            }
          >
            <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text tracking-tight bg-gradient-to-r from-yellow-100 to-red-200 ">
              Commits on Christmas!
            </h1>

            <p className="text-center text-white font-extralight text-lg">
              Proof your commitment to open source
            </p>

            <div className="flex flex-col gap-3 text-xl mt-5">
              <Input
                className={
                  "bg-[rgba(255,255,255,0.1)] rounded-lg py-1.5 px-4 text-white placeholder:text-[rgba(255,255,255,0.5)] border-none"
                }
                type="text"
                placeholder="Enter your GitHub username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="text-red-200 text-sm">{error}</p>

              <Button
                size={"lg"}
                className="bg-gradient-to-r to-green-900 from-lime-700 text-white py-1.5 px-4 rounded-lg font-semibold text-xl"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Loading..." : "Find My Streak 🎄"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 items-center w-full bg-black md:max-w-[500px] md:aspect-[4/7] text-white">
            <div className={"flex"}>
              <div className="flex flex-col font-bold">
                <span>@{username}</span>
                <span>Contributions on Christmas</span>
              </div>
            </div>

            <div
              className={
                "flex flex-col gap-2 items-center bg-[#d69e2e] opacity-30"
              }
            >
              <span>{streak}</span>

              <span>Year Streak 🔥</span>
            </div>

            <div>total contributions: {totalContributions}</div>
          </div>
        )}
      </main>
    </div>
  );
}
