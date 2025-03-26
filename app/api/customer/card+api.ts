import { db } from "@/db";
import {
  Card,
  CardInUse,
  cardsInUse,
  loyaltyCards,
  businesses,
  Business,
} from "@/db/schema";
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

export async function POST(request: Request) {
  console.log(new Date());

  const body = await request.json();
  const { userId } = body;
  console.log({ userId, ta2: 2 });
  // if (!userId) {
  //   return new Response(JSON.stringify({ error: "userId is required" }), {
  //     status: 400,
  //   });
  // }

  const cardsInUseWithLoyaltyInfo = await db
    .select({
      // id: cardsInUse.id,
      // userId: cardsInUse.userId,
      // loyaltyCardId: cardsInUse.loyaltyCardId,
      points: cardsInUse.points,
      createdAt: cardsInUse.createdAt,
      loyaltyCard: {
        // id: loyaltyCards.id,
        // businessId: loyaltyCards.businessId,
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
    .where(eq(cardsInUse.userId, userId));

  // console.log(cardsInUseWithLoyaltyInfo[0].points);

  return Response.json({ data: cardsInUseWithLoyaltyInfo });
}
