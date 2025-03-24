import { cardsWebSocketServer } from "@/cardsWebSocketServer";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { businessId } = body;

    // Log the broadcast request
    console.log(
      `Broadcast refresh request received${
        businessId ? ` for business: ${businessId}` : " for all businesses"
      }`
    );

    // Broadcast the refresh signal
    cardsWebSocketServer.broadcastRefreshSignal(
      businessId === "all" ? undefined : businessId
    );

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Refresh signal broadcast successfully",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error broadcasting refresh signal:", error);
    return new Response(
      JSON.stringify({ error: "Failed to broadcast refresh signal" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
