"use client";

import {
  createCategory,
  updateCategory,
  deleteCategory,
  type AdminCategory,
} from "@/app/actions/admin-categories.actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/**
 * Client-side category manager: create, rename (inline), delete (with confirm).
 * Server actions own the API calls + revalidation; this component owns the
 * optimistic UI states (pending, inline edit, error banner).
 */
export function CategoryClient({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [newName, setNewName] = useState("");

  // Inline edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = newName.trim();
    if (!name) return;
    startTransition(async () => {
      const result = await createCategory(name);
      if (result.success) {
        setNewName("");
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  function startEdit(cat: AdminCategory) {
    setError(null);
    setEditingId(cat.id ?? null);
    setEditName(cat.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  function saveEdit(id: number) {
    setError(null);
    const name = editName.trim();
    if (!name) return;
    startTransition(async () => {
      const result = await updateCategory(id, name);
      if (result.success) {
        cancelEdit();
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  function handleDelete(cat: AdminCategory) {
    if (cat.id === undefined) return;
    const ok = window.confirm(`Delete category "${cat.name}"?`);
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteCategory(cat.id as number);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Create */}
      <form
        onSubmit={handleCreate}
        className="flex flex-col sm:flex-row gap-3 border border-gray-200 dark:border-gray-800 rounded-xl p-4"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          disabled={pending}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending || !newName.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-150"
        >
          {pending ? "Working…" : "Add category"}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="text-sm text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 rounded-md px-3 py-2"
        >
          {error}
        </p>
      )}

      {/* List */}
      {categories.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
          <div className="text-4xl mb-4">🏷️</div>
          <p className="text-gray-600 dark:text-gray-400">Categories not found.</p>
        </div>
      ) : (
        <ul className="border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
          {categories.map((cat) => {
            const isEditing = editingId === cat.id;
            return (
              <li
                key={cat.id ?? cat.name}
                className="flex items-center gap-3 px-4 py-3"
              >
                {isEditing ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      disabled={pending}
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => cat.id !== undefined && saveEdit(cat.id)}
                      disabled={pending || !editName.trim()}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-md transition-colors duration-150"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={pending}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-150"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                      {cat.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      disabled={pending || cat.id === undefined}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors duration-150"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      disabled={pending || cat.id === undefined}
                      className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 transition-colors duration-150"
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
