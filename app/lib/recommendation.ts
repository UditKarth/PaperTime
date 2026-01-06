import { TFIDF } from './tfidf';
import { ArXivPaper } from './arxiv';

export interface PaperWithScore extends ArXivPaper {
  relevanceScore: number;
  similarityScore: number;
  recencyScore: number;
  foundationalScore: number;
}

export function computeTFIDFVectors(papers: ArXivPaper[]): Map<string, number[]> {
  const tfidf = new TFIDF();
  const vectors = new Map<string, number[]>();
  
  // Add all documents to TF-IDF
  papers.forEach(paper => {
    const text = `${paper.title} ${paper.summary}`;
    tfidf.addDocument(text);
  });
  
  // Build TF-IDF model
  tfidf.build();
  
  // Get all terms
  const allTerms = tfidf.getAllTerms();
  
  // Compute TF-IDF vector for each paper
  papers.forEach((paper, index) => {
    const vector: number[] = [];
    allTerms.forEach(term => {
      const score = tfidf.tfidf(term, index);
      vector.push(score);
    });
    vectors.set(paper.id, vector);
  });
  
  return vectors;
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function computeRecencyScore(paper: ArXivPaper): number {
  const publishedDate = new Date(paper.published);
  const now = new Date();
  const daysSincePublished = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Papers published in last 30 days get highest score
  if (daysSincePublished <= 30) return 1.0;
  // Papers published in last 90 days get good score
  if (daysSincePublished <= 90) return 0.7;
  // Papers published in last year get moderate score
  if (daysSincePublished <= 365) return 0.4;
  // Older papers get lower score
  return 0.1;
}

function computeFoundationalScore(paper: ArXivPaper): number {
  const publishedDate = new Date(paper.published);
  const cutoffDate = new Date('2020-01-01');
  
  // Older papers (pre-2020) are considered foundational
  if (publishedDate < cutoffDate) {
    // Check for foundational keywords
    const text = `${paper.title} ${paper.summary}`.toLowerCase();
    const foundationalKeywords = [
      'foundation', 'fundamental', 'seminal', 'pioneer', 'breakthrough',
      'transformer', 'attention', 'resnet', 'bert', 'gpt', 'gan'
    ];
    
    const hasKeywords = foundationalKeywords.some(kw => text.includes(kw));
    return hasKeywords ? 1.0 : 0.5;
  }
  
  return 0.0;
}

export function recommendPapers(
  papers: ArXivPaper[],
  likedPaperIds: string[] = [],
  topN: number = 10
): PaperWithScore[] {
  if (papers.length === 0) return [];
  
  // Compute TF-IDF vectors
  const vectors = computeTFIDFVectors(papers);
  
  // If user has liked papers, compute similarity to those
  // Otherwise, use a general ranking
  const scoredPapers: PaperWithScore[] = papers.map(paper => {
    let similarityScore = 0.5; // Default similarity
    
    if (likedPaperIds.length > 0) {
      // Compute average similarity to liked papers
      const paperVector = vectors.get(paper.id) || [];
      let totalSimilarity = 0;
      let count = 0;
      
      likedPaperIds.forEach(likedId => {
        const likedVector = vectors.get(likedId);
        if (likedVector && paperVector.length > 0) {
          const similarity = cosineSimilarity(paperVector, likedVector);
          totalSimilarity += similarity;
          count++;
        }
      });
      
      if (count > 0) {
        similarityScore = totalSimilarity / count;
      }
    } else {
      // For new users, prefer papers with high TF-IDF scores (important terms)
      const paperVector = vectors.get(paper.id) || [];
      const vectorNorm = Math.sqrt(paperVector.reduce((sum, val) => sum + val * val, 0));
      similarityScore = Math.min(1.0, vectorNorm / 10); // Normalize
    }
    
    const recencyScore = computeRecencyScore(paper);
    const foundationalScore = computeFoundationalScore(paper);
    
    // Combined relevance score
    // Weights: similarity (0.5), recency (0.3), foundational (0.2)
    const relevanceScore = 
      similarityScore * 0.5 + 
      recencyScore * 0.3 + 
      foundationalScore * 0.2;
    
    return {
      ...paper,
      relevanceScore,
      similarityScore,
      recencyScore,
      foundationalScore,
    };
  });
  
  // Sort by relevance score and return top N
  return scoredPapers
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topN);
}

