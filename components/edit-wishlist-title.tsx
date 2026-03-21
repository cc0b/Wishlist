"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Pencil, Check, X } from "lucide-react";
import type { Wishlist } from "@/types/database";

export function EditWishlistTitle({ wishlist }: { wishlist: Wishlist }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(wishlist.title);
  const [description, setDescription] = useState(
    wishlist.description || ""
  );
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    if (!title.trim()) return;

    await supabase
      .from("wishlists")
      .update({
        title: title.trim(),
        description: description.trim() || null,
      })
      .eq("id", wishlist.id);

    setEditing(false);
    router.refresh();
  };

  const handleCancel = () => {
    setTitle(wishlist.title);
    setDescription(wishlist.description || "");
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field text-xl font-semibold"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          className="input-field text-sm"
        />
        <div className="flex gap-2">
          <button onClick={handleSave} className="btn-primary py-1.5 px-3 text-xs">
            <Check className="h-3.5 w-3.5" />
            Save
          </button>
          <button onClick={handleCancel} className="btn-ghost py-1.5 px-3 text-xs">
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-3xl text-stone-900">
          {wishlist.title}
        </h1>
        <button
          onClick={() => setEditing(true)}
          className="rounded-md p-1.5 text-stone-300 opacity-0 transition-all hover:bg-stone-100 hover:text-stone-600 group-hover:opacity-100"
          title="Edit title"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
      {wishlist.description && (
        <p className="mt-1 text-sm text-stone-500">{wishlist.description}</p>
      )}
    </div>
  );
}
