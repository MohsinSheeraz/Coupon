import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/data";

// Hard-coded admin credentials (no longer read from .env)
const ADMIN_USERNAME = "AdminUser@gmail.com";
const ADMIN_PASSWORD = "AdminUserPassword";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  const routeArray = slug || [];

  // Case A: /api/admin/login
  if (routeArray[0] === "login") {
    const { user, pass } = await req.json();
    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
        const res = NextResponse.json({ ok: true });
        res.cookies.set({
            name: "admin-auth",
            value: "1",
            path: "/admin",
            httpOnly: true,
            maxAge: 15 * 60, // 15 minutes
        });
        return res;
    }
    
    // ⬇️ Fix: Return an explicit error on authentication failure
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  // Case B: /api/admin/settings
  if (routeArray[0] === "settings") {
    return NextResponse.json({ saved: true });
  }

  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  const routeArray = slug || [];

  // Case C: /api/admin/settings GET logic
  if (routeArray[0] === "settings") {
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
    // ⬇️ Removed the unreachable line from here
  }

  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}
