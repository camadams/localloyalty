import { db } from "@/db";
import { loyaltyCards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { businessId } = await request.json();
  const data = await db
    .select()
    .from(loyaltyCards)
    .where(eq(loyaltyCards.businessId, businessId));
  console.log({ data });
  return Response.json({ data });
}
