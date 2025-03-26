import { db } from "@/db";
import { businessEmployees, businesses, loyaltyCards, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export type GetBusinessEmployeesResponse = {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  canGivePoints: boolean;
  employeeImage: string | null;
}[];

export async function POST(request: Request) {
  const { businessId } = await request.json();
  const employees = await db
    .select({
      employeeId: user.id,
      employeeName: user.name,
      employeeEmail: user.email,
      canGivePoints: businessEmployees.canGivePoints,
      employeeImage: user.image,
    })
    .from(businessEmployees)
    .innerJoin(user, eq(businessEmployees.userId, user.id))
    .where(eq(businessEmployees.businessId, businessId));
  console.log({ employees });
  return Response.json({ data: employees });
}
