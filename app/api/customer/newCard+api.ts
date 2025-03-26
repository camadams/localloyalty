import { db } from "@/db";
import { cardsInUse, loyaltyCards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { businessId, userId } = await request.json(); // Extract the request body
  console.log({ businessId, userId });
  if (!businessId || !userId) {
    return Response.json(
      { error: "businessId and userId are required" },
      {
        status: 400,
      }
    );
  }

  try {
    const [userCards] = await db
      .insert(cardsInUse)
      .values({
        userId: userId,
        loyaltyCardId: businessId,
      })
      .returning();
    console.log("Card created successfully", userCards);
    return Response.json(
      { data: userCards, success: true },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating card:", error);
    return Response.json(
      { error: "Failed to create card" },
      {
        status: 500,
      }
    );
  }
}
