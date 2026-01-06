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
// CORS proxies to bypass CORS restrictions for ArXiv API (fallback chain)
// Format: [proxyBaseUrl, isJsonResponse]
const CORS_PROXIES: Array<[string, boolean]> = [
  ['https://corsproxy.io/?', false],
  ['https://api.allorigins.win/get?url=', true], // Returns JSON with contents field
  ['https://api.allorigins.win/raw?url=', false], // Returns raw content
  ['https://api.codetabs.com/v1/proxy?quest=', false],
];

function getArXivUrl(params: string, proxyIndex: number = 0): [string, boolean] {
  const arxivUrl = `${ARXIV_API_BASE}?${params}`;
  // Use CORS proxy in browser environment
  if (typeof window !== 'undefined') {
    const [proxy, isJson] = CORS_PROXIES[proxyIndex] || CORS_PROXIES[0];
    return [`${proxy}${encodeURIComponent(arxivUrl)}`, isJson];
  }
  return [arxivUrl, false];
}

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
  const params = new URLSearchParams({
    search_query: query || 'cat:cs.AI OR cat:cs.LG OR cat:cs.CV OR cat:cs.CL OR cat:cs.NE',
    start: start.toString(),
    max_results: maxResults.toString(),
    sortBy: sortBy,
    sortOrder: sortOrder,
  });

  // Try each CORS proxy in sequence
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const [url, expectsJson] = getArXivUrl(params.toString(), i);
      console.log(`Attempting CORS proxy ${i + 1}/${CORS_PROXIES.length}`);
      
      const response = await axios.get(url, {
        headers: {
          'Accept': expectsJson ? 'application/json' : 'application/atom+xml, text/xml, */*',
        },
        responseType: expectsJson ? 'json' : 'text',
        timeout: 30000, // 30 second timeout
      });

      let xmlData: string;
      
      // Handle JSON-wrapped responses (allorigins.win/get returns JSON)
      if (expectsJson && typeof response.data === 'object') {
        const jsonData = response.data;
        // allorigins.win/get returns { contents: "..." }
        if (jsonData.contents) {
          xmlData = jsonData.contents;
        } else if (jsonData.data) {
          xmlData = jsonData.data;
        } else if (jsonData.response) {
          xmlData = jsonData.response;
        } else {
          throw new Error('Unexpected JSON response format from proxy');
        }
      } else if (typeof response.data === 'string') {
        xmlData = response.data;
        // Check if it's actually JSON that needs parsing
        if (xmlData.trim().startsWith('{')) {
          try {
            const jsonData = JSON.parse(xmlData);
            if (jsonData.contents) {
              xmlData = jsonData.contents;
            } else if (jsonData.data) {
              xmlData = jsonData.data;
            }
          } catch (e) {
            // Not JSON, continue with original data
          }
        }
      } else {
        throw new Error('Unexpected response format from proxy');
      }

      // Check if we got valid XML
      if (xmlData && typeof xmlData === 'string' && xmlData.trim().length > 0) {
        // Check if it looks like XML
        if (xmlData.trim().startsWith('<?xml') || xmlData.trim().startsWith('<feed')) {
          const papers = parseXmlResponse(xmlData);
          if (papers.length > 0) {
            console.log(`Successfully fetched ${papers.length} papers using proxy ${i + 1}`);
            return papers;
          }
        } else {
          console.warn(`Proxy ${i + 1} returned non-XML data, trying next proxy...`);
        }
      }
    } catch (error: any) {
      const errorMsg = error.message || error.toString();
      console.warn(`CORS proxy ${i + 1} failed:`, errorMsg);
      // Continue to next proxy
      if (i < CORS_PROXIES.length - 1) {
        continue;
      }
      // If all proxies failed, log the error
      console.error('All CORS proxies failed. Last error:', errorMsg);
    }
  }

  // If all proxies failed, return empty array
  console.error('Failed to fetch papers from ArXiv: All CORS proxies failed');
  return [];
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

