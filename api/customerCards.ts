import { UsersCardResponse } from "@/app/api/customer/card+api";
import { CardInUse } from "@/db/schema";

export async function getCardsInUse(userId: string) {
  return fetch(`/api/customer/card`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  }).then(async (response) => {
    if (response.ok) {
      const respJson = await response.json();
      return respJson.data as UsersCardResponse[];
    } else {
      const error = await response.json();
      throw new Error(error.error);
    }
  });
}

export type AddOrScanResponse = { message: string; success: boolean };
export async function addOrScan(
  loyaltyCardId: CardInUse["loyaltyCardId"],
  userId: CardInUse["userId"]
) {
  return fetch("/api/customer/addOrScan", {
    method: "POST",
    body: JSON.stringify({ loyaltyCardId, userId }),
  }).then(async (response) => {
    if (response.ok) {
      const respJson = await response.json();
      return respJson.data as AddOrScanResponse;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  });
}
