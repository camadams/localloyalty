import { db } from "@/db";
import { cardsInUse } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: Request) {
  const body = await request.json();
  const { cardId } = body;
  console.log({ cardId });
  if (!cardId) {
    return new Response(JSON.stringify({ error: "cardId is required" }), {
      status: 400,
    });
  }
  // const body = await request.json(); // Extract the request body
  // console.log({ body });

  // const userId = body.userId as string; // Destructure userId

  // if (!userId) {
  //   return new Response(JSON.stringify({ error: "userId is required" }), {
  //     status: 400,
  //   });
  // }

  await db
    .update(cardsInUse)
    .set({ points: sql`${cardsInUse.points} + 1` })
    .where(eq(cardsInUse.id, cardId));
  return Response.json({ message: "done" });
  // //   const name = new URL(request.url).searchParams.get("name");
  // return Response.json({
  //   greeting: `Hello, ${name}!`,
  // });
}
