"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getAutocompleteSections,
  highlightText,
  searchPromptLibrary,
  type PromptSearchResult,
} from "@/lib/promptSearch";

interface SmartAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (template: PromptSearchResult) => void;
  placeholder?: string;
}

const STORAGE_KEY = "prompt-ux-recent-searches";

export function SmartAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Try: create a launch plan for an AI startup...",
}: SmartAutocompleteProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [suggestions, setSuggestions] = useState<PromptSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentTemplateIds, setRecentTemplateIds] = useState<string[]>([]);
  const [sections, setSections] = useState<{
    recentSearches: string[];
    mostUsedPrompts: PromptSearchResult[];
    trendingPrompts: PromptSearchResult[];
    recommendedPrompts: PromptSearchResult[];
  } | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch {
      // Ignore storage errors and fall back to defaults.
    }
  }, []);

  useEffect(() => {
    setSections(getAutocompleteSections(recentTemplateIds));
  }, [recentTemplateIds]);

  useEffect(() => {
    if (!value.trim() || value.trim().length < 2) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const hits = searchPromptLibrary(value.trim(), 8, recentTemplateIds);
    setSuggestions(hits);
    setActiveIndex(-1);
  }, [value, recentTemplateIds]);

  function storeRecentSearch(text: string) {
    const cleaned = text.trim();
    if (!cleaned) return;

    setRecentSearches((prev) => {
      const next = [cleaned, ...prev.filter((item) => item !== cleaned)].slice(0, 7);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function handleSelect(template: PromptSearchResult) {
    onChange(template.starterPrompt);
    onSelect(template);
    setRecentTemplateIds((prev) => [template.id, ...prev.filter((id) => id !== template.id)].slice(0, 8));
    storeRecentSearch(template.title);
    setShowDropdown(false);
    setActiveIndex(-1);
  }

  function handleChipSelect(text: string) {
    onChange(text);
    storeRecentSearch(text);
    setShowDropdown(false);
    setActiveIndex(-1);
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!showDropdown) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const list = value.trim().length >= 2 ? suggestions : [];
      if (list.length === 0) return;
      setActiveIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const list = value.trim().length >= 2 ? suggestions : [];
      if (list.length === 0) return;
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const list = value.trim().length >= 2 ? suggestions : [];
      if (activeIndex >= 0 && list[activeIndex]) {
        handleSelect(list[activeIndex]);
      }
    }

    if (event.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  }

  const listItems = useMemo(() => {
    if (value.trim().length >= 2) {
      return suggestions;
    }

    return [];
  }, [suggestions, value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur}>
      <label htmlFor="idea" className="mb-3 block text-sm font-medium text-slate-300">
        Your Idea
      </label>
      <div className="relative">
        <textarea
          id="idea"
          rows={5}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-4 text-base text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
        />

        {showDropdown && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-black/30 backdrop-blur-xl animate-[fadeIn_180ms_ease-out]">
            {value.trim().length >= 2 ? (
              <>
                {listItems.length > 0 ? (
                  <div className="max-h-[420px] overflow-y-auto">
                    {listItems.map((item, index) => {
                      const isActive = index === activeIndex;
                      const badges = [
                        item.trending ? { label: "Trending", icon: "🔥" } : null,
                        item.popularity > 80 ? { label: "Most Used", icon: "⭐" } : null,
                        item.new ? { label: "New", icon: "🆕" } : null,
                        item.difficulty === "Beginner"
                          ? { label: "Beginner", icon: "🟢" }
                          : item.difficulty === "Intermediate"
                            ? { label: "Intermediate", icon: "🟡" }
                            : { label: "Expert", icon: "🔴" },
                      ].filter(Boolean) as Array<{ label: string; icon: string }>;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelect(item)}
                          className={`flex w-full flex-col gap-2 border-b border-slate-800 px-4 py-3 text-left transition-colors last:border-b-0 ${
                            isActive ? "bg-violet-500/15 text-white" : "text-slate-300 hover:bg-slate-800/80"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{item.icon}</span>
                                <span className="truncate text-sm font-semibold">
                                  {highlightText(item.title, value)}
                                </span>
                              </div>
                              <div className="mt-1 line-clamp-2 text-sm text-slate-400">
                                {highlightText(item.description, value)}
                              </div>
                            </div>
                            <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-400">
                              {item.category}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {badges.map((badge) => (
                              <span
                                key={`${item.id}-${badge.label}`}
                                className="rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-[11px] text-slate-300"
                              >
                                {badge.icon} {badge.label}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-4 py-5 text-sm text-slate-400">
                    No matching prompts found.
                  </div>
                )}
              </>
            ) : (
              <div className="max-h-[480px] overflow-y-auto p-3">
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Recent Searches
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleChipSelect(item)}
                          className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-violet-500 hover:text-white"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Trending Today
                  </div>
                  <div className="space-y-2">
                    {sections?.trendingPrompts.slice(0, 4).map((item) => (
                      <button
                        key={`trend-${item.id}`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelect(item)}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-left text-sm text-slate-300 transition-colors hover:border-violet-500 hover:bg-slate-800/80"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{item.icon}</span>
                          <span>{item.title}</span>
                        </span>
                        <span className="rounded-full border border-slate-700 px-2 py-1 text-[11px] text-slate-400">
                          {item.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Recommended Prompts
                  </div>
                  <div className="space-y-2">
                    {sections?.recommendedPrompts.slice(0, 4).map((item) => (
                      <button
                        key={`rec-${item.id}`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelect(item)}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-left text-sm text-slate-300 transition-colors hover:border-violet-500 hover:bg-slate-800/80"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{item.icon}</span>
                          <span>{item.title}</span>
                        </span>
                        <span className="rounded-full border border-slate-700 px-2 py-1 text-[11px] text-slate-400">
                          {item.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
