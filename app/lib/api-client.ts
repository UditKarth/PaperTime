import { fetchRecentMLPapers, searchArXiv } from './arxiv';
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
    let allPapers;
    
    // If there's a search query, use it to search ArXiv directly
    // Otherwise, fetch recent ML papers
    if (filters.booleanQuery && filters.booleanQuery.trim().length > 0) {
      // Convert boolean query to ArXiv search format
      // Simple conversion: split by AND/OR and create ArXiv query
      const arxivQuery = convertBooleanQueryToArXiv(filters.booleanQuery, filters.subjects);
      console.log('Searching ArXiv with query:', arxivQuery);
      allPapers = await searchArXiv(arxivQuery, 0, 200, 'submittedDate', 'descending');
    } else {
      // Build ArXiv query from subject filters if any
      const arxivQuery = buildArXivQueryFromSubjects(filters.subjects);
      console.log('Fetching recent ML papers with query:', arxivQuery);
      allPapers = await searchArXiv(arxivQuery, 0, 200, 'submittedDate', 'descending');
    }

    // Apply remaining filters (paper types only, since boolean query was already used in ArXiv search)
    // If boolean query was used, don't apply it again as a filter
    const filtersToApply: PaperFilters = {
      subjects: filters.subjects,
      paperTypes: filters.paperTypes,
      booleanQuery: filters.booleanQuery && filters.booleanQuery.trim().length > 0 ? '' : filters.booleanQuery,
    };
    
    console.log(`Fetched ${allPapers.length} papers, applying filters...`);
    const filteredPapers = applyFilters(allPapers, filtersToApply);
    console.log(`After filtering: ${filteredPapers.length} papers`);

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

// Convert boolean query to ArXiv search format
function convertBooleanQueryToArXiv(booleanQuery: string, subjects: string[]): string {
  // Build subject filter query
  const subjectQuery = buildArXivQueryFromSubjects(subjects);
  
  // Convert user's boolean query to ArXiv format
  // ArXiv uses: all:term for text search, AND, OR, ANDNOT
  // For simple text searches, we use all: prefix
  let arxivQuery = booleanQuery.trim();
  
  // Check if it contains boolean operators
  const hasOperators = /\s+(AND|OR|NOT)\s+/i.test(arxivQuery);
  
  if (!hasOperators) {
    // Simple text search - use all: prefix for each word
    const words = arxivQuery.split(/\s+/).filter(w => w.length > 0);
    arxivQuery = words.map(w => `all:${w}`).join(' AND ');
  } else {
    // Has boolean operators - convert to ArXiv format
    arxivQuery = arxivQuery
      .replace(/\s+AND\s+/gi, ' AND ')
      .replace(/\s+OR\s+/gi, ' OR ')
      .replace(/\s+NOT\s+/gi, ' ANDNOT ')
      // Add all: prefix to terms that don't have a prefix
      .replace(/(^|\s)([a-zA-Z][a-zA-Z0-9]*)(\s|$)/g, (match, before, term, after) => {
        // Don't add all: if it's already a prefixed term or operator
        if (['AND', 'OR', 'ANDNOT', 'cat:', 'all:', 'ti:', 'au:', 'abs:'].includes(term.toUpperCase())) {
          return match;
        }
        return `${before}all:${term}${after}`;
      });
  }
  
  // Combine with subject filters
  if (subjectQuery && arxivQuery) {
    return `(${subjectQuery}) AND (${arxivQuery})`;
  } else if (subjectQuery) {
    return subjectQuery;
  } else if (arxivQuery) {
    return arxivQuery;
  }
  
  // Default: ML categories
  return 'cat:cs.AI OR cat:cs.LG OR cat:cs.CV OR cat:cs.CL OR cat:cs.NE OR cat:cs.IR';
}

// Build ArXiv query from subject filters
function buildArXivQueryFromSubjects(subjects: string[]): string {
  if (subjects.length === 0) {
    return 'cat:cs.AI OR cat:cs.LG OR cat:cs.CV OR cat:cs.CL OR cat:cs.NE OR cat:cs.IR';
  }
  
  const { ML_SUBJECTS } = require('./filters');
  const categories: string[] = [];
  
  subjects.forEach(subject => {
    const subjectCats = ML_SUBJECTS[subject as keyof typeof ML_SUBJECTS];
    if (subjectCats) {
      categories.push(...subjectCats);
    }
  });
  
  if (categories.length === 0) {
    return 'cat:cs.AI OR cat:cs.LG OR cat:cs.CV OR cat:cs.CL OR cat:cs.NE OR cat:cs.IR';
  }
  
  // Remove duplicates and format as ArXiv query
  const uniqueCats = [...new Set(categories)];
  return uniqueCats.map(cat => `cat:${cat}`).join(' OR ');
}

