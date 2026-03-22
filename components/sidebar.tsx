"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { Gift, ListChecks, Users, LogOut, Settings } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/wishlists", label: "My Wishlists", icon: ListChecks },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <aside className="flex w-64 flex-col border-r border-stone-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-stone-100 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
          <Gift className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="font-display text-xl text-stone-900">Wishlist</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-600"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-stone-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-stone-900">
              {displayName}
            </p>
            <p className="truncate text-xs text-stone-400">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
