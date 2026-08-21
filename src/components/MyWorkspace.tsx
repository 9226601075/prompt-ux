"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LocalStorageWorkspaceRepository,
  getGuestMode,
  setGuestMode,
  setGuestSession,
} from "@/lib/workspace/localStorageRepository";
import type { WorkspacePromptRecord, WorkspaceStats } from "@/lib/workspace/types";
import { useRouter } from "next/navigation";

const repository = new LocalStorageWorkspaceRepository();

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function MyWorkspace() {
  const [prompts, setPrompts] = useState<WorkspacePromptRecord[]>([]);
  const [stats, setStats] = useState<WorkspaceStats>({
    totalPrompts: 0,
    favorites: 0,
    recentActivities: 0,
    averagePromptScore: 0,
    recentPrompts: [],
  });
  const [search, setSearch] = useState("");
  const [guestMode, setGuestModeState] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const router = useRouter();

  const loadWorkspace = () => {
    const nextPrompts = repository.getPrompts();
    setPrompts(nextPrompts);
    setStats(repository.getStats());
    setGuestModeState(getGuestMode());
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  const filteredPrompts = useMemo(() => {
    if (!search.trim()) {
      return prompts;
    }

    const query = search.toLowerCase();
    return prompts.filter((prompt) => {
      return [prompt.title, prompt.content, prompt.category, prompt.promptMode]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [prompts, search]);

  const handleToggleFavorite = (id: string) => {
    repository.toggleFavorite(id);
    loadWorkspace();
  };

  const handleDelete = (id: string) => {
    repository.deletePrompt(id);
    loadWorkspace();
  };

  const handleRename = (prompt: WorkspacePromptRecord) => {
    if (!editingTitle.trim()) {
      return;
    }

    repository.updatePrompt(prompt.id, { title: editingTitle.trim() });
    setEditingId(null);
    setEditingTitle("");
    loadWorkspace();
  };

  const handleGuestToggle = () => {
    if (guestMode) {
      setGuestMode(false);
      setGuestSession(false);
      router.replace("/login");
      router.refresh();
      return;
    }

    const nextValue = !guestMode;
    setGuestMode(nextValue);
    setGuestSession(nextValue);
    setGuestModeState(nextValue);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:px-8">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">My Workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Saved prompts and activity history</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Keep your best prompts organized, searchable, and ready to reuse.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGuestToggle}
              className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                guestMode
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {guestMode ? "Guest Mode On" : "Guest Mode Off"}
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">Total Prompts</p>
            <p className="mt-2 text-2xl font-semibold text-white">{stats.totalPrompts}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">Favourites</p>
            <p className="mt-2 text-2xl font-semibold text-white">{stats.favorites}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">Recent Activities</p>
            <p className="mt-2 text-2xl font-semibold text-white">{stats.recentActivities}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">Average Prompt Score</p>
            <p className="mt-2 text-2xl font-semibold text-white">{stats.averagePromptScore}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Prompts</h2>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {stats.recentPrompts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-400">
                  Recent prompts will appear here as you generate and save them.
                </div>
              ) : (
                stats.recentPrompts.map((prompt) => (
                  <div key={prompt.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{prompt.title}</p>
                      <span className="text-xs text-slate-400">{formatDate(prompt.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{prompt.content.slice(0, 120)}{prompt.content.length > 120 ? "..." : ""}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Prompt Library</h2>
              <p className="text-sm text-slate-400">Search, rename, favorite, or remove prompts.</p>
            </div>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search prompts"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500 lg:w-72"
            />
          </div>

          <div className="space-y-3">
            {filteredPrompts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center text-sm text-slate-400">
                No prompts saved yet. Generate one from the main prompt builder and it will appear here.
              </div>
            ) : (
              filteredPrompts.map((prompt) => (
                <article key={prompt.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      {editingId === prompt.id ? (
                        <div className="flex flex-wrap gap-2">
                          <input
                            value={editingTitle}
                            onChange={(event) => setEditingTitle(event.target.value)}
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRename(prompt)}
                            className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setEditingTitle("");
                            }}
                            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{prompt.title}</h3>
                          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-200">
                            {prompt.category}
                          </span>
                          <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300">
                            {prompt.promptMode}
                          </span>
                        </div>
                      )}

                      <p className="mt-3 text-sm leading-6 text-slate-300">{prompt.content}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                        <span>Created {formatDate(prompt.createdAt)}</span>
                        <span>Score {prompt.score}</span>
                        <span>Source {prompt.source}</span>
                        {prompt.outputLanguage && <span>Output {prompt.outputLanguage}</span>}
                        {prompt.inputLanguage && <span>Input {prompt.inputLanguage}</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:flex-col">
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(prompt.id)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                          prompt.favorite
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                            : "border-slate-700 bg-slate-900/70 text-slate-300"
                        }`}
                      >
                        {prompt.favorite ? "★ Favorited" : "☆ Favorite"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(prompt.id);
                          setEditingTitle(prompt.title);
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm font-medium text-slate-300"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(prompt.id)}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
