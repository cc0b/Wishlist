import { createClient } from "@/lib/supabase-server";
import { FriendsList } from "@/components/friends-list";

export default async function FriendsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: friendships } = await supabase
    .from("friendships")
    .select(
      `id, requester_id, addressee_id, status, created_at,
       requester:profiles!friendships_requester_id_fkey(id, email, display_name, avatar_url, username),
       addressee:profiles!friendships_addressee_id_fkey(id, email, display_name, avatar_url, username)`
    )
    .or(`requester_id.eq.${user!.id},addressee_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-stone-900">Friends</h1>
        <p className="mt-1 text-sm text-stone-500">
          Add friends to share wishlists and coordinate gifts.
        </p>
      </div>

      <FriendsList
        friendships={(friendships as any) || []}
        currentUserId={user!.id}
      />
    </div>
  );
}
