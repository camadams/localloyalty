import { db } from "@/db";
import { employees, businesses } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { User } from "better-auth/types";
import { eq } from "drizzle-orm";

export type BusinessItem = {
  businessId: number;
  businessName: string;
  employee?: boolean;
};

export type GetOwnedAndEmployeedByBusinessesResponse = {
  ownedBusinesses: BusinessItem[];
  employedByBusinesses: BusinessItem[];
};

export const POST = withAuth(async (request: Request, user: User) => {
  const ownedBusinesses = await db
    .select({
      businessId: businesses.id,
      businessName: businesses.name,
    })
    .from(businesses)
    .where(eq(businesses.ownerId, user.id));

  // Create a new array with the employee property added
  var employedByBusinesses = await db
    .select({
      businessId: businesses.id,
      businessName: businesses.name,
    })
    .from(businesses)
    .leftJoin(employees, eq(employees.businessId, businesses.id))
    .where(eq(employees.userId, user.id));

  // Add the employee property to each business object
  employedByBusinesses = employedByBusinesses.map((business) => ({
    ...business,
    employee: true,
  }));

  return Response.json({
    ownedBusinesses,
    employedByBusinesses,
  });
});
