import { ArXivPaper } from './arxiv';

export interface PaperFilters {
  subjects: string[];
  paperTypes: string[];
  booleanQuery: string;
}

export const ML_SUBJECTS = {
  'Machine Learning': ['cs.LG', 'stat.ML'],
  'Computer Vision': ['cs.CV'],
  'Natural Language Processing': ['cs.CL', 'cs.AI'],
  'Reinforcement Learning': ['cs.AI', 'cs.LG'],
  'Neural Networks': ['cs.NE', 'cs.LG'],
  'Information Retrieval': ['cs.IR'],
  'Artificial Intelligence': ['cs.AI'],
  'Robotics': ['cs.RO'],
  'Cryptography': ['cs.CR'],
  'Distributed Systems': ['cs.DC', 'cs.DS'],
};

export const PAPER_TYPES = {
  'Conference': 'conference',
  'Journal': 'journal',
  'Preprint': 'preprint',
  'Workshop': 'workshop',
};

export function matchesSubjectFilter(paper: ArXivPaper, subjects: string[]): boolean {
  if (subjects.length === 0) return true;
  
  const allSubjectCategories = subjects.flatMap(subject => 
    ML_SUBJECTS[subject as keyof typeof ML_SUBJECTS] || []
  );
  
  return paper.categories.some(cat => 
    allSubjectCategories.some(subjectCat => cat.includes(subjectCat))
  );
}

export function matchesPaperTypeFilter(paper: ArXivPaper, paperTypes: string[]): boolean {
  if (paperTypes.length === 0) return true;
  
  // ArXiv papers are typically preprints, but we can infer type from comment field
  // For now, we'll check if comment contains type indicators
  const comment = paper.comment?.toLowerCase() || '';
  
  return paperTypes.some(type => {
    switch (type) {
      case 'conference':
        return comment.includes('conference') || comment.includes('cvpr') || 
               comment.includes('iccv') || comment.includes('neurips') ||
               comment.includes('icml') || comment.includes('acl');
      case 'journal':
        return comment.includes('journal') || comment.includes('ieee') ||
               comment.includes('acm');
      case 'workshop':
        return comment.includes('workshop');
      case 'preprint':
        return true; // Most ArXiv papers are preprints
      default:
        return true;
    }
  });
}

export function matchesBooleanQuery(paper: ArXivPaper, query: string): boolean {
  if (!query || query.trim().length === 0) return true;
  
  const searchText = `${paper.title} ${paper.summary} ${paper.authors.join(' ')}`.toLowerCase();
  const queryLower = query.toLowerCase().trim();
  
  // Simple boolean query parsing
  // Support: AND, OR, NOT operators
  // Example: "transformer AND attention OR bert"
  // Also supports simple queries: "transformer" matches if word is found
  
  // Check if query contains boolean operators
  const hasOperators = /\s+(AND|OR|NOT)\s+/i.test(queryLower);
  
  if (!hasOperators) {
    // Simple query - check if any word matches
    const words = queryLower.split(/\s+/).filter(w => w.length > 0);
    return words.some(word => searchText.includes(word));
  }
  
  // Split by OR first (lowest precedence)
  const orParts = queryLower.split(/\s+OR\s+/);
  
  for (const orPart of orParts) {
    // Check if this OR part matches
    const andParts = orPart.split(/\s+AND\s+/);
    let andMatches = true;
    
    for (const andPart of andParts) {
      const trimmed = andPart.trim();
      
      // Check for NOT
      if (trimmed.startsWith('not ')) {
        const term = trimmed.substring(4).trim();
        if (term && searchText.includes(term)) {
          andMatches = false;
          break;
        }
      } else {
        // Regular term - check if word is in search text
        const term = trimmed;
        if (term && !searchText.includes(term)) {
          andMatches = false;
          break;
        }
      }
    }
    
    if (andMatches) {
      return true; // At least one OR part matches
    }
  }
  
  return false;
}

export function applyFilters(papers: ArXivPaper[], filters: PaperFilters): ArXivPaper[] {
  return papers.filter(paper => {
    return (
      matchesSubjectFilter(paper, filters.subjects) &&
      matchesPaperTypeFilter(paper, filters.paperTypes) &&
      matchesBooleanQuery(paper, filters.booleanQuery)
    );
  });
}

