export type Question = {
  category: string;
  difficulty: string;
  [key: string]: any;
};

export type Category = {
  id: number;
  name: string;
};

export type CategoryData = {
  name: string;
  count: number;
  percentage: number;
  color: string;
};

export type DifficultyData = {
  difficulty: string;
  count: number;
  color: string;
};