import { createElement, type ReactNode } from "react";
import { getAllPromptTemplates, type PromptTemplate } from "./promptLibraryData";

export interface PromptSearchResult extends PromptTemplate {
  categoryKey: string;
  categoryName: string;
  relevance: number;
}

export interface AutocompleteSections {
  recentSearches: string[];
  mostUsedPrompts: PromptSearchResult[];
  trendingPrompts: PromptSearchResult[];
  recommendedPrompts: PromptSearchResult[];
}

const TEMPLATE_CACHE = (() => {
  const allTemplates = getAllPromptTemplates();
  return allTemplates.map((template) => ({
    ...template,
    searchableText: [
      template.title,
      template.description,
      template.starterPrompt,
      template.keywords.join(" "),
      template.categoryName,
      template.categoryKey,
      template.category,
    ]
      .join(" ")
      .toLowerCase(),
  }));
})();

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function getRelevance(query: string, template: { searchableText: string; title: string; description: string; keywords: string[]; categoryName: string; category: string }) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;

  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  let score = 0;

  if (template.title.toLowerCase().includes(normalizedQuery)) score += 45;
  if (template.description.toLowerCase().includes(normalizedQuery)) score += 18;
  if (template.categoryName.toLowerCase().includes(normalizedQuery)) score += 20;
  if (template.category.toLowerCase().includes(normalizedQuery)) score += 15;

  words.forEach((word) => {
    if (template.title.toLowerCase().includes(word)) score += 10;
    if (template.description.toLowerCase().includes(word)) score += 5;
    if (template.keywords.some((keyword) => keyword.toLowerCase().includes(word))) score += 8;
    if (template.categoryName.toLowerCase().includes(word)) score += 6;
    if (template.category.toLowerCase().includes(word)) score += 5;
  });

  const partialMatches = words.filter((word) => template.searchableText.includes(word)).length;
  if (partialMatches > 0) score += partialMatches * 2;

  return score;
}

function applyBoosts(template: PromptSearchResult, recentTemplateIds: string[] = []) {
  let boostedScore = template.relevance ?? 0;

  if (template.trending) boostedScore += 18;
  if (template.popularity > 80) boostedScore += 14;
  if (template.new) boostedScore += 8;
  if (recentTemplateIds.includes(template.id)) boostedScore += 10;

  return boostedScore;
}

export function searchPromptLibrary(
  query: string,
  limit = 10,
  recentTemplateIds: string[] = [],
): PromptSearchResult[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery || normalizedQuery.length < 2) return [];

  const results = TEMPLATE_CACHE
    .map((template) => ({
      ...template,
      relevance: applyBoosts(
        {
          ...template,
          relevance: getRelevance(normalizedQuery, template),
        } as PromptSearchResult,
        recentTemplateIds,
      ),
    }))
    .filter((template) => template.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);

  const uniqueById = new Map<string, PromptSearchResult>();
  results.forEach((result) => {
    if (!uniqueById.has(result.id)) {
      uniqueById.set(result.id, result as PromptSearchResult);
    }
  });

  return Array.from(uniqueById.values());
}

export function getAutocompleteSections(recentTemplateIds: string[] = []): AutocompleteSections {
  const sorted = [...TEMPLATE_CACHE]
    .map((template) => ({
      ...template,
      relevance: applyBoosts(
        {
          ...template,
          relevance: getRelevance("", template),
        } as PromptSearchResult,
        recentTemplateIds,
      ),
    }))
    .sort((a, b) => b.relevance - a.relevance);

  return {
    recentSearches: [],
    mostUsedPrompts: sorted.filter((item) => item.popularity > 75).slice(0, 6),
    trendingPrompts: sorted.filter((item) => item.trending).slice(0, 6),
    recommendedPrompts: sorted.slice(0, 6),
  };
}

export function highlightText(text: string, query: string): ReactNode[] {
  if (!query.trim()) return [text];

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "ig");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return createElement(
        "span",
        {
          key: `${part}-${index}`,
          className: "rounded bg-violet-500/20 px-1 py-0.5 text-white",
        },
        part,
      );
    }

    return createElement("span", { key: `${part}-${index}` }, part);
  });
}
