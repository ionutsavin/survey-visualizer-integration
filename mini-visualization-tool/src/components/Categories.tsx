import { useEffect, useRef, useState, useCallback } from "react";
import type { Category } from "../types";
import "../styles/categories.css";

interface CategoriesProps {
  categories: Category[];
  loading: boolean;
  onChange?: (ids: number[]) => void;
}

export default function Categories({ categories, loading, onChange }: CategoriesProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (e.target instanceof Node && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSelected = selected.length === categories.length && categories.length > 0;

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelected([]);
      onChange?.([]);
    } else {
      const allIds = categories.map((c) => c.id);
      setSelected(allIds);
      onChange?.(allIds);
    }
  }, [allSelected, categories, onChange]);

  const toggleCategory = useCallback((id: number) => {
    setSelected((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);

  const getSelectedNames = () => {
    if (loading) return "Loading...";
    if (allSelected) return "All Categories";
    if (selected.length === 0) return "Select Categories";
    if (selected.length === 1) {
      const one = categories.find((c) => c.id === selected[0]);
      return one?.name || "Select Categories";
    }
    return `${selected.length} selected`;
  };

  return (
    <div className="categories-root" ref={rootRef}>
      <button
        type="button"
        className="categories-button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
      >
        <span>{getSelectedNames()}</span>
        <svg
          className="chevron-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 9l6 6 6-6"
          />
        </svg>
      </button>

      {open && (
        <div className="categories-dropdown">
          <div className="search-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <hr className="divider" />
          <div className="category-item" onClick={toggleSelectAll}>
            <input
              type="checkbox"
              readOnly
              checked={allSelected}
              className="category-checkbox round-checkbox"
            />
            <span className="category-label">All Categories</span>
          </div>
          <hr className="divider" />
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <label key={category.id} className="category-item">
                <input
                  type="checkbox"
                  checked={selected.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="category-checkbox"
                />
                <span className="category-label">{category.name}</span>
              </label>
            ))
          ) : (
            <div className="no-results">No categories found</div>
          )}
        </div>
      )}
    </div>
  );
}