import { db } from "@/db";
import { cardsInUse } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { userId, loyaltyCardId } = await request.json(); // Extract the request body
  if (!userId || !loyaltyCardId) {
    return Response.json(
      { message: "userId and loyaltyCardId are required", success: false },
      {
        status: 400,
      }
    );
  }

  try {
    console.log("Adding or scanning points for user:", userId);
    const [existingCard] = await db
      .select()
      .from(cardsInUse)
      .where(
        and(
          eq(cardsInUse.loyaltyCardId, loyaltyCardId),
          eq(cardsInUse.userId, userId)
        )
      );
    if (existingCard) {
      const points = existingCard.points + 1; //todo check for max points!!
      await db
        .update(cardsInUse)
        .set({ points })
        .where(
          and(
            eq(cardsInUse.loyaltyCardId, loyaltyCardId),
            eq(cardsInUse.userId, userId)
          )
        );
      console.log("Card points updated successfully");
    } else {
      const [userCards] = await db
        .insert(cardsInUse)
        .values({
          userId,
          loyaltyCardId,
        })
        .returning();
      console.log("Card created successfully");
    }

    return Response.json(
      { message: "success", success: true },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating card:", error);
    return Response.json(
      { message: "Failed to create card", success: false },
      {
        status: 500,
      }
    );
  }
}
