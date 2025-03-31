import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { User } from "better-auth/types";

export type GetOwnedBusinessIdsResponse = {
  data: number[];
};
export const POST = withAuth(async (request: Request, user: User) => {
  try {
    // Get all businesses
    const ownedBusinessIds = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.ownerId, user.id));

    return Response.json({
      data: ownedBusinessIds,
    });
  } catch (error) {
    const errorMessage = "Error fetching owned business Ids:" + error;
    console.error(errorMessage);
    return Response.json(
      {
        message: errorMessage,
        success: false,
      },
      { status: 500 }
    );
  }
});
