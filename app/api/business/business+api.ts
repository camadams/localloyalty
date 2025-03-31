import { db } from "@/db";
import { employees, businesses, loyaltyCards, user } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { User } from "better-auth/types";
import { eq, inArray } from "drizzle-orm";

export type BusinessWithEmployees = {
  businessId: number;
  businessName: string;
  employees: {
    businessId: number;
    userId: string;
    userName: string;
    userEmail: string;
  }[];
};

export const POST = withAuth(async (request: Request, user: User) => {
  const ownedBusinessesAndEmployees = await getOwnedBusinessesAndEmployees(
    user.id
  );
  return Response.json({
    ownedBusinessesAndEmployees,
  });
});

async function getOwnedBusinessesAndEmployees(
  userId: string
): Promise<BusinessWithEmployees[]> {
  // Find businesses owned by the user
  const ownedBusinesses = await db
    .select({
      businessId: businesses.id,
      businessName: businesses.name, // Assuming there is a "name" column in businesses
    })
    .from(businesses)
    .where(eq(businesses.ownerId, userId));

  // Extract business IDs
  const businessIds = ownedBusinesses.map((b) => b.businessId);
  if (businessIds.length === 0) return [];

  // Find employees of those businesses
  const employeesResult = await db
    .select({
      businessId: employees.businessId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    })
    .from(employees)
    .innerJoin(user, eq(employees.userId, user.id))
    .where(inArray(employees.businessId, businessIds));

  // Group employees by business
  const businessMap = new Map<number, BusinessWithEmployees>();

  ownedBusinesses.forEach(({ businessId, businessName }) => {
    businessMap.set(businessId, { businessId, businessName, employees: [] });
  });

  employeesResult.forEach(({ businessId, userId, userName, userEmail }) => {
    businessMap
      .get(businessId)
      ?.employees.push({ businessId, userId, userName, userEmail });
  });

  return Array.from(businessMap.values());
}
