import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const GESTAO_ROLES = ["PROFESSOR", "COORDENACAO", "APOIO_PSICOSSOCIAL", "ADMIN"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await auth();

  const isAlunoRoute = pathname.startsWith("/aluno");
  const isGestaoRoute = pathname.startsWith("/gestao");
  const isAdminRoute = pathname.startsWith("/admin");

  if ((isAlunoRoute || isGestaoRoute || isAdminRoute) && !session?.user) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAlunoRoute && session?.user.role !== "ESTUDANTE") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isGestaoRoute && !GESTAO_ROLES.includes(session?.user.role ?? "")) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isAdminRoute && session?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/aluno/:path*", "/gestao/:path*", "/admin/:path*"],
};
