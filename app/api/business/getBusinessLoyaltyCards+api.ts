import { db } from "@/db";
import { Card, loyaltyCards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/withAuth";
import { User } from "better-auth/types";
import doesUserOwnOrEmployeedByBusiness from "@/api/apiUtil";

export type CardResponse = Card | { error: string };

export const POST = withAuth(async (request: Request, user: User) => {
  const { businessId } = await request.json();
  if (!(await doesUserOwnOrEmployeedByBusiness(businessId, user.id))) {
    return Response.json(
      {
        error:
          "You don't have permission to view loyalty cards for this business.",
      },
      { status: 403 }
    );
  }
  const data = await db
    .select()
    .from(loyaltyCards)
    .where(eq(loyaltyCards.businessId, businessId));
  return Response.json({ data });
});
