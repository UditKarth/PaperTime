import { fetchRecentMLPapers } from './arxiv';
import { recommendPapers } from './recommendation';
import { applyFilters, PaperFilters } from './filters';

export async function getRecommendations(
  likedPaperIds: string[] = [],
  filters: PaperFilters = {
    subjects: [],
    paperTypes: [],
    booleanQuery: '',
  },
  maxResults: number = 10
) {
  try {
    // Fetch papers from ArXiv
    const allPapers = await fetchRecentMLPapers(200); // Fetch more to have a good pool

    // Apply filters
    const filteredPapers = applyFilters(allPapers, filters);

    if (filteredPapers.length === 0) {
      return {
        papers: [],
        message: 'No papers match the current filters',
      };
    }

    // Get recommendations
    const recommendations = recommendPapers(
      filteredPapers,
      likedPaperIds,
      Math.min(maxResults, filteredPapers.length)
    );

    return { papers: recommendations };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new Error('Failed to generate recommendations');
  }
}

