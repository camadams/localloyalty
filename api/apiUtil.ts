import { db } from "@/db";
import { businesses, businessEmployees } from "@/db/schema";
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
  const employees = await db
    .select()
    .from(businessEmployees)
    .where(eq(businessEmployees.userId, userId));
  if (employees.some((e) => e.businessId === businessId)) return true;
  return false;
}
