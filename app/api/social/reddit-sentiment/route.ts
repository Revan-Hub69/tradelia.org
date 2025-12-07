import { NextResponse } from 'next/server';
import vader from 'vader-sentiment';

const { SentimentIntensityAnalyzer } = vader;

interface RedditPost {
  title: string;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  url: string;
  subreddit: string;
}

interface RedditSentimentData {
  subreddit: string;
  averageSentiment: number;
  totalPosts: number;
  averageScore: number;
  averageUpvoteRatio: number;
  topPosts: Array<{
    title: string;
    score: number;
    upvoteRatio: number;
    sentiment: number;
    permalink: string;
  }>;
}

const REDDIT_BASE_URL = 'https://www.reddit.com';

async function fetchRedditPosts(subreddit: string, limit: number = 25): Promise<RedditPost[]> {
  try {
    const url = `${REDDIT_BASE_URL}/r/${subreddit}/hot.json?limit=${limit}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Tradelia/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.children?.map((child: { data: RedditPost }) => child.data) || [];
  } catch (error) {
    console.error(`Error fetching Reddit posts from r/${subreddit}:`, error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subreddit = searchParams.get('subreddit') || 'cryptocurrency';
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    // Fetch posts from subreddit
    const posts = await fetchRedditPosts(subreddit, limit);

    if (posts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          subreddit,
          averageSentiment: 0,
          totalPosts: 0,
          averageScore: 0,
          averageUpvoteRatio: 0,
          topPosts: [],
        },
      });
    }

    // Analyze sentiment for each post
    const postsWithSentiment = posts.map(post => {
      const sentiment = SentimentIntensityAnalyzer.polarity_scores(post.title);
      return {
        ...post,
        sentiment: sentiment.compound,
      };
    });

    // Calculate averages
    const totalSentiment = postsWithSentiment.reduce((sum, post) => sum + post.sentiment, 0);
    const averageSentiment = totalSentiment / postsWithSentiment.length;

    const totalScore = postsWithSentiment.reduce((sum, post) => sum + post.score, 0);
    const averageScore = totalScore / postsWithSentiment.length;

    const totalUpvoteRatio = postsWithSentiment.reduce((sum, post) => sum + post.upvote_ratio, 0);
    const averageUpvoteRatio = totalUpvoteRatio / postsWithSentiment.length;

    // Get top 10 posts by score
    const topPosts = postsWithSentiment
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(post => ({
        title: post.title,
        score: post.score,
        upvoteRatio: post.upvote_ratio,
        sentiment: post.sentiment,
        permalink: `${REDDIT_BASE_URL}${post.permalink}`,
      }));

    const result: RedditSentimentData = {
      subreddit,
      averageSentiment: Math.round(averageSentiment * 1000) / 1000, // Round to 3 decimals
      totalPosts: postsWithSentiment.length,
      averageScore: Math.round(averageScore),
      averageUpvoteRatio: Math.round(averageUpvoteRatio * 1000) / 1000,
      topPosts,
    };

    return NextResponse.json({
      success: true,
      data: result,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600', // 30 min cache
      },
    });
  } catch (error) {
    console.error('Error in Reddit sentiment route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Reddit sentiment',
        data: {
          subreddit: 'cryptocurrency',
          averageSentiment: 0,
          totalPosts: 0,
          averageScore: 0,
          averageUpvoteRatio: 0,
          topPosts: [],
        },
      },
      { status: 500 }
    );
  }
}
