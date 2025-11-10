'use client';

import { useFilterStore } from '@/app/stores/filterStore';
import { ML_SUBJECTS, PAPER_TYPES } from '@/app/lib/filters';

export default function FilterPanel() {
  const {
    subjects,
    paperTypes,
    booleanQuery,
    toggleSubject,
    togglePaperType,
    setBooleanQuery,
    resetFilters,
  } = useFilterStore();

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 h-screen overflow-y-auto fixed left-0 top-0">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Reset all
        </button>
      </div>

      {/* Hierarchical Subject Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Subjects</h3>
        <div className="space-y-2">
          {Object.keys(ML_SUBJECTS).map((subject) => (
            <label
              key={subject}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={subjects.includes(subject)}
                onChange={() => toggleSubject(subject)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {subject}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Paper Type Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Paper Type</h3>
        <div className="space-y-2">
          {Object.keys(PAPER_TYPES).map((type) => (
            <label
              key={type}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={paperTypes.includes(PAPER_TYPES[type as keyof typeof PAPER_TYPES])}
                onChange={() => togglePaperType(PAPER_TYPES[type as keyof typeof PAPER_TYPES])}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Boolean Search */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Search</h3>
        <input
          type="text"
          value={booleanQuery}
          onChange={(e) => setBooleanQuery(e.target.value)}
          placeholder="e.g., transformer AND attention"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-2">
          Use AND, OR, NOT operators
        </p>
      </div>
    </div>
  );
}

