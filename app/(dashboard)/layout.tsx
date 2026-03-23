import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { UsernamePrompt } from "@/components/username-prompt";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      {!profile?.username && <UsernamePrompt userId={user.id} />}
    </div>
  );
}
