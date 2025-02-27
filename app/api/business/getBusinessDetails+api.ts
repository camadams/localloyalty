import { db } from "@/db";
import { businesses, loyaltyCards, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { businessId } = await request.json();
  const businessDetails = await db
    .select({
      businessName: businesses.name,
      businessOwnersName: user.name,
      businessOwnersEmail: user.email,
      businessOwnersImg: user.image,
    })
    .from(businesses)
    .leftJoin(user, eq(businesses.ownerId, user.id))
    .where(eq(businesses.id, businessId));
  console.log({ businessDetails });
  return Response.json({ businessDetails: businessDetails[0] });
}

export type GetBusinessDetailsResponse = {
  businessName: string;
  businessOwnersName: string | null;
  businessOwnersEmail: string | null;
  businessOwnersImg: string | null;
};
