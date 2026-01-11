"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { createBrowserClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";

export type UserRole = "admin" | "super_admin" | "cashier" | "customer";

type UserProfile = {
  name: string | null;
  image_url: string | null;
  role: UserRole | null;
  store_name?: string | null;
  address?: string | null;
  phone?: string | null;
  ein?: string | null;
  age_verified?: boolean;
};

type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseRef = useRef(createBrowserClient());
  const router = useRouter();
  const isMountedRef = useRef(true);

  const supabase = supabaseRef.current;

  const fetchProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser || !isMountedRef.current) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("get_my_profile");

      if (!isMountedRef.current) return;

      if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
        return;
      }

      if (data) {
        setProfile(data as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      }
    }
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();

      if (!isMountedRef.current) return;

      if (error) {
        console.error("Error getting user:", error);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setUser(currentUser ?? null);

      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error refreshing user:", error);
        setUser(null);
        setProfile(null);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [supabase, router]);

  useEffect(() => {
    isMountedRef.current = true;

    refreshUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          (async () => {
            await fetchProfile(currentUser);
            if (isMountedRef.current) {
              router.refresh();
            }
          })();
        } else if (event === "SIGNED_OUT") {
          setProfile(null);
          router.refresh();
        }

        setIsLoading(false);
      }
    );

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [supabase, router, refreshUser, fetchProfile]);

  const value = {
    user,
    profile,
    isLoading,
    signOut,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
