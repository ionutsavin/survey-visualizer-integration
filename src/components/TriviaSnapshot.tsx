import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "../constants/theme";
import { useFilteredQuestions } from "../hooks/useFilteredQuestions";
import type { Question, Category } from "../types";
import "../styles/snapshot.css";

interface TriviaSnapshotProps {
  questions: Question[];
  categories: Category[];
  selectedCategoryIds: number[];
  loading: boolean;
}

export default function TriviaSnapshot({ questions, categories, selectedCategoryIds, loading }: TriviaSnapshotProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
  const filteredQuestions = useFilteredQuestions(questions, categories, selectedCategoryIds);

  const categoryData = useMemo(() => {
    if (filteredQuestions.length === 0) return [];

    const categoryCounts = new Map<string, number>();
    
    filteredQuestions.forEach((q) => {
      const categoryName = q.category;
      categoryCounts.set(categoryName, (categoryCounts.get(categoryName) || 0) + 1);
    });

    const categoryArray = Array.from(categoryCounts.entries())
      .map(([name, count], index) => ({
        name,
        count,
        percentage: 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));

    const total = categoryArray.reduce((sum, category) => sum + category.count, 0);

    categoryArray.forEach((category) => {
      category.percentage = total > 0 ? Math.round((category.count / total) * 100) : 0;
    });

    return categoryArray;
  }, [filteredQuestions]);

  const renderCustomLabel = () => {
    return null;
  };

  return (
    <div className="snapshot-container">
      <h2 className="snapshot-title">Overall Trivia Snapshot</h2>
      {loading ? (
        <div className="snapshot-loading">
          <div className="loading-spinner"></div>
          <p>Loading chart data...</p>
        </div>
      ) : selectedCategoryIds.length === 0 ? (
        <div className="snapshot-empty">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="empty-text">No categories selected</p>
          <p className="empty-subtext">Select categories from the dropdown to view the distribution</p>
        </div>
      ) : (
        <div className="snapshot-content">
          <div className="chart-section">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                  label={renderCustomLabel}
                  onMouseEnter={(_, index) => setHoveredCategory(categoryData[index]?.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      opacity={hoveredCategory && hoveredCategory !== entry.name ? 0.5 : 1}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {hoveredCategory && (
              <div className="chart-tooltip">
                {hoveredCategory}
                <br />
                <span className="tooltip-count">
                  {categoryData.find((category) => category.name === hoveredCategory)?.count.toLocaleString()} questions (
                  {categoryData.find((category) => category.name === hoveredCategory)?.percentage}%)
                </span>
              </div>
            )}
          </div>
          <div className="legend-section">
            <h3 className="legend-title">Distribution of Questions by Category</h3>
            <div className="legend-items">
              {categoryData.map((category) => (
                <div
                  key={category.name}
                  className={`legend-item ${hoveredCategory === category.name ? "hovered" : ""}`}
                  onMouseEnter={() => setHoveredCategory(category.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="legend-color" style={{ backgroundColor: category.color }}></div>
                  <span className="legend-name">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}