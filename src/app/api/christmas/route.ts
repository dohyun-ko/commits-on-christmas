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

interface GraphQLResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: {
          contributionDays: {
            date: string;
            contributionCount: number;
          }[];
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
    let contributions: { date: string; contributionCount: number }[] = [];

    // Loop through each year and fetch Christmas commits
    for (let year = startYear; year <= currentYear; year++) {
      const fromDate = new Date(`${year}-12-25T00:00:00Z`).toISOString();
      const toDate = new Date(`${year}-12-26T00:00:00Z`).toISOString();

      const graphqlResponse: GraphQLResponse = await octokit.graphql(query, {
        username,
        fromDate,
        toDate,
      });

      // Extract contribution days from the GraphQL response
      const days =
        graphqlResponse.user.contributionsCollection.contributionCalendar.weeks
          .flatMap((week) => week.contributionDays)
          .filter((day) => day.date.startsWith(`${year}-12-25`)); // Only include Christmas Day

      contributions = contributions.concat(days);
    }

    // Calculate the current streak
    let streak = 0;
    const sortedContributions = contributions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const day of sortedContributions) {
      if (day.contributionCount > 0) {
        streak++;
      } else {
        break; // Stop streak if a day has 0 contributions
      }
    }

    return NextResponse.json(
      {
        totalContributions: contributions.reduce(
          (sum, day) => sum + day.contributionCount,
          0
        ),
        streak,
        contributions,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
