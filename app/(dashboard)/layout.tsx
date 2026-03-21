import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

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

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar user={user} />
      <main className="flex-1 px-8 py-8 lg:px-12">{children}</main>
    </div>
  );
}
