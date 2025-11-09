import { useEffect, useState } from "react";
import Categories from "./components/Categories";
import DifficultyChart from "./components/DifficultyChart";
import TriviaSnapshot from "./components/TriviaSnapshot";
import type { Question, Category } from "./types";
import { decodeHtmlEntities } from "./utils/helpers";

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = "https://opentdb.com/api.php?amount=50";
    setLoading(true);
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !Array.isArray(data.results)) return;

        const decodedQuestions = data.results.map((q: any) => ({
          ...q,
          category: decodeHtmlEntities(String(q.category)),
          difficulty: String(q.difficulty)
        }));
        setQuestions(decodedQuestions);

        const uniqueCategories: Category[] = Array.from<string>(
          new Set(decodedQuestions.map((q: Question) => q.category))
        ).map((name: string, index: number) => ({
          id: index + 1,
          name,
        }));
        setCategories(uniqueCategories);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load trivia data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app-container">
      <h1 className="app-title">Trivia Data Insights</h1>
      
      <div className="main-layout">
        <aside className="sidebar">
          <Categories 
            categories={categories}
            loading={loading}
            onChange={setSelectedIds}
          />
        </aside>
        
        <main className="content">
          <div className="top-section">
            <TriviaSnapshot 
              questions={questions}
              categories={categories}
              selectedCategoryIds={selectedIds}
              loading={loading}
            />
          </div>
          
          <div className="bottom-section">
            <DifficultyChart
              questions={questions}
              categories={categories}
              selectedCategoryIds={selectedIds}
              loading={loading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;