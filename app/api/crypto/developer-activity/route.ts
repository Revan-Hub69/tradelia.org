import { NextResponse } from 'next/server';

const GITHUB_API_BASE = 'https://api.github.com';

interface Repository {
  owner: string;
  repo: string;
  name: string;
}

interface DeveloperActivity {
  repository: string;
  commits7d: number;
  commits30d: number;
  contributors: number;
  stars: number;
  forks: number;
  lastCommit: string;
  releaseCount: number;
  lastRelease: string | null;
}

const REPOSITORY_MAP: Record<string, Repository> = {
  'BTC': { owner: 'bitcoin', repo: 'bitcoin', name: 'Bitcoin' },
  'ETH': { owner: 'ethereum', repo: 'go-ethereum', name: 'Ethereum' },
  'SOL': { owner: 'solana-labs', repo: 'solana', name: 'Solana' },
  'ADA': { owner: 'input-output-hk', repo: 'cardano-node', name: 'Cardano' },
  'DOT': { owner: 'paritytech', repo: 'polkadot', name: 'Polkadot' },
  'AVAX': { owner: 'ava-labs', repo: 'avalanchego', name: 'Avalanche' },
  'ATOM': { owner: 'cosmos', repo: 'cosmos-sdk', name: 'Cosmos' },
  'LINK': { owner: 'smartcontractkit', repo: 'chainlink', name: 'Chainlink' },
};

async function fetchCommits(owner: string, repo: string, days: number): Promise<number> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceISO = since.toISOString();

    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?since=${sinceISO}&per_page=100`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Tradelia/1.0',
      },
    });

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (error) {
    console.error(`Error fetching commits for ${owner}/${repo}:`, error);
    return 0;
  }
}

async function fetchRepositoryStats(owner: string, repo: string) {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Tradelia/1.0',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching repo stats for ${owner}/${repo}:`, error);
    return null;
  }
}

async function fetchReleases(owner: string, repo: string) {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/releases?per_page=10`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Tradelia/1.0',
      },
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching releases for ${owner}/${repo}:`, error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asset = searchParams.get('asset') || 'BTC';

    const repository = REPOSITORY_MAP[asset.toUpperCase()];
    if (!repository) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Repository not found for asset: ${asset}`,
          data: null,
        },
        { status: 404 }
      );
    }

    // Fetch all data in parallel
    const [commits7d, commits30d, repoStats, releases] = await Promise.all([
      fetchCommits(repository.owner, repository.repo, 7),
      fetchCommits(repository.owner, repository.repo, 30),
      fetchRepositoryStats(repository.owner, repository.repo),
      fetchReleases(repository.owner, repository.repo),
    ]);

    const result: DeveloperActivity = {
      repository: repository.name,
      commits7d,
      commits30d,
      contributors: repoStats?.contributors_count || 0,
      stars: repoStats?.stargazers_count || 0,
      forks: repoStats?.forks_count || 0,
      lastCommit: repoStats?.updated_at || new Date().toISOString(),
      releaseCount: releases.length,
      lastRelease: releases.length > 0 ? releases[0].published_at : null,
    };

    return NextResponse.json({
      success: true,
      data: result,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200', // 6 hours cache
      },
    });
  } catch (error) {
    console.error('Error in developer activity route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch developer activity',
        data: null,
      },
      { status: 500 }
    );
  }
}
