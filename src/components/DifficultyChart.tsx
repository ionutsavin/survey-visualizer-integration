import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DIFFICULTY_COLORS } from "../constants/theme";
import { useFilteredQuestions } from "../hooks/useFilteredQuestions";
import type { Question, Category } from "../types";
import "../styles/difficulty.css";

interface DifficultyChartProps {
  questions: Question[];
  categories: Category[];
  selectedCategoryIds: number[];
  loading: boolean;
}

export default function DifficultyChart({ questions, categories, selectedCategoryIds, loading }: DifficultyChartProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const difficultyOrder = ["easy", "medium", "hard"];
  const filteredQuestions = useFilteredQuestions(questions, categories, selectedCategoryIds);

  const difficultyData = useMemo(() => {
    if (filteredQuestions.length === 0) return [];

    const difficultyCounts: { [key: string]: number } = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    filteredQuestions.forEach((q) => {
      const diff = q.difficulty.toLowerCase();
      if (diff in difficultyCounts) {
        difficultyCounts[diff]++;
      }
    });

    return difficultyOrder.map((diff) => ({
      difficulty: diff.charAt(0).toUpperCase() + diff.slice(1),
      count: difficultyCounts[diff],
      color: DIFFICULTY_COLORS[diff as keyof typeof DIFFICULTY_COLORS],
    }));
  }, [filteredQuestions]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="difficulty-tooltip">
          <p className="tooltip-label">{payload[0].payload.difficulty}</p>
          <p className="tooltip-value">{payload[0].value.toLocaleString()} questions</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="difficulty-container">
      <h2 className="difficulty-title">Distribution of Questions by Difficulty</h2>
      {loading ? (
        <div className="difficulty-loading">
          <div className="loading-spinner"></div>
          <p>Loading chart data...</p>
        </div>
      ) : selectedCategoryIds.length === 0 ? (
        <div className="difficulty-empty">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="empty-text">No categories selected</p>
          <p className="empty-subtext">Select categories to view difficulty distribution</p>
        </div>
      ) : (
        <>
          <div className="difficulty-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3d3d3d" vertical={false} />
                <XAxis 
                  dataKey="difficulty" 
                  stroke="#888"
                  tick={{ fill: '#e0e0e0', fontSize: 14 }}
                  axisLine={{ stroke: '#3d3d3d' }}
                />
                <YAxis 
                  stroke="#888"
                  tick={{ fill: '#e0e0e0', fontSize: 12 }}
                  axisLine={{ stroke: '#3d3d3d' }}
                  domain={[0, 'auto']}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar 
                  dataKey="count" 
                  radius={[8, 8, 0, 0]}
                  onMouseEnter={(data: any) => setHoveredBar(data.difficulty)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {difficultyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      opacity={hoveredBar && hoveredBar !== entry.difficulty ? 0.5 : 1}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="difficulty-legend">
            {difficultyData.map((item) => (
              <div
                key={item.difficulty}
                className={`difficulty-legend-item ${hoveredBar === item.difficulty ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredBar(item.difficulty)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                <span className="legend-name">
                  {item.difficulty}: {item.count.toLocaleString()} questions
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}