import { db } from "@/db";
import { businessEmployees, businesses, loyaltyCards, user } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { eq, inArray } from "drizzle-orm";
import { User } from "better-auth/types";

export type BusinessWithEmployees = {
  businessName: string;
  employees: { userId: number; userName: string }[];
};

export type NewBusinessResponse = {
  id: number;
  message: string;
  success: boolean;
};

export const POST = withAuth(async (request: Request, user: User) => {
  const { name } = await request.json();
  
  try {
    const [result] = await db.insert(businesses).values({ 
      ownerId: user.id, // Use the authenticated user's ID
      name,
    }).returning({
      id: businesses.id,
    });

    return Response.json({ 
      id: result.id, 
      message: "Business created successfully", 
      success: true 
    });
  } catch (error) {
    console.error("Error creating business:", error);
    return Response.json({ 
      message: "Failed to create business", 
      success: false 
    }, { status: 500 });
  }
});
