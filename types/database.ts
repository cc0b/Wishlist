export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Wishlist {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  items?: WishlistItem[];
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  name: string;
  url: string | null;
  price: number | null;
  notes: string | null;
  position: number;
  created_at: string;
}

// Future types — stubbed for when you build events, friends, claims
export type EventType = "birthday" | "christmas" | "custom";
export type FriendshipStatus = "pending" | "accepted" | "declined";

export interface AppEvent {
  id: string;
  owner_id: string;
  title: string;
  type: EventType;
  date: string;
  surprise_mode: boolean;
  created_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
}

export interface Claim {
  id: string;
  item_id: string;
  user_id: string;
  amount: number | null;
  created_at: string;
}
