import { db } from "@/db";
import { Card, loyaltyCards } from "@/db/schema";
import { eq } from "drizzle-orm";

export type CardResponse = Card;

export async function POST(request: Request) {
  const { businessId } = await request.json();
  const data = await db
    .select()
    .from(loyaltyCards)
    .where(eq(loyaltyCards.businessId, businessId));
  return Response.json({ data });
}
