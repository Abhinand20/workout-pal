import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
 
// TODO: Enable once we migrate off of sqlite.
export async function middleware(request: NextRequest) {
	// const sessionCookie = getSessionCookie(request);
 
	// if (!sessionCookie) {
	// 	return NextResponse.redirect(new URL("/", request.url));
	// }
 
	return NextResponse.next();
}
 
// export const config = {
// 	matcher: ["/landing", "/workout", "/workout/:path*"],
// };