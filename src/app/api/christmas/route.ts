import { NextResponse } from "next/server";
import { Octokit } from "octokit";
import { unstable_cache } from "next/cache";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const query = `
query($username: String!, $fromDate: DateTime!, $toDate: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $fromDate, to: $toDate) {
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
`;

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface GraphQLResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: {
          contributionDays: ContributionDay[];
        }[];
      };
    };
  };
}

// Cached data fetching function
const getCachedChristmasData = unstable_cache(
  async (username: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    // Check if today is on or after Dec 25th (Month is 0-indexed, so 11 is Dec)
    const isPastChristmas = now.getMonth() === 11 && now.getDate() >= 25;
    const endYear = isPastChristmas ? currentYear : currentYear - 1;
    
    const startYear = 2010; // Adjust this to the earliest year you want to fetch commits for
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    // 1. Dynamically construct the query with aliases
    // We use aliases like "year2010", "year2011" to fetch multiple years in one go.
    const queryParts = years.map((year) => {
      const fromDate = new Date(`${year}-12-25T00:00:00Z`).toISOString();
      const toDate = new Date(`${year}-12-26T00:00:00Z`).toISOString();
      return `
        year${year}: user(login: $username) {
          contributionsCollection(from: "${fromDate}", to: "${toDate}") {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      `;
    });

    const fullQuery = `
      query($username: String!) {
        ${queryParts.join("\n")}
      }
    `;

    try {
      // 2. Fetch all data in a single request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await octokit.graphql(fullQuery, { username });

      // 3. Process the response
      const results = years.map((year) => {
        const yearKey = `year${year}`;
        const userData = response[yearKey];

        if (!userData) {
           return {
            date: `${year}-12-25`,
            contributionCount: 0,
          };
        }

        const christmasDay =
          userData.contributionsCollection.contributionCalendar.weeks
            .flatMap((week: any) => week.contributionDays)
            .find((day: any) => day.date === `${year}-12-25`);

        return (
          christmasDay || {
            date: `${year}-12-25`,
            contributionCount: 0,
          }
        );
      });

      // Calculate the current streak
      const sortedContributions = results.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      let streak = 0;
      for (const day of sortedContributions) {
        if (day.contributionCount > 0) {
          streak++;
        } else {
          break; // Stop streak if a day has 0 contributions
        }
      }

      return {
        totalContributions: results.reduce(
          (sum, day) => sum + day.contributionCount,
          0
        ),
        streak,
        contributions: sortedContributions,
      };

    } catch (error) {
       console.error("GraphQL Error:", error);
       // Fallback or re-throw depending on desired behavior. 
       // For now, re-throwing to be caught by the outer try-catch
       throw error;
    }
  },
  ['christmas-commits-data-v2'], // Updated cache key for new implementation
  {
    revalidate: 86400, // Cache for 24 hours (in seconds)
    tags: ['christmas-data']
  }
);

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Please provide a username" },
      { status: 400 }
    );
  }

  try {
    const data = await getCachedChristmasData(username);
    
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
