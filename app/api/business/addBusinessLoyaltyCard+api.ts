import { db } from "@/db";
import { loyaltyCards, NewCard } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as NewCard;
    
    // Validate required fields
    if (!json.businessId || !json.userId || !json.description) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Set default values if not provided
    const cardData: NewCard = {
      ...json,
      maxPoints: json.maxPoints || 10,
      status: json.status || "active",
      artworkUrl: json.artworkUrl || null,
    };
    
    // Insert the new loyalty card
    const result = await db.insert(loyaltyCards).values(cardData);
    
    return Response.json({ 
      success: true, 
      message: "Loyalty card created successfully",
      data: result 
    });
  } catch (error) {
    console.error("Error creating loyalty card:", error);
    return Response.json(
      { error: "Failed to create loyalty card" },
      { status: 500 }
    );
  }
}
