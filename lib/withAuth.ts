import { User } from "better-auth/types";
import { auth } from "./auth";

export function withAuth(
  handler: (request: Request, user: User) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const user = session?.user;
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(request, user);
  };
}
