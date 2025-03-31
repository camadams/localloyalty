import { db } from "@/db";
import { businesses, businessEmployees } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { eq, and } from "drizzle-orm";
import { User } from "better-auth/types";

export type BusinessIWorkForResponse = {
  id: number;
  name: string;
  canGivePoints: boolean;
  myEmploymentStatus: string;
};

export const POST = withAuth(async (request: Request, user: User) => {
  try {
    // Query businesses where the user is an employee
    const businessesIWorkFor = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        canGivePoints: businessEmployees.canGivePoints,
        myEmploymentStatus: businessEmployees.status,
      })
      .from(businessEmployees)
      .innerJoin(
        businesses,
        eq(businessEmployees.businessId, businesses.id)
      )
      .where(eq(businessEmployees.userId, user.id));

    return Response.json({
      data: businessesIWorkFor,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching businesses user works for:", error);
    return Response.json(
      {
        message: "Failed to fetch businesses",
        success: false,
      },
      { status: 500 }
    );
  }
});