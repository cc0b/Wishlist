import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gift, ChevronRight } from "lucide-react";

export default async function FriendWishlistsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verify they are an accepted friend
  const { data: friendship } = await supabase
    .from("friendships")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${user!.id},addressee_id.eq.${params.id}),and(requester_id.eq.${params.id},addressee_id.eq.${user!.id})`
    )
    .single();

  if (!friendship) notFound();

  // Fetch friend's profile
  const { data: friend } = await supabase
    .from("profiles")
    .select("id, email, display_name, avatar_url")
    .eq("id", params.id)
    .single();

  if (!friend) notFound();

  // Fetch friend's wishlists (RLS now allows this)
  const { data: wishlists } = await supabase
    .from("wishlists")
    .select("*, items:items(count)")
    .eq("owner_id", params.id)
    .order("created_at", { ascending: false });

  const friendName = friend.display_name || friend.email;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/friends"
        className="btn-ghost mb-6 -ml-3 text-stone-400 hover:text-stone-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to friends
      </Link>

      <div className="mb-8 flex items-center gap-4">
        {friend.avatar_url ? (
          <img
            src={friend.avatar_url}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-600">
            {friendName[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-display text-3xl text-stone-900">
            {friendName}&rsquo;s Wishlists
          </h1>
          <p className="mt-0.5 text-sm text-stone-500">{friend.email}</p>
        </div>
      </div>

      {!wishlists || wishlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <Gift className="h-7 w-7 text-brand-400" />
          </div>
          <h3 className="mt-4 font-semibold text-stone-900">No wishlists yet</h3>
          <p className="mt-1 text-sm text-stone-500">
            {friendName} hasn&rsquo;t created any wishlists.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {wishlists.map((wishlist) => (
            <Link
              key={wishlist.id}
              href={`/friends/${params.id}/wishlists/${wishlist.id}`}
              className="card group flex items-start justify-between transition-all hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 transition-colors group-hover:text-brand-600">
                  {wishlist.title}
                </h3>
                {wishlist.description && (
                  <p className="mt-1 text-sm text-stone-500 line-clamp-1">
                    {wishlist.description}
                  </p>
                )}
                <p className="mt-3 text-xs text-stone-400">
                  {(wishlist as any).items?.[0]?.count || 0} item
                  {(wishlist as any).items?.[0]?.count !== 1 ? "s" : ""}
                  {" · "}
                  {new Date(wishlist.created_at).toLocaleDateString("en-NZ", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
