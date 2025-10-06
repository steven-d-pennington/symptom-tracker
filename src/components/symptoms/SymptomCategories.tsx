"use client";

import { useMemo, useState } from "react";
import {
  SymptomCategory,
  SymptomCategoryInput,
  SymptomCategoryUpdate,
} from "@/lib/types/symptoms";

interface SymptomCategoriesProps {
  categories: SymptomCategory[];
  onCreate: (input: SymptomCategoryInput) => void;
  onUpdate: (id: string, updates: SymptomCategoryUpdate) => void;
  onDelete: (id: string, transferTo: string) => void;
  defaultCategoryId: string;
  usageByCategory: Record<string, number>;
}

export const SymptomCategories = ({
  categories,
  onCreate,
  onUpdate,
  onDelete,
  defaultCategoryId,
  usageByCategory,
}: SymptomCategoriesProps) => {
  const [newCategory, setNewCategory] = useState<SymptomCategoryInput>({
    name: "",
    color: "#3b82f6",
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [transferMap, setTransferMap] = useState<Record<string, string>>({});

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    [categories],
  );

  const handleCreate = () => {
    if (!newCategory.name.trim()) {
      return;
    }
    onCreate({
      ...newCategory,
      name: newCategory.name.trim(),
    });
    setNewCategory({ name: "", color: "#3b82f6", description: "" });
  };

  const handleDelete = (id: string) => {
    const transferTarget = transferMap[id] ?? defaultCategoryId;
    onDelete(id, transferTarget);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Categories</h3>
          <p className="text-xs text-muted-foreground">
            Organize symptoms into meaningful groups. Default categories cannot be removed.
          </p>
        </div>
      </header>

      <div className="grid gap-2 text-sm">
        {sortedCategories.map((category) => {
          const isEditing = editingId === category.id;
          const usageCount = usageByCategory[category.id] ?? 0;
          const fallbackOptions = sortedCategories.filter((item) => item.id !== category.id);
          const transferValueRaw = transferMap[category.id] ?? defaultCategoryId;
          const transferValue = fallbackOptions.some((option) => option.id === transferValueRaw)
            ? transferValueRaw
            : fallbackOptions[0]?.id ?? defaultCategoryId;

          return (
            <article
              key={category.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-8 w-8 rounded-full"
                    style={{ backgroundColor: category.color }}
                    aria-hidden
                  />
                  {isEditing ? (
                    <input
                      type="text"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      value={category.name}
                      onChange={(event) =>
                        onUpdate(category.id, {
                          name: event.target.value,
                        })
                      }
                    />
                  ) : (
                    <div className="space-y-1">
                      <h4 className="text-base font-semibold text-foreground">{category.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {category.description ?? "No description"}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{usageCount} symptom{usageCount === 1 ? "" : "s"}</span>
                  {category.isDefault ? (
                    <span className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                      Default
                    </span>
                  ) : null}
                </div>
              </div>

              {isEditing ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Description</span>
                    <input
                      type="text"
                      className="rounded-lg border border-border bg-background px-3 py-2"
                      value={category.description ?? ""}
                      onChange={(event) =>
                        onUpdate(category.id, {
                          description: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Color</span>
                    <input
                      type="color"
                      className="h-10 w-full rounded-lg border border-border bg-background"
                      value={category.color}
                      onChange={(event) =>
                        onUpdate(category.id, {
                          color: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Icon</span>
                    <input
                      type="text"
                      className="rounded-lg border border-border bg-background px-3 py-2"
                      value={category.icon ?? ""}
                      onChange={(event) =>
                        onUpdate(category.id, {
                          icon: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {isEditing ? (
                  <button
                    type="button"
                    className="rounded-lg border border-border px-3 py-1 font-medium text-foreground hover:bg-muted"
                    onClick={() => setEditingId(null)}
                  >
                    Done
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rounded-lg border border-border px-3 py-1 font-medium text-foreground hover:bg-muted"
                    onClick={() => setEditingId(category.id)}
                  >
                    Edit
                  </button>
                )}
                <select
                  className="rounded-lg border border-border bg-background px-3 py-1"
                  value={transferValue}
                  onChange={(event) =>
                    setTransferMap((previous) => ({
                      ...previous,
                      [category.id]: event.target.value,
                    }))
                  }
                  disabled={category.isDefault || fallbackOptions.length === 0}
                  aria-label="Transfer symptoms to"
                >
                  {fallbackOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-1 font-medium text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => handleDelete(category.id)}
                  disabled={category.isDefault}
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <form
        className="grid gap-3 rounded-xl border border-dashed border-border bg-muted/10 p-3 text-sm"
        onSubmit={(event) => {
          event.preventDefault();
          handleCreate();
        }}
      >
        <h4 className="text-base font-semibold text-foreground">Add category</h4>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Name</span>
            <input
              type="text"
              className="rounded-lg border border-border bg-background px-3 py-2"
              value={newCategory.name}
              onChange={(event) =>
                setNewCategory((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Color</span>
            <input
              type="color"
              className="h-10 w-full rounded-lg border border-border bg-background"
              value={newCategory.color}
              onChange={(event) =>
                setNewCategory((previous) => ({
                  ...previous,
                  color: event.target.value,
                }))
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Icon</span>
            <input
              type="text"
              className="rounded-lg border border-border bg-background px-3 py-2"
              value={newCategory.icon ?? ""}
              onChange={(event) =>
                setNewCategory((previous) => ({
                  ...previous,
                  icon: event.target.value,
                }))
              }
              placeholder="Emoji"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Description</span>
          <textarea
            className="min-h-[60px] rounded-lg border border-border bg-background px-3 py-2"
            value={newCategory.description ?? ""}
            onChange={(event) =>
              setNewCategory((previous) => ({
                ...previous,
                description: event.target.value,
              }))
            }
          />
        </label>
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Add category
          </button>
        </div>
      </form>
    </section>
  );
};
