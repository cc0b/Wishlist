"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function UsernamePrompt({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const formatError =
    username && !USERNAME_RE.test(username)
      ? "3–20 chars, lowercase letters, numbers and underscores only."
      : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = username.trim();
    if (!value || formatError) return;

    setSaving(true);
    setError("");

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", value)
      .single();

    if (existing) {
      setError("That username is already taken.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: value })
      .eq("id", userId);

    if (updateError) {
      setError("Failed to save. Please try again.");
      setSaving(false);
      return;
    }

    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-stone-900">Choose a username</h2>
        <p className="mt-1 text-sm text-stone-500">
          Pick a unique username so friends can find you.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase().replace(/\s/g, ""));
              setError("");
            }}
            placeholder="your_username"
            className="input-field"
            autoFocus
          />
          {(formatError || error) && (
            <p className="text-sm text-red-500">{formatError || error}</p>
          )}
          <button
            type="submit"
            disabled={!username.trim() || !!formatError || saving}
            className="btn-primary w-full"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
