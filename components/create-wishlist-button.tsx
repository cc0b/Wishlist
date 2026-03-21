"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CreateWishlistButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("wishlists")
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        owner_id: user!.id,
      })
      .select()
      .single();

    if (!error && data) {
      setTitle("");
      setDescription("");
      setOpen(false);
      router.push(`/wishlists/${data.id}`);
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="h-4 w-4" />
        New Wishlist
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-stone-900">
                    New Wishlist
                  </h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-md p-1 text-stone-400 hover:text-stone-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Birthday 2026, Christmas Ideas"
                      className="input-field"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">
                      Description{" "}
                      <span className="text-stone-400">(optional)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="A short note about this list..."
                      className="input-field resize-none"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!title.trim() || loading}
                    className="btn-primary"
                  >
                    {loading ? "Creating..." : "Create Wishlist"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
