import { db } from "@/db";
import { businessEmployees, businesses, loyaltyCards, user } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export type BusinessWithEmployees = {
  businessName: string;
  employees: { userId: number; userName: string }[];
};

export async function POST(request: Request) {
  const { ownerId, name } = await request.json();
  const id = await db.insert(businesses).values({ ownerId, name }).returning({
    id: businesses.id,
  });

  //test error heres

  return Response.json({ message: id!! ? "success" : "failed" });
}
