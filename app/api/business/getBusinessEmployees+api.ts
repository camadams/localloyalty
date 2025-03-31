import { db } from "@/db";
import { employees, businesses, loyaltyCards, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export type GetBusinessEmployeesResponse = {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  canGivePoints: boolean;
  employeeImage: string | null;
  status: string;
}[];

export async function POST(request: Request) {
  const { businessId } = await request.json();
  const employeesResult = await db
    .select({
      employeeId: user.id,
      employeeName: user.name,
      employeeEmail: user.email,
      canGivePoints: employees.canGivePoints,
      employeeImage: user.image,
      status: employees.status,
    })
    .from(employees)
    .innerJoin(user, eq(employees.userId, user.id))
    .where(eq(employees.businessId, businessId));
  return Response.json({ data: employeesResult });
}
