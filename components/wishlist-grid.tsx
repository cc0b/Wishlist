"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Gift, Trash2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface WishlistWithCount {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  items: { count: number }[];
}

export function WishlistGrid({
  wishlists,
}: {
  wishlists: WishlistWithCount[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this wishlist and all its items?")) return;

    await supabase.from("items").delete().eq("wishlist_id", id);
    await supabase.from("wishlists").delete().eq("id", id);
    router.refresh();
  };

  if (wishlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
          <Gift className="h-7 w-7 text-brand-400" />
        </div>
        <h3 className="mt-4 font-semibold text-stone-900">No wishlists yet</h3>
        <p className="mt-1 text-sm text-stone-500">
          Create your first wishlist to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {wishlists.map((wishlist, i) => (
        <motion.div
          key={wishlist.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            href={`/wishlists/${wishlist.id}`}
            className="group card flex items-start justify-between transition-all hover:border-brand-200 hover:shadow-md"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-stone-900 group-hover:text-brand-600 transition-colors">
                {wishlist.title}
              </h3>
              {wishlist.description && (
                <p className="mt-1 text-sm text-stone-500 line-clamp-1">
                  {wishlist.description}
                </p>
              )}
              <p className="mt-3 text-xs text-stone-400">
                {wishlist.items?.[0]?.count || 0} item
                {wishlist.items?.[0]?.count !== 1 ? "s" : ""}
                {" · "}
                {new Date(wishlist.created_at).toLocaleDateString("en-NZ", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => handleDelete(e, wishlist.id)}
                className="rounded-md p-1.5 text-stone-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                title="Delete wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <ChevronRight className="h-4 w-4 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-400" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
