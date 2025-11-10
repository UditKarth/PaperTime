'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FilterState {
  subjects: string[];
  paperTypes: string[];
  booleanQuery: string;
  setSubjects: (subjects: string[]) => void;
  setPaperTypes: (paperTypes: string[]) => void;
  setBooleanQuery: (query: string) => void;
  toggleSubject: (subject: string) => void;
  togglePaperType: (paperType: string) => void;
  resetFilters: () => void;
}

const initialState = {
  subjects: [],
  paperTypes: [],
  booleanQuery: '',
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...initialState,
      setSubjects: (subjects) => set({ subjects }),
      setPaperTypes: (paperTypes) => set({ paperTypes }),
      setBooleanQuery: (booleanQuery) => set({ booleanQuery }),
      toggleSubject: (subject) =>
        set((state) => ({
          subjects: state.subjects.includes(subject)
            ? state.subjects.filter((s) => s !== subject)
            : [...state.subjects, subject],
        })),
      togglePaperType: (paperType) =>
        set((state) => ({
          paperTypes: state.paperTypes.includes(paperType)
            ? state.paperTypes.filter((p) => p !== paperType)
            : [...state.paperTypes, paperType],
        })),
      resetFilters: () => set(initialState),
    }),
    {
      name: 'papertime-filters',
    }
  )
);

