"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Check, AlertTriangle } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
}

export function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(profile.display_name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const isDirty = displayName.trim() !== profile.display_name;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || !displayName.trim()) return;
    setSaving(true);
    setSaveError("");
    setSaved(false);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      setSaveError("Failed to save. Please try again.");
    } else {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== profile.email) return;
    setDeleting(true);

    // Delete all user data — cascade will handle wishlists/items/friendships
    await supabase.from("profiles").delete().eq("id", profile.id);
    // Sign out and let the auth trigger cascade handle auth.users deletion
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Profile */}
      <div className="card">
        <h2 className="mb-1 font-semibold text-stone-900">Profile</h2>
        <p className="mb-6 text-sm text-stone-500">
          Update your display name shown to friends.
        </p>

        <div className="mb-6 flex items-center gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-600">
              {(profile.display_name || profile.email)[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-stone-900">{profile.display_name || profile.email}</p>
            <p className="text-sm text-stone-400">
              Avatar synced from your Google account
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setSaved(false);
                setSaveError("");
              }}
              placeholder="Your name"
              className="input-field max-w-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="input-field max-w-sm cursor-not-allowed opacity-50"
            />
            <p className="mt-1.5 text-xs text-stone-400">
              Email is managed by Google and cannot be changed here.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!isDirty || saving || !displayName.trim()}
              className="btn-primary"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Saved
              </span>
            )}
            {saveError && (
              <span className="text-sm text-red-500">{saveError}</span>
            )}
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200">
        <div className="mb-4 flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div>
            <h2 className="font-semibold text-stone-900">Delete account</h2>
            <p className="mt-1 text-sm text-stone-500">
              Permanently delete your account and all data — wishlists, items,
              and friendships. This cannot be undone.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Type <span className="font-mono text-stone-900">{profile.email}</span> to confirm
            </label>
            <input
              type="email"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={profile.email}
              className="input-field max-w-sm border-red-200 focus:border-red-400 focus:ring-red-100"
            />
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== profile.email || deleting}
            className="btn-danger"
          >
            {deleting ? "Deleting…" : "Delete my account"}
          </button>
        </div>
      </div>
    </div>
  );
}
