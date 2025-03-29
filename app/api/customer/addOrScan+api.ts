import { db } from "@/db";
import { cardsInUse } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { and, eq } from "drizzle-orm";
import { User } from "better-auth/types";

export const POST = withAuth(async (request: Request, user: User) => {
  const { loyaltyCardId } = await request.json(); // Extract the request body
  if (!loyaltyCardId) {
    return Response.json(
      { message: "loyaltyCardId is required", success: false },
      {
        status: 400,
      }
    );
  }

  try {
    console.log("Adding or scanning points for user:", user.id);
    const [existingCard] = await db
      .select()
      .from(cardsInUse)
      .where(
        and(
          eq(cardsInUse.loyaltyCardId, loyaltyCardId),
          eq(cardsInUse.userId, user.id)
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
            eq(cardsInUse.userId, user.id)
          )
        );
      console.log("Card points updated successfully");
    } else {
      const [userCards] = await db
        .insert(cardsInUse)
        .values({
          userId: user.id,
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
});
