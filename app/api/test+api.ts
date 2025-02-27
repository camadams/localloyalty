import { db } from "@/db";
import { loyaltyCards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  //   const name = new URL(request.url).searchParams.get("name");
  const cardss = await db
    .select()
    .from(loyaltyCards)
    .where(eq(loyaltyCards.id, 1));
  console.log("in test");
  return Response.json({
    greeting: `Hello0000. Cardss . length: ${cardss.length}!`,
  });
}
