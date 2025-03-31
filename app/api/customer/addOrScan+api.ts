import { db } from "@/db";
import { cardsInUse } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { and, eq } from "drizzle-orm";
import { User } from "better-auth/types";

// Define the maximum age of a valid QR code (in milliseconds)
const MAX_QR_CODE_AGE = 30000; // 30 seconds (giving a bit more than the 10 second refresh for network delays)

export const POST = withAuth(async (request: Request, user: User) => {
  // todo check on the front end if they have this card, if so call endpoint to incrementPoints otherwise add
  const { loyaltyCardId, timestamp } = await request.json(); // Extract the request body with timestamp
  if (!loyaltyCardId) {
    return Response.json(
      { message: "loyaltyCardId is required", success: false },
      {
        status: 400,
      }
    );
  }

  // Validate the timestamp
  if (!timestamp) {
    return Response.json(
      { message: "timestamp is required", success: false },
      {
        status: 400,
      }
    );
  }

  // Check if the QR code has expired
  const currentTime = Date.now();
  const qrCodeAge = currentTime - Number(timestamp);

  if (qrCodeAge > MAX_QR_CODE_AGE) {
    return Response.json(
      {
        message:
          "QR code has expired, to avoid fraud, refresh the qr code every 10 seconds, please scan a new code",
        success: false,
      },
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
