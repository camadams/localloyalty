import { db } from "@/db";
import { businesses, cards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { userId } = await request.json(); // Extract the request body

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, userId));
  // console.log({ userCards });
  return Response.json({ business });
  // //   const name = new URL(request.url).searchParams.get("name");
  // return Response.json({
  //   greeting: `Hello, ${name}!`,
  // });
}
