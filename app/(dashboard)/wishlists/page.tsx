import { createClient } from "@/lib/supabase-server";
import { WishlistGrid } from "@/components/wishlist-grid";
import { CreateWishlistButton } from "@/components/create-wishlist-button";
import type { Wishlist } from "@/types/database";

export default async function WishlistsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: wishlists } = await supabase
    .from("wishlists")
    .select("*, items:items(count)")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl text-stone-900">
            My Wishlists
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Create and manage your wishlists. Share them with friends later.
          </p>
        </div>
        <CreateWishlistButton />
      </div>

      {/* Grid */}
      <div className="mt-8">
        <WishlistGrid wishlists={(wishlists as any) || []} />
      </div>
    </div>
  );
}
