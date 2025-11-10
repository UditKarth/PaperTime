'use client';

import { ArXivPaper } from '@/app/lib/arxiv';
import { extractKeyPoints } from '@/app/lib/summarization';
import { PaperWithScore } from '@/app/lib/recommendation';

interface PaperCardProps {
  paper: ArXivPaper | PaperWithScore;
  onLike?: (paperId: string) => void;
  onDislike?: (paperId: string) => void;
  liked?: boolean;
  disliked?: boolean;
}

function hasCodeAvailable(paper: ArXivPaper): boolean {
  const comment = paper.comment?.toLowerCase() || '';
  const summary = paper.summary.toLowerCase();
  
  const codeIndicators = [
    'code:',
    'github.com',
    'code available',
    'code is available',
    'source code',
    'implementation',
    'https://github',
    'github.io',
  ];
  
  return codeIndicators.some(indicator => 
    comment.includes(indicator) || summary.includes(indicator)
  );
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
}

function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return 'Unknown';
  if (authors.length <= 3) return authors.join(', ');
  return `${authors.slice(0, 2).join(', ')}, et al.`;
}

export default function PaperCard({ paper, onLike, onDislike, liked, disliked }: PaperCardProps) {
  const keyPoints = extractKeyPoints(paper.summary, 5);
  const codeAvailable = hasCodeAvailable(paper);
  const hasScore = 'relevanceScore' in paper;
  const score = hasScore ? (paper as PaperWithScore).relevanceScore : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            <a
              href={`https://arxiv.org/abs/${paper.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              {paper.title}
            </a>
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {formatAuthors(paper.authors)}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {onLike && (
            <button
              onClick={() => onLike(paper.id)}
              className={`p-2 rounded-full transition-colors ${
                liked
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'
              }`}
              aria-label="Like paper"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {onDislike && (
            <button
              onClick={() => onDislike(paper.id)}
              className={`p-2 rounded-full transition-colors ${
                disliked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600'
              }`}
              aria-label="Dislike paper"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
        <span className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(paper.published)}</span>
        </span>
        {score !== null && (
          <span className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>{(score * 100).toFixed(0)}% match</span>
          </span>
        )}
        {codeAvailable && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Code Available
          </span>
        )}
      </div>

      {/* Subject Tags */}
      {paper.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {paper.categories.slice(0, 3).map((category) => (
            <span
              key={category}
              className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded"
            >
              {category}
            </span>
          ))}
          {paper.categories.length > 3 && (
            <span className="px-2 py-1 text-xs font-medium text-gray-500">
              +{paper.categories.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Points:</h4>
          <ul className="space-y-1">
            {keyPoints.map((point, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Links */}
      <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
        <a
          href={`https://arxiv.org/abs/${paper.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          View Paper
        </a>
        <a
          href={`https://arxiv.org/pdf/${paper.id}.pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}

