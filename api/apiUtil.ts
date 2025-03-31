import { db } from "@/db";
import { businesses, employees } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function doesUserOwnOrEmployeedByBusiness(
  businessId: number,
  userId: string
) {
  const ownedBusinesses = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, userId));

  if (ownedBusinesses.some((b) => b.id === businessId)) return true;
  const employeesResult = await db
    .select()
    .from(employees)
    .where(eq(employees.userId, userId));
  if (employeesResult.some((e) => e.businessId === businessId)) return true;
  return false;
}
