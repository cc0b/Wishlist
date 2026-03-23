import { createClient } from "@/lib/supabase-server";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name, avatar_url, username")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-stone-900">Settings</h1>
        <p className="mt-1 text-sm text-stone-500">
          Manage your profile and account preferences.
        </p>
      </div>

      <SettingsForm profile={profile as any} />
    </div>
  );
}
