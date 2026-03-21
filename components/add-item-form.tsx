"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AddItemForm({
  wishlistId,
  itemCount,
}: {
  wishlistId: string;
  itemCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const resetForm = () => {
    setName("");
    setUrl("");
    setPrice("");
    setNotes("");
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("items").insert({
      wishlist_id: wishlistId,
      name: name.trim(),
      url: url.trim() || null,
      price: price ? parseFloat(price) : null,
      notes: notes.trim() || null,
      position: itemCount,
    });

    if (!error) {
      resetForm();
      setOpen(false);
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full rounded-xl border-2 border-dashed px-4 py-3 text-left text-sm font-medium transition-all ${
          open
            ? "border-brand-300 bg-brand-50 text-brand-600"
            : "border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600"
        }`}
      >
        <span className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add an item
          {open ? (
            <ChevronUp className="ml-auto h-4 w-4" />
          ) : (
            <ChevronDown className="ml-auto h-4 w-4" />
          )}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Name — full width */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Item name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sony WH-1000XM5 Headphones"
                    className="input-field"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Link{" "}
                    <span className="text-stone-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="input-field"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Price (NZD){" "}
                    <span className="text-stone-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
                      $
                    </span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="input-field pl-7"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Notes — full width */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Notes{" "}
                    <span className="text-stone-400">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Colour preference, size, any details for your friends..."
                    className="input-field resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!name.trim() || loading}
                  className="btn-primary text-sm"
                >
                  {loading ? "Adding..." : "Add Item"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
