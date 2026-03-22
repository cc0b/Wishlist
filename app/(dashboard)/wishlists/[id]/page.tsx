import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ItemList } from "@/components/item-list";
import { AddItemForm } from "@/components/add-item-form";
import { EditWishlistTitle } from "@/components/edit-wishlist-title";
import { WishlistShareButton } from "@/components/wishlist-share-button";

export default async function WishlistDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!wishlist) notFound();

  const [{ data: items }, { data: friendships }, { data: shares }] =
    await Promise.all([
      supabase
        .from("items")
        .select("*")
        .eq("wishlist_id", params.id)
        .order("position", { ascending: true }),

      // Fetch accepted friends
      supabase
        .from("friendships")
        .select(
          `id, requester_id, addressee_id,
           requester:profiles!friendships_requester_id_fkey(id, email, display_name, avatar_url),
           addressee:profiles!friendships_addressee_id_fkey(id, email, display_name, avatar_url)`
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${user!.id},addressee_id.eq.${user!.id}`),

      // Fetch current shares for this wishlist
      supabase
        .from("wishlist_shares")
        .select("user_id")
        .eq("wishlist_id", params.id),
    ]);

  // Extract friend profiles (the other person in each friendship)
  const friends = (friendships || []).map((f: any) =>
    f.requester_id === user!.id ? f.addressee : f.requester
  );

  const sharedWith = (shares || []).map((s: any) => s.user_id);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back link */}
      <Link
        href="/wishlists"
        className="btn-ghost mb-6 -ml-3 text-stone-400 hover:text-stone-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to wishlists
      </Link>

      {/* Wishlist header */}
      <div className="flex items-start justify-between gap-4">
        <EditWishlistTitle wishlist={wishlist} />
        <WishlistShareButton
          wishlistId={params.id}
          friends={friends}
          sharedWith={sharedWith}
        />
      </div>

      {/* Add item form */}
      <div className="mt-8">
        <AddItemForm wishlistId={params.id} itemCount={items?.length || 0} />
      </div>

      {/* Items */}
      <div className="mt-6">
        <ItemList items={items || []} wishlistId={params.id} />
      </div>
    </div>
  );
}
