import { NextRequest, NextResponse } from 'next/server';
import { fetchRecentMLPapers, searchArXiv } from '@/app/lib/arxiv';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const start = parseInt(searchParams.get('start') || '0');
    const maxResults = parseInt(searchParams.get('maxResults') || '50');

    let papers;
    if (query) {
      papers = await searchArXiv(query, start, maxResults);
    } else {
      papers = await fetchRecentMLPapers(maxResults);
    }

    return NextResponse.json({ papers });
  } catch (error) {
    console.error('Error fetching papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    );
  }
}

