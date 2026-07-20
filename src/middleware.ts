import middleware from "next-auth/middleware";
export default middleware;

export const config = {
  matcher: [
    "/app/:path*",
    "/nurse/:path*",
    "/partner/:path*",
    "/ops/:path*"
  ]
};