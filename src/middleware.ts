export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/app/:path*",
    "/nurse/:path*",
    "/partner/:path*",
    "/ops/:path*"
  ]
};