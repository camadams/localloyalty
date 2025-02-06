import { db } from "@/db";
import { cards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  console.log("***!!!!!*****!!!!");
  const { userId } = await request.json(); // Extract the request body
  // console.log({ userId });
  // if (!userId) {
  //   return new Response(JSON.stringify({ error: "userId is required" }), {
  //     status: 400,
  //   });
  // }

  const userCards = await db
    .select()
    .from(cards)
    .where(eq(cards.userId, userId));
  // console.log({ userCards });
  return Response.json({ cards: userCards });
  // //   const name = new URL(request.url).searchParams.get("name");
  // return Response.json({
  //   greeting: `Hello, ${name}!`,
  // });
}
