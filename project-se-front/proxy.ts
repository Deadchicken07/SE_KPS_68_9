import { NextResponse, type NextRequest } from "next/server";
import {
  authPages,
  canRoleAccessPath,
  mapRoleIdToRole,
  roleHome,
  type Roles,
  userProtectedPrefixes,
} from "@/types/role.types";

type SessionPayload = {
  role_id: number | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isAuthPage(pathname: string) {
  return authPages.some((page) => matchesPrefix(pathname, page));
}

function isUserProtectedPath(pathname: string) {
  return userProtectedPrefixes.some((prefix) => matchesPrefix(pathname, prefix));
}

function isUserPath(pathname: string) {
  return pathname === "/user" || matchesPrefix(pathname, "/user");
}

function isProtectedPath(pathname: string) {
  return pathname === "/staff" || matchesPrefix(pathname, "/staff") || isUserProtectedPath(pathname);
}

function canAccessPath(role: Roles, pathname: string) {
  return canRoleAccessPath(role, pathname);
}

function buildLoginRedirect(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const redirectTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("redirect", redirectTarget);
  return NextResponse.redirect(loginUrl);
}

async function getSession(request: NextRequest): Promise<SessionPayload | null> {
  const cookie = request.headers.get("cookie");

  if (!cookie) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/session`, {
      headers: {
        cookie,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authPage = isAuthPage(pathname);
  const protectedPath = isProtectedPath(pathname);
  const userPath = isUserPath(pathname);

  if (!authPage && !protectedPath && !userPath) {
    return NextResponse.next();
  }

  const session = await getSession(request);
  const role = mapRoleIdToRole(session?.role_id ?? null);

  if (!role) {
    if (protectedPath) {
      return buildLoginRedirect(request);
    }

    return NextResponse.next();
  }

  if (authPage) {
    return NextResponse.redirect(new URL(roleHome[role], request.url));
  }

  if (userPath && role !== "user") {
    return NextResponse.redirect(new URL(roleHome[role], request.url));
  }

  if (!canAccessPath(role, pathname)) {
    return NextResponse.redirect(new URL(roleHome[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login/:path*",
    "/staff/:path*",
    "/user/:path*",
  ],
};
