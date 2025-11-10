import axios from 'axios';
import { parseString } from 'xml2js';

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

const ARXIV_API_BASE = 'http://export.arxiv.org/api/query';

function parseXmlResponse(xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(xml, { explicitArray: false, mergeAttrs: true }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
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

    const parsed = await parseXmlResponse(response.data);
    const entries = parsed.feed?.entry || [];
    
    // Handle single entry case (xml2js doesn't wrap single items in arrays)
    const entryArray = Array.isArray(entries) ? entries : [entries];
    
    const papers: ArXivPaper[] = entryArray.map((entry: any) => {
      const id = entry.id?.split('/').pop() || '';
      const title = (entry.title || '').trim();
      const summary = (entry.summary || '').trim();
      const published = entry.published || '';
      const updated = entry.updated || '';
      
      const authors = Array.isArray(entry.author) 
        ? entry.author.map((a: any) => a.name || '')
        : entry.author 
        ? [entry.author.name || '']
        : [];

      const categories = Array.isArray(entry.category)
        ? entry.category.map((c: any) => c.term || '')
        : entry.category
        ? [entry.category.term || '']
        : [];

      const links = Array.isArray(entry.link)
        ? entry.link.map((l: any) => ({
            href: l.href || '',
            rel: l.rel || '',
            type: l.type || undefined,
          }))
        : entry.link
        ? [{
            href: entry.link.href || '',
            rel: entry.link.rel || '',
            type: entry.link.type || undefined,
          }]
        : [];

      const comment = entry['arxiv:comment']?._ || entry['arxiv:comment'] || undefined;

      return {
        id,
        title,
        authors: authors.filter(Boolean),
        summary,
        published,
        updated,
        categories: categories.filter(Boolean),
        links,
        comment,
      };
    });

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

