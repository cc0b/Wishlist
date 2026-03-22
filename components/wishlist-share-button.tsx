"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Users, Plus, X, Check } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
}

interface WishlistShareButtonProps {
  wishlistId: string;
  friends: Profile[];
  sharedWith: string[]; // user IDs currently shared with
}

function Avatar({ profile }: { profile: Profile }) {
  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt=""
        className="h-7 w-7 rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600">
      {(profile.display_name || profile.email)[0]?.toUpperCase()}
    </div>
  );
}

export function WishlistShareButton({
  wishlistId,
  friends,
  sharedWith,
}: WishlistShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [shared, setShared] = useState<Set<string>>(new Set(sharedWith));
  const [loading, setLoading] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleToggle = async (friendId: string) => {
    setLoading(friendId);
    const isShared = shared.has(friendId);

    if (isShared) {
      await supabase
        .from("wishlist_shares")
        .delete()
        .eq("wishlist_id", wishlistId)
        .eq("user_id", friendId);
      setShared((prev) => {
        const next = new Set(prev);
        next.delete(friendId);
        return next;
      });
    } else {
      await supabase
        .from("wishlist_shares")
        .insert({ wishlist_id: wishlistId, user_id: friendId });
      setShared((prev) => new Set(prev).add(friendId));
    }

    setLoading(null);
    router.refresh();
  };

  const sharedFriends = friends.filter((f) => shared.has(f.id));

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          open
            ? "border-brand-300 bg-brand-50 text-brand-700"
            : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
        }`}
      >
        <Users className="h-4 w-4" />
        {shared.size === 0 ? (
          "Share"
        ) : (
          <span className="flex items-center gap-1.5">
            Shared
            <span className="flex -space-x-1.5">
              {sharedFriends.slice(0, 3).map((f) => (
                <Avatar key={f.id} profile={f} />
              ))}
              {shared.size > 3 && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-200 text-[10px] font-semibold text-stone-600 ring-2 ring-white">
                  +{shared.size - 3}
                </span>
              )}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-stone-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <p className="text-sm font-semibold text-stone-900">Share with friends</p>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-stone-400 hover:text-stone-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {friends.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-stone-500">
              Add some friends first to share wishlists.
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {friends.map((friend) => {
                const isShared = shared.has(friend.id);
                const isLoading = loading === friend.id;
                return (
                  <li key={friend.id}>
                    <button
                      onClick={() => handleToggle(friend.id)}
                      disabled={isLoading}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-stone-50 disabled:opacity-50"
                    >
                      <Avatar profile={friend} />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-stone-900">
                          {friend.display_name || friend.email}
                        </p>
                        <p className="truncate text-xs text-stone-400">
                          {friend.email}
                        </p>
                      </div>
                      {isLoading ? (
                        <span className="h-5 w-5 animate-pulse rounded-full bg-stone-200" />
                      ) : isShared ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500">
                          <Check className="h-3 w-3 text-white" />
                        </span>
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-stone-200">
                          <Plus className="h-3 w-3 text-stone-400" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
