import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

/**
 * Gets the authenticated user from Supabase session.
 * If no session, returns a 401 response.
 * If user doesn't exist in Prisma yet, creates them (first-login sync).
 */
export async function getAuthenticatedUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {
      email: authUser.email!,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
      avatarUrl: authUser.user_metadata?.avatar_url,
    },
    create: {
      id: authUser.id,
      email: authUser.email!,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
      avatarUrl: authUser.user_metadata?.avatar_url,
    },
  });

  return { user, error: null };
}
