export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/log/:path*", "/medications/:path*", "/journal/:path*"],
};