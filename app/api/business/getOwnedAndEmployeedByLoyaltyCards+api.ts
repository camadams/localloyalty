import { db } from "@/db";
import { Card, employees, loyaltyCards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/withAuth";
import { User } from "better-auth/types";

export type LoyaltyCardItem = {
  id: number;
  description: string;
  maxPoints: number;
  status: string;
  artworkUrl: string | null;
  employee?: boolean;
};

export type GetOwnedAndEmployeedByLoyaltyCardsResponse = {
  ownedLoyaltyCards: LoyaltyCardItem[];
  employeedLoyaltyCards: LoyaltyCardItem[];
}[];

export const POST = withAuth(async (request: Request, user: User) => {
  console.log("hiiiiiiiiiiiiiiiiip93487532945skdjgh");
  const { businessId } = await request.json();

  console.log({ businessId });

  const ownedLoyaltyCards = await db
    .select({
      id: loyaltyCards.id,
      description: loyaltyCards.description,
      maxPoints: loyaltyCards.maxPoints,
      status: loyaltyCards.status,
      artworkUrl: loyaltyCards.artworkUrl,
    })
    .from(loyaltyCards)
    .where(eq(loyaltyCards.businessId, businessId));

  var employeedLoyaltyCards = await db
    .select({
      id: loyaltyCards.id,
      description: loyaltyCards.description,
      maxPoints: loyaltyCards.maxPoints,
      status: loyaltyCards.status,
      artworkUrl: loyaltyCards.artworkUrl,
    })
    .from(loyaltyCards)
    .leftJoin(employees, eq(employees.businessId, loyaltyCards.businessId))
    .where(eq(employees.userId, user.id));

  employeedLoyaltyCards = employeedLoyaltyCards.map((card) => ({
    ...card,
    employee: true,
  }));

  console.log({ ownedLoyaltyCards, employeedLoyaltyCards });
  return Response.json(
    { ownedLoyaltyCards, employeedLoyaltyCards },
    { status: 200 }
  );
});
