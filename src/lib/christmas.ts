export type ChristmasProfile = {
  title: string;
  message: string;
  theme: "nice" | "naughty" | "neutral";
};

export function getChristmasProfile(streak: number, totalContributions: number): ChristmasProfile {
  if (streak === 0) {
    if (totalContributions > 0) {
      return {
        title: "The Recovering Dev",
        message: "You used to code on Christmas, but you finally stopped. We're jealous.",
        theme: "nice",
      };
    }
    return {
      title: "The Grass Toucher",
      message: "Zero commits. You are actually enjoying your holiday. Teach us your ways.",
      theme: "nice",
    };
  }

  if (streak === 1) {
    return {
      title: "The Misclick",
      message: "One commit. Probably a panic fix before dinner. Or just wanted to look busy.",
      theme: "neutral",
    };
  }

  if (streak >= 2 && streak < 5) {
    return {
      title: "The Workaholic",
      message: "You're starting to enjoy this. First a 'quick fix', next you're refactoring at midnight.",
      theme: "neutral",
    };
  }

  if (streak >= 5 && streak < 10) {
    return {
      title: "The 10x Grinch",
      message: "Your family is opening gifts, and you're resolving merge conflicts.",
      theme: "naughty",
    };
  }

  // streak >= 10
  return {
    title: "The Final Boss",
    message: "A decade of holiday commits. You are a legend, but please rest.",
    theme: "naughty",
  };
}
