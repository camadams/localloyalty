import { db } from "@/db";
import { businessEmployees, businesses, loyaltyCards, user } from "@/db/schema";
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

export async function POST(request: Request) {
  const { userId } = await request.json();
  console.log({ userId });
  const ownedBusinessesAndEmployees = await getOwnedBusinessesAndEmployees(
    userId
  );
  // console.log({ ownedBusinessesAndEmployees });
  // console.log(typeof ownedBusinessesAndEmployees == BusinessWithEmployees);
  return Response.json({
    ownedBusinessesAndEmployees,
  });
}

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
  const employees = await db
    .select({
      businessId: businessEmployees.businessId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    })
    .from(businessEmployees)
    .innerJoin(user, eq(businessEmployees.userId, user.id))
    .where(inArray(businessEmployees.businessId, businessIds));

  // Group employees by business
  const businessMap = new Map<number, BusinessWithEmployees>();

  ownedBusinesses.forEach(({ businessId, businessName }) => {
    businessMap.set(businessId, { businessId, businessName, employees: [] });
  });

  employees.forEach(({ businessId, userId, userName, userEmail }) => {
    businessMap
      .get(businessId)
      ?.employees.push({ businessId, userId, userName, userEmail });
  });

  return Array.from(businessMap.values());
}
