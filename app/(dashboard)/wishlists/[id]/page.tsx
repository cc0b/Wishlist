import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ItemList } from "@/components/item-list";
import { AddItemForm } from "@/components/add-item-form";
import { EditWishlistTitle } from "@/components/edit-wishlist-title";

export default async function WishlistDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!wishlist) notFound();

  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("wishlist_id", params.id)
    .order("position", { ascending: true });

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
      <EditWishlistTitle wishlist={wishlist} />

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
