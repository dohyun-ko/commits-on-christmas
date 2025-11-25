export type ChristmasProfile = {
  title: string;
  message: string;
  theme: "nice" | "naughty" | "neutral";
};

export function getChristmasProfile(streak: number, totalContributions: number): ChristmasProfile {
  if (streak === 0) {
    return {
      title: "The Grinch",
      message: "Your heart is an empty void, just like your contribution graph on Christmas. Even coal would be a gift at this point.",
      theme: "naughty",
    };
  }

  if (streak === 1) {
    return {
      title: "Christmas Rookie",
      message: "You showed up once. Was it an accident? Or did you just need an excuse to avoid family dinner?",
      theme: "neutral",
    };
  }

  if (streak >= 2 && streak < 5) {
    return {
      title: "Santa's Little Helper",
      message: "Consistent, reliable, but not quite magical yet. Keep pushing, maybe one day you'll lead the sleigh.",
      theme: "nice",
    };
  }

  if (streak >= 5 && streak < 10) {
    return {
      title: "Code Rudolph",
      message: "Your nose (and GitHub graph) shines so bright, you guide the other devs through the spaghetti code fog.",
      theme: "nice",
    };
  }

  if (streak >= 10) {
    return {
      title: "Father Christmas",
      message: "You are the legend itself. Do you even have a family? Or is `git commit` your only love language?",
      theme: "nice",
    };
  }

  return {
    title: "Holiday Ghost",
    message: "You exist, but barely. Try harder next year.",
    theme: "neutral",
  };
}
