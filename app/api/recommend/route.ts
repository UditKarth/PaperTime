import { NextRequest, NextResponse } from 'next/server';
import { fetchRecentMLPapers } from '@/app/lib/arxiv';
import { recommendPapers } from '@/app/lib/recommendation';
import { applyFilters, PaperFilters } from '@/app/lib/filters';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      likedPaperIds = [],
      filters = {
        subjects: [],
        paperTypes: [],
        booleanQuery: '',
      },
      maxResults = 50,
    } = body;

    // Fetch papers from ArXiv
    const allPapers = await fetchRecentMLPapers(200); // Fetch more to have a good pool

    // Apply filters
    const filteredPapers = applyFilters(allPapers, filters as PaperFilters);

    if (filteredPapers.length === 0) {
      return NextResponse.json({
        papers: [],
        message: 'No papers match the current filters',
      });
    }

    // Get recommendations
    const recommendations = recommendPapers(
      filteredPapers,
      likedPaperIds,
      Math.min(maxResults, filteredPapers.length)
    );

    return NextResponse.json({ papers: recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

