import { db } from "@/db";
import {
  Card,
  CardInUse,
  cardsInUse,
  loyaltyCards,
  businesses,
  Business,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { withAuth } from "@/lib/withAuth";
import { User } from "better-auth/types";
import { eq } from "drizzle-orm";

export type UsersCardResponse = {
  points: CardInUse["points"];
  createdAt: CardInUse["createdAt"];
  loyaltyCard: {
    description: Card["description"];
    maxPoints: Card["maxPoints"];
    status: Card["status"];
    artworkUrl: Card["artworkUrl"];
    businessName: Business["name"];
  };
};

export const POST = withAuth(async (request: Request, user: User) => {
  const cardsInUseWithLoyaltyInfo = await db
    .select({
      points: cardsInUse.points,
      createdAt: cardsInUse.createdAt,
      loyaltyCard: {
        description: loyaltyCards.description,
        maxPoints: loyaltyCards.maxPoints,
        status: loyaltyCards.status,
        artworkUrl: loyaltyCards.artworkUrl,
        businessName: businesses.name,
      },
    })
    .from(cardsInUse)
    .leftJoin(loyaltyCards, eq(cardsInUse.loyaltyCardId, loyaltyCards.id))
    .leftJoin(businesses, eq(loyaltyCards.businessId, businesses.id))
    .where(eq(cardsInUse.userId, user.id));
  return Response.json({ data: cardsInUseWithLoyaltyInfo });
});
