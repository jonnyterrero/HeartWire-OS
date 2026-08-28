import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(request: Request) {
  const limited = rateLimit(`account-del:${clientIp(request)}`, 3, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const supabase = createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "Account deletion is not configured on this deployment." },
      { status: 501 }
    );
  }

  try {
    await prisma.user.delete({ where: { id: user!.id } });
  } catch (err) {
    console.error("[account.delete] prisma", err);
    return NextResponse.json({ error: "Failed to delete account data" }, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: authDeleteError } = await admin.auth.admin.deleteUser(authUser.id);
  if (authDeleteError) {
    console.error("[account.delete] auth", authDeleteError.message);
    return NextResponse.json(
      { error: "Workspace data deleted, but the login could not be removed. Contact support." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
