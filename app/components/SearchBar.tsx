'use client';

import { useFilterStore } from '@/app/stores/filterStore';

interface SearchBarProps {
  onSearch?: () => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const { booleanQuery, setBooleanQuery } = useFilterStore();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="relative">
        <input
          type="text"
          value={booleanQuery}
          onChange={(e) => setBooleanQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search papers (e.g., transformer AND attention OR bert)"
          className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm placeholder:text-gray-400"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
        <span>Examples:</span>
        <button
          onClick={() => setBooleanQuery('transformer AND attention')}
          className="hover:text-blue-600 underline"
        >
          transformer AND attention
        </button>
        <button
          onClick={() => setBooleanQuery('bert OR gpt')}
          className="hover:text-blue-600 underline"
        >
          bert OR gpt
        </button>
        <button
          onClick={() => setBooleanQuery('neural NOT network')}
          className="hover:text-blue-600 underline"
        >
          neural NOT network
        </button>
      </div>
    </div>
  );
}

