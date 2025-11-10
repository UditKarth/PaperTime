export function extractKeyPoints(abstract: string, maxPoints: number = 5): string[] {
  if (!abstract || abstract.trim().length === 0) {
    return [];
  }

  // Split abstract into sentences
  const sentences = abstract
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20); // Filter out very short fragments

  if (sentences.length === 0) {
    return [];
  }

  // Score sentences based on:
  // 1. Length (prefer medium-length sentences)
  // 2. Keyword density (ML/AI terms)
  // 3. Position (earlier sentences often more important)
  const mlKeywords = [
    'model', 'learning', 'neural', 'network', 'algorithm', 'method', 'approach',
    'deep', 'training', 'data', 'performance', 'accuracy', 'evaluation', 'experiment',
    'propose', 'present', 'introduce', 'novel', 'framework', 'architecture'
  ];

  const scoredSentences = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    
    // Length score: prefer sentences between 15-30 words
    let lengthScore = 1;
    if (wordCount >= 15 && wordCount <= 30) {
      lengthScore = 1.5;
    } else if (wordCount < 10 || wordCount > 40) {
      lengthScore = 0.5;
    }

    // Keyword density score
    const keywordMatches = mlKeywords.filter(kw => 
      words.some(w => w.includes(kw))
    ).length;
    const keywordScore = 1 + (keywordMatches / mlKeywords.length) * 2;

    // Position score: earlier sentences are more important
    const positionScore = 1 + (1 - index / sentences.length) * 0.5;

    return {
      sentence,
      score: lengthScore * keywordScore * positionScore,
      index,
    };
  });

  // Sort by score and take top N
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPoints)
    .sort((a, b) => a.index - b.index) // Restore original order
    .map(item => item.sentence);

  return topSentences;
}

