import { db } from "@/db";
import { loyaltyCards, NewCard } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const json = (await request.json()) as NewCard;
  console.log({ json });
  const data = await db.insert(loyaltyCards).values(json);
  return Response.json({ data });
}
