import { useMemo } from 'react';
import type { Question, Category } from '../types';

export function useFilteredQuestions(
  questions: Question[],
  categories: Category[],
  selectedCategoryIds: number[]
) {
  return useMemo(() => {
    if (selectedCategoryIds.length === 0) {
      return questions;
    }

    const selectedNames = categories
      .filter((cat) => selectedCategoryIds.includes(cat.id))
      .map((cat) => cat.name);

    return questions.filter((q) => selectedNames.includes(q.category));
  }, [questions, categories, selectedCategoryIds]);
}