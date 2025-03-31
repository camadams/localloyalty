import { db } from "@/db";
import { businesses } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { User } from "better-auth/types";

export type BusinessListItem = {
  id: number;
  name: string;
};

export const POST = withAuth(async (request: Request, user: User) => {
  try {
    // Get all businesses
    const allBusinesses = await db
      .select({
        id: businesses.id,
        name: businesses.name,
      })
      .from(businesses);

    return Response.json({
      data: allBusinesses,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching all businesses:", error);
    return Response.json(
      {
        message: "Failed to fetch businesses",
        success: false,
      },
      { status: 500 }
    );
  }
});
