"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import {
  ExternalLink,
  Trash2,
  Pencil,
  Check,
  X,
  GripVertical,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { WishlistItem } from "@/types/database";

function formatPrice(price: number | null) {
  if (price === null) return null;
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(price);
}

function ItemCard({
  item,
  onDelete,
  onUpdate,
}: {
  item: WishlistItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<WishlistItem>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [url, setUrl] = useState(item.url || "");
  const [price, setPrice] = useState(item.price?.toString() || "");
  const [notes, setNotes] = useState(item.notes || "");

  const handleSave = () => {
    if (!name.trim()) return;
    onUpdate(item.id, {
      name: name.trim(),
      url: url.trim() || null,
      price: price ? parseFloat(price) : null,
      notes: notes.trim() || null,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setName(item.name);
    setUrl(item.url || "");
    setPrice(item.price?.toString() || "");
    setNotes(item.notes || "");
    setEditing(false);
  };

  if (editing) {
    return (
      <motion.div
        layout
        className="rounded-xl border border-brand-200 bg-brand-50/30 p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field font-medium"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Link (optional)"
            className="input-field text-sm"
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
              $
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="input-field pl-7 text-sm"
              min="0"
              step="0.01"
            />
          </div>
          <div className="sm:col-span-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="input-field resize-none text-sm"
              rows={2}
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={handleCancel} className="btn-ghost text-xs">
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="btn-primary py-1.5 px-3 text-xs"
          >
            <Check className="h-3.5 w-3.5" />
            Save
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="group flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-stone-300 hover:shadow-sm"
    >
      {/* Drag handle (visual only for now — functional with @dnd-kit later) */}
      <div className="mt-0.5 cursor-grab text-stone-200 transition-colors group-hover:text-stone-400">
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium text-stone-900">{item.name}</h3>
          {item.price !== null && (
            <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-semibold text-brand-600">
              {formatPrice(item.price)}
            </span>
          )}
        </div>

        {item.notes && (
          <p className="mt-1 text-sm text-stone-500">{item.notes}</p>
        )}

        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            {(() => {
              try {
                return new URL(item.url).hostname.replace("www.", "");
              } catch {
                return "View link";
              }
            })()}
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => setEditing(true)}
          className="rounded-md p-1.5 text-stone-300 hover:bg-stone-100 hover:text-stone-600"
          title="Edit item"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="rounded-md p-1.5 text-stone-300 hover:bg-red-50 hover:text-red-500"
          title="Delete item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function ItemList({
  items,
  wishlistId,
}: {
  items: WishlistItem[];
  wishlistId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    await supabase.from("items").delete().eq("id", id);
    router.refresh();
  };

  const handleUpdate = async (id: string, data: Partial<WishlistItem>) => {
    await supabase.from("items").update(data).eq("id", id);
    router.refresh();
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100">
          <Package className="h-6 w-6 text-stone-400" />
        </div>
        <p className="mt-3 text-sm font-medium text-stone-500">
          No items yet
        </p>
        <p className="mt-1 text-xs text-stone-400">
          Add your first item above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
        {items.length} item{items.length !== 1 ? "s" : ""}
      </p>
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
