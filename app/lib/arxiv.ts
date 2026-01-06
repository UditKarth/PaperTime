import axios from 'axios';

export interface ArXivPaper {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  published: string;
  updated: string;
  categories: string[];
  links: Array<{ href: string; rel: string; type?: string }>;
  comment?: string;
}

const ARXIV_API_BASE = 'https://export.arxiv.org/api/query';

function parseXmlResponse(xml: string): ArXivPaper[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Failed to parse XML response');
  }
  
  const entries = xmlDoc.querySelectorAll('entry');
  const papers: ArXivPaper[] = [];
  
  entries.forEach((entry) => {
    const idElement = entry.querySelector('id');
    const id = idElement?.textContent?.split('/').pop() || '';
    
    const titleElement = entry.querySelector('title');
    const title = (titleElement?.textContent || '').trim();
    
    const summaryElement = entry.querySelector('summary');
    const summary = (summaryElement?.textContent || '').trim();
    
    const publishedElement = entry.querySelector('published');
    const published = publishedElement?.textContent || '';
    
    const updatedElement = entry.querySelector('updated');
    const updated = updatedElement?.textContent || '';
    
    const authors: string[] = [];
    entry.querySelectorAll('author').forEach((author) => {
      const name = author.querySelector('name')?.textContent;
      if (name) authors.push(name);
    });
    
    const categories: string[] = [];
    entry.querySelectorAll('category').forEach((category) => {
      const term = category.getAttribute('term');
      if (term) categories.push(term);
    });
    
    const links: Array<{ href: string; rel: string; type?: string }> = [];
    entry.querySelectorAll('link').forEach((link) => {
      links.push({
        href: link.getAttribute('href') || '',
        rel: link.getAttribute('rel') || '',
        type: link.getAttribute('type') || undefined,
      });
    });
    
    const commentElement = entry.querySelector('arxiv\\:comment, comment');
    const comment = commentElement?.textContent || undefined;
    
    papers.push({
      id,
      title,
      authors,
      summary,
      published,
      updated,
      categories,
      links,
      comment,
    });
  });
  
  return papers;
}

export async function searchArXiv(
  query: string = '',
  start: number = 0,
  maxResults: number = 50,
  sortBy: 'relevance' | 'lastUpdatedDate' | 'submittedDate' = 'submittedDate',
  sortOrder: 'ascending' | 'descending' = 'descending'
): Promise<ArXivPaper[]> {
  try {
    const params = new URLSearchParams({
      search_query: query || 'cat:cs.AI OR cat:cs.LG OR cat:cs.CV OR cat:cs.CL OR cat:cs.NE',
      start: start.toString(),
      max_results: maxResults.toString(),
      sortBy: sortBy,
      sortOrder: sortOrder,
    });

    const response = await axios.get(`${ARXIV_API_BASE}?${params.toString()}`, {
      headers: {
        'Accept': 'application/atom+xml',
      },
      responseType: 'text',
    });

    const papers = parseXmlResponse(response.data);
    return papers;
  } catch (error) {
    console.error('Error fetching from ArXiv:', error);
    return [];
  }
}

export async function fetchRecentMLPapers(maxResults: number = 100): Promise<ArXivPaper[]> {
  const query = 'cat:cs.AI OR cat:cs.LG OR cat:cs.CV OR cat:cs.CL OR cat:cs.NE OR cat:cs.IR';
  return searchArXiv(query, 0, maxResults, 'submittedDate', 'descending');
}

export function getPaperUrl(paperId: string): string {
  return `https://arxiv.org/abs/${paperId}`;
}

export function getPdfUrl(paperId: string): string {
  return `https://arxiv.org/pdf/${paperId}.pdf`;
}

