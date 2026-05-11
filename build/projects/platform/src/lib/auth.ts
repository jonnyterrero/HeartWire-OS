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

  const email = authUser.email!;
  const name =
    authUser.user_metadata?.full_name || authUser.user_metadata?.name;
  const avatarUrl = authUser.user_metadata?.avatar_url;

  // First try by id (the normal case).
  let user = await prisma.user.findUnique({ where: { id: authUser.id } });

  if (!user) {
    // Reconcile a pre-existing row with the same email but a different id —
    // happens when a Supabase auth user is recreated (e.g. account reset).
    // The Prisma `id` is a PK referenced by FKs, so we keep the existing
    // row and just refresh the metadata.
    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { name, avatarUrl },
      });
    } else {
      user = await prisma.user.create({
        data: { id: authUser.id, email, name, avatarUrl },
      });
    }
  } else {
    // Refresh metadata on every login but never overwrite the email with
    // one that's already taken by a different row.
    const desiredEmail = email;
    const currentEmail = user.email;

    if (desiredEmail !== currentEmail) {
      const emailOwner = await prisma.user.findUnique({
        where: { email: desiredEmail },
        select: { id: true },
      });

      // If another row already owns this email, keep the existing email to
      // avoid violating the unique constraint (and breaking login).
      if (emailOwner && emailOwner.id !== user.id) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name, avatarUrl },
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { email: desiredEmail, name, avatarUrl },
        });
      }
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name, avatarUrl },
      });
    }
  }

  return { user, error: null };
}
