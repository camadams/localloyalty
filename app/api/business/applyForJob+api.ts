import { db } from "@/db";
import { businessEmployees } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { User } from "better-auth/types";
import { and, eq } from "drizzle-orm";

export type ApplyForJobResponse = {
  success: boolean;
  message: string;
  applicationId?: number;
};

export const POST = withAuth(async (request: Request, user: User) => {
  const { businessId } = await request.json();

  if (!businessId) {
    return Response.json(
      { success: false, message: "Business ID is required" },
      { status: 400 }
    );
  }

  try {
    // Check if the user already has a pending or active application
    const existingApplication = await db
      .select()
      .from(businessEmployees)
      .where(
        and(
          eq(businessEmployees.userId, user.id),
          eq(businessEmployees.businessId, businessId)
        )
      );

    if (existingApplication.length > 0) {
      return Response.json({
        success: false,
        message: `You already have a ${existingApplication[0].status} application for this business`,
      });
    }

    // Create a new application with pending status
    const [result] = await db
      .insert(businessEmployees)
      .values({
        userId: user.id,
        businessId,
        status: "pending",
        canGivePoints: false, // Default to false until approved
      })
      .returning({ id: businessEmployees.id });

    return Response.json({
      success: true,
      message: "Job application submitted successfully",
      applicationId: result.id,
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    return Response.json(
      { success: false, message: "Failed to submit job application" },
      { status: 500 }
    );
  }
});
