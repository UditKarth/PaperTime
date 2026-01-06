'use client';

import { useState, useEffect } from 'react';
import FilterPanel from '@/app/components/FilterPanel';
import SearchBar from '@/app/components/SearchBar';
import RecommendButton from '@/app/components/RecommendButton';
import PaperCard from '@/app/components/PaperCard';
import { useFilterStore } from '@/app/stores/filterStore';
import { ArXivPaper } from '@/app/lib/arxiv';
import { PaperWithScore } from '@/app/lib/recommendation';

export default function Home() {
  const [papers, setPapers] = useState<PaperWithScore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [likedPapers, setLikedPapers] = useState<Set<string>>(new Set());
  const [dislikedPapers, setDislikedPapers] = useState<Set<string>>(new Set());
  const { subjects, paperTypes, booleanQuery } = useFilterStore();

  // Load liked/disliked papers from localStorage
  useEffect(() => {
    const storedLiked = localStorage.getItem('papertime-liked');
    const storedDisliked = localStorage.getItem('papertime-disliked');
    if (storedLiked) {
      setLikedPapers(new Set(JSON.parse(storedLiked)));
    }
    if (storedDisliked) {
      setDislikedPapers(new Set(JSON.parse(storedDisliked)));
    }
  }, []);

  const handleRecommend = async () => {
    setIsLoading(true);
    try {
      const { getRecommendations } = await import('@/app/lib/api-client');
      const data = await getRecommendations(
        Array.from(likedPapers),
        {
          subjects,
          paperTypes,
          booleanQuery,
        },
        10
      );
      if (data.papers) {
        setPapers(data.papers);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (paperId: string) => {
    const newLiked = new Set(likedPapers);
    newLiked.add(paperId);
    setLikedPapers(newLiked);
    localStorage.setItem('papertime-liked', JSON.stringify(Array.from(newLiked)));
    
    // Remove from disliked if present
    const newDisliked = new Set(dislikedPapers);
    newDisliked.delete(paperId);
    setDislikedPapers(newDisliked);
    localStorage.setItem('papertime-disliked', JSON.stringify(Array.from(newDisliked)));
  };

  const handleDislike = (paperId: string) => {
    const newDisliked = new Set(dislikedPapers);
    newDisliked.add(paperId);
    setDislikedPapers(newDisliked);
    localStorage.setItem('papertime-disliked', JSON.stringify(Array.from(newDisliked)));
    
    // Remove from liked if present
    const newLiked = new Set(likedPapers);
    newLiked.delete(paperId);
    setLikedPapers(newLiked);
    localStorage.setItem('papertime-liked', JSON.stringify(Array.from(newLiked)));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Filter Panel Sidebar */}
        <FilterPanel />

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                ML Paper Recommendations
              </h1>
              <p className="text-gray-600 mb-6">
                Discover relevant machine learning papers tailored to your interests
              </p>
              
              {/* Search Bar */}
              <SearchBar onSearch={handleRecommend} />
              
              {/* Recommend Button */}
              <div className="flex justify-center mt-6">
                <RecommendButton
                  onClick={handleRecommend}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Papers Grid */}
            {papers.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {papers.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    onLike={handleLike}
                    onDislike={handleDislike}
                    liked={likedPapers.has(paper.id)}
                    disliked={dislikedPapers.has(paper.id)}
                  />
                ))}
              </div>
            ) : (
              !isLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">
                    Click "Recommend Next" to get started
                  </p>
                  <p className="text-gray-400 text-sm">
                    We'll find papers that match your interests and filters
                  </p>
                </div>
              )
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

