"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import Link from "next/link";
import { UserPlus, UserCheck, UserX, Trash2, Users, Clock, Search, X, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
}

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  requester: Profile;
  addressee: Profile;
}

interface FriendsListProps {
  friendships: Friendship[];
  currentUserId: string;
}

function Avatar({ profile, size = "md" }: { profile: Profile; size?: "sm" | "md" }) {
  const cls = size === "sm"
    ? "h-8 w-8 text-sm"
    : "h-10 w-10 text-base";
  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt=""
        className={`${cls} rounded-full object-cover`}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div className={`${cls} flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-600`}>
      {(profile.display_name || profile.email)[0]?.toUpperCase()}
    </div>
  );
}

export function FriendsList({ friendships, currentUserId }: FriendsListProps) {
  const router = useRouter();
  const supabase = createClient();

  const [searchEmail, setSearchEmail] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchSuccess, setSearchSuccess] = useState("");

  const accepted = friendships.filter((f) => f.status === "accepted");
  const incoming = friendships.filter(
    (f) => f.status === "pending" && f.addressee_id === currentUserId
  );
  const outgoing = friendships.filter(
    (f) => f.status === "pending" && f.requester_id === currentUserId
  );

  const getFriend = (f: Friendship): Profile =>
    f.requester_id === currentUserId ? f.addressee : f.requester;

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    setSearchSuccess("");
    if (!searchEmail.trim()) return;

    setSearchLoading(true);
    try {
      // Find user by email
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, email, display_name, avatar_url")
        .eq("email", searchEmail.trim().toLowerCase())
        .single();

      if (error || !profile) {
        setSearchError("No user found with that email.");
        return;
      }

      if (profile.id === currentUserId) {
        setSearchError("You can't add yourself.");
        return;
      }

      // Check if friendship already exists
      const already = friendships.find(
        (f) =>
          (f.requester_id === currentUserId && f.addressee_id === profile.id) ||
          (f.requester_id === profile.id && f.addressee_id === currentUserId)
      );
      if (already) {
        setSearchError(
          already.status === "accepted"
            ? "Already friends."
            : "A friend request already exists."
        );
        return;
      }

      const { error: insertError } = await supabase.from("friendships").insert({
        requester_id: currentUserId,
        addressee_id: profile.id,
        status: "pending",
      });

      if (insertError) {
        setSearchError("Failed to send request. Please try again.");
        return;
      }

      setSearchSuccess(`Request sent to ${profile.display_name || profile.email}.`);
      setSearchEmail("");
      router.refresh();
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAccept = async (friendshipId: string) => {
    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);
    router.refresh();
  };

  const handleDecline = async (friendshipId: string) => {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    router.refresh();
  };

  const handleRemove = async (friendshipId: string, friendName: string) => {
    if (!confirm(`Remove ${friendName} from your friends?`)) return;
    await supabase.from("friendships").delete().eq("id", friendshipId);
    router.refresh();
  };

  const handleWithdraw = async (friendshipId: string) => {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Add Friend */}
      <div className="card">
        <h2 className="mb-4 font-semibold text-stone-900">Add a friend</h2>
        <form onSubmit={handleSendRequest} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => {
                setSearchEmail(e.target.value);
                setSearchError("");
                setSearchSuccess("");
              }}
              placeholder="Enter their email address"
              className="w-full rounded-lg border border-stone-200 py-2 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading || !searchEmail.trim()}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {searchLoading ? "Sending…" : "Send request"}
          </button>
        </form>
        {searchError && (
          <p className="mt-2 text-sm text-red-500">{searchError}</p>
        )}
        {searchSuccess && (
          <p className="mt-2 text-sm text-green-600">{searchSuccess}</p>
        )}
      </div>

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-stone-900">
            <Clock className="h-4 w-4 text-amber-500" />
            Pending requests
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              {incoming.length}
            </span>
          </h2>
          <div className="space-y-2">
            <AnimatePresence>
              {incoming.map((f) => {
                const friend = getFriend(f);
                return (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card flex items-center gap-3"
                  >
                    <Avatar profile={friend} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-stone-900">
                        {friend.display_name || friend.email}
                      </p>
                      <p className="truncate text-xs text-stone-400">{friend.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(f.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(f.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Decline
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Accepted friends */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-stone-900">
          <Users className="h-4 w-4 text-brand-500" />
          Friends
          {accepted.length > 0 && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600">
              {accepted.length}
            </span>
          )}
        </h2>
        {accepted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
              <Users className="h-6 w-6 text-brand-400" />
            </div>
            <h3 className="mt-4 font-semibold text-stone-900">No friends yet</h3>
            <p className="mt-1 text-sm text-stone-500">
              Add a friend by entering their email above.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {accepted.map((f) => {
                const friend = getFriend(f);
                return (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card group flex items-center gap-3"
                  >
                    <Avatar profile={friend} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-stone-900">
                        {friend.display_name || friend.email}
                      </p>
                      <p className="truncate text-xs text-stone-400">{friend.email}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                      <Link
                        href={`/friends/${friend.id}`}
                        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                        title="View wishlists"
                      >
                        <Gift className="h-3.5 w-3.5" />
                        View wishlists
                      </Link>
                      <button
                        onClick={() => handleRemove(f.id, friend.display_name || friend.email)}
                        className="rounded-md p-1.5 text-stone-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Remove friend"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Outgoing requests */}
      {outgoing.length > 0 && (
        <div>
          <h2 className="mb-3 font-semibold text-stone-900">Sent requests</h2>
          <div className="space-y-2">
            {outgoing.map((f) => {
              const friend = getFriend(f);
              return (
                <div key={f.id} className="card flex items-center gap-3">
                  <Avatar profile={friend} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-stone-900">
                      {friend.display_name || friend.email}
                    </p>
                    <p className="truncate text-xs text-stone-400">{friend.email}</p>
                  </div>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
                    Pending
                  </span>
                  <button
                    onClick={() => handleWithdraw(f.id)}
                    className="rounded-md p-1.5 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Withdraw request"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
