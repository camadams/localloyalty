import { db } from "@/db";
import { employees, businesses } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { User } from "better-auth/types";
import { and, eq } from "drizzle-orm";

export type UpdateEmployeeStatusResponse = {
  success: boolean;
  message: string;
};

export const POST = withAuth(async (request: Request, user: User) => {
  const { employeeId, businessId, status, canGivePoints } =
    await request.json();

  if (!employeeId || !businessId || !status) {
    return Response.json(
      {
        success: false,
        message: "Employee ID, Business ID, and status are required",
      },
      { status: 400 }
    );
  }

  try {
    // Verify that the user is the owner of the business
    const [business] = await db
      .select()
      .from(businesses)
      .where(
        and(eq(businesses.id, businessId), eq(businesses.ownerId, user.id))
      );

    if (!business) {
      return Response.json(
        {
          success: false,
          message: "You are not authorized to update employee status",
        },
        { status: 403 }
      );
    }

    // Update the employee status
    await db
      .update(employees)
      .set({
        status,
        canGivePoints: canGivePoints !== undefined ? canGivePoints : false,
        updatedAt: new Date(),
        // assignedBy: user.id,
        // assignedAt: new Date(),
      })
      .where(
        and(
          eq(employees.userId, employeeId),
          eq(employees.businessId, businessId)
        )
      );

    return Response.json({
      success: true,
      message: `Employee status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating employee status:", error);
    return Response.json(
      { success: false, message: "Failed to update employee status" },
      { status: 500 }
    );
  }
});
