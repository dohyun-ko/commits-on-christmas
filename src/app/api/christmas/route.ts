import { NextResponse } from "next/server";
import { Octokit } from "octokit";

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
    const currentYear = new Date().getFullYear();
    const startYear = 2010; // Adjust this to the earliest year you want to fetch commits for

    // Generate date ranges for all Christmas days
    const christmasRanges = Array.from(
      { length: currentYear - startYear + 1 },
      (_, i) => {
        const year = startYear + i;
        return {
          fromDate: new Date(`${year}-12-25T00:00:00Z`).toISOString(),
          toDate: new Date(`${year}-12-26T00:00:00Z`).toISOString(),
        };
      }
    );

    // Fetch data for all years in parallel using Promise.all
    const results = await Promise.all(
      christmasRanges.map(async (range) => {
        const graphqlResponse: GraphQLResponse = await octokit.graphql(query, {
          username,
          fromDate: range.fromDate,
          toDate: range.toDate,
        });

        // Extract the Christmas Day contribution
        const christmasDay =
          graphqlResponse.user.contributionsCollection.contributionCalendar.weeks
            .flatMap((week) => week.contributionDays)
            .find((day) => day.date === range.fromDate.split("T")[0]); // Ensure we match Christmas day only

        return (
          christmasDay || {
            date: range.fromDate.split("T")[0],
            contributionCount: 0,
          }
        ); // Default to 0 if no data
      })
    );

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

    return NextResponse.json(
      {
        totalContributions: results.reduce(
          (sum, day) => sum + day.contributionCount,
          0
        ),
        streak,
        contributions: sortedContributions,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
