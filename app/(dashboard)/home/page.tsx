import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { Gift, Users, ListChecks, ChevronRight, Plus } from "lucide-react";
import { CreateWishlistButton } from "@/components/create-wishlist-button";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user!.user_metadata?.full_name ||
    user!.user_metadata?.name ||
    user!.email?.split("@")[0] ||
    "there";

  const [
    { data: wishlists },
    { count: friendCount },
    { count: itemCount },
  ] = await Promise.all([
    supabase
      .from("wishlists")
      .select("id, title, description, created_at, items:items(count)")
      .eq("owner_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(4),

    supabase
      .from("friendships")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted")
      .or(`requester_id.eq.${user!.id},addressee_id.eq.${user!.id}`),

    supabase
      .from("items")
      .select("id", { count: "exact", head: true })
      .in(
        "wishlist_id",
        (
          await supabase
            .from("wishlists")
            .select("id")
            .eq("owner_id", user!.id)
        ).data?.map((w) => w.id) ?? []
      ),
  ]);

  const wishlistCount = wishlists?.length ?? 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-brand-500">{greeting}</p>
          <h1 className="font-display text-3xl text-stone-900">
            {displayName}
          </h1>
        </div>
        <CreateWishlistButton />
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        {[
          {
            label: "Wishlists",
            value: wishlistCount,
            icon: ListChecks,
            href: "/wishlists",
          },
          {
            label: "Friends",
            value: friendCount ?? 0,
            icon: Users,
            href: "/friends",
          },
          {
            label: "Items",
            value: itemCount ?? 0,
            icon: Gift,
            href: "/wishlists",
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card group flex items-center gap-4 transition-all hover:border-brand-200 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 transition-colors group-hover:bg-brand-100">
              <stat.icon className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
              <p className="text-xs text-stone-500">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent wishlists */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Recent wishlists</h2>
          <Link
            href="/wishlists"
            className="flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {!wishlists || wishlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
              <Gift className="h-6 w-6 text-brand-400" />
            </div>
            <h3 className="mt-4 font-semibold text-stone-900">
              No wishlists yet
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              Create your first wishlist to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {wishlists.map((wishlist) => (
              <Link
                key={wishlist.id}
                href={`/wishlists/${wishlist.id}`}
                className="card group flex items-start justify-between transition-all hover:border-brand-200 hover:shadow-md"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900 transition-colors group-hover:text-brand-600">
                    {wishlist.title}
                  </h3>
                  {wishlist.description && (
                    <p className="mt-0.5 text-sm text-stone-500 line-clamp-1">
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
                <ChevronRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-400" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
