import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Package, Gift } from "lucide-react";

function formatPrice(price: number | null) {
  if (price === null) return null;
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(price);
}

export default async function FriendWishlistDetailPage({
  params,
}: {
  params: { id: string; wishlistId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verify accepted friendship
  const { data: friendship } = await supabase
    .from("friendships")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${user!.id},addressee_id.eq.${params.id}),and(requester_id.eq.${params.id},addressee_id.eq.${user!.id})`
    )
    .single();

  if (!friendship) notFound();

  // Fetch wishlist (RLS allows friends to read)
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("*")
    .eq("id", params.wishlistId)
    .eq("owner_id", params.id)
    .single();

  if (!wishlist) notFound();

  // Fetch friend's profile for the header
  const { data: friend } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", params.id)
    .single();

  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("wishlist_id", params.wishlistId)
    .order("position", { ascending: true });

  const friendName = friend?.display_name || friend?.email || "Friend";

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/friends/${params.id}`}
        className="btn-ghost mb-6 -ml-3 text-stone-400 hover:text-stone-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {friendName}&rsquo;s wishlists
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-stone-900">{wishlist.title}</h1>
        {wishlist.description && (
          <p className="mt-2 text-stone-500">{wishlist.description}</p>
        )}
        <p className="mt-2 text-xs text-stone-400">
          {friendName}&rsquo;s wishlist
        </p>
      </div>

      {/* Items */}
      <div className="mt-8">
        {!items || items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100">
              <Package className="h-6 w-6 text-stone-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-stone-500">No items yet</p>
            <p className="mt-1 text-xs text-stone-400">
              {friendName} hasn&rsquo;t added anything to this list.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4"
              >
                <div className="mt-0.5 text-stone-200">
                  <Gift className="h-5 w-5" />
                </div>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
