import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Gift, Users, ShoppingBag } from "lucide-react";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-50">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-40 h-[500px] w-[500px] rounded-full bg-brand-50/60 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-600">
          <Gift className="h-4 w-4" />
          Stop guessing. Start wishing.
        </div>

        {/* Headline */}
        <h1 className="font-display text-6xl leading-[1.1] tracking-tight text-stone-900 sm:text-7xl">
          Gifts your friends
          <br />
          <span className="text-brand-500">actually want.</span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-500">
          Create wishlists for birthdays and holidays, share them with your
          friend group, and pool together for the big stuff. No more duplicate
          candles.
        </p>

        {/* CTA */}
        <div className="mt-10 flex gap-4">
          <Link href="/auth/login" className="btn-primary text-base px-8 py-3">
            Get started
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-20 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Gift,
              title: "Create wishlists",
              desc: "Add items with links and prices",
            },
            {
              icon: Users,
              title: "Share with friends",
              desc: "Everyone sees what you actually want",
            },
            {
              icon: ShoppingBag,
              title: "Pool together",
              desc: "Chip in for bigger, better gifts",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center gap-3 rounded-2xl border border-stone-100 bg-white/70 p-6 backdrop-blur-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                <f.icon className="h-5 w-5 text-brand-500" />
              </div>
              <h3 className="font-semibold text-stone-900">{f.title}</h3>
              <p className="text-sm text-stone-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
