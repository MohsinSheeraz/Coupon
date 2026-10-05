import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/data";
import {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  COOKIE_NAME,
  makeToken,
} from "@/lib/auth";

type Ctx = { params: Promise<{ slug?: string[] }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const route = slug?.[0];

  // POST /api/admin/login
  if (route === "login") {
    let body: { user?: string; pass?: string } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
    }

    if (body.user === ADMIN_USERNAME && body.pass === ADMIN_PASSWORD) {
      const res = NextResponse.json({ ok: true });
      res.cookies.set({
        name: COOKIE_NAME,
        value: await makeToken(),
        path: "/", // "/" so both /admin pages and /api/admin routes receive it
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production", // HTTPS in deployment
        maxAge: 15 * 60,
      });
      return res;
    }
    return NextResponse.json(
      { ok: false, error: "Invalid credentials" },
      { status: 401 },
    );
  }

  // POST /api/admin/logout
  if (route === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set({ name: COOKIE_NAME, value: "", path: "/", maxAge: 0 });
    return res;
  }

  // POST /api/admin/settings (protected by middleware)
  if (route === "settings") {
    return NextResponse.json({ saved: true });
  }

  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;

  if (slug?.[0] === "settings") {
    try {
      const settings = await getSettings();
      return NextResponse.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}