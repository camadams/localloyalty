import { UsersCardResponse } from "@/app/api/customer/card+api";
import { CardInUse } from "@/db/schema";
import { getCookie } from "@/lib/auth-client";

export async function getCardsInUse() {
  return fetch(`/api/customer/card`, {
    method: "POST",
    headers: {
      Cookie: getCookie(),
    },
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
export async function addOrScan(loyaltyCardId: CardInUse["loyaltyCardId"]) {
  return fetch("/api/customer/addOrScan", {
    method: "POST",
    headers: {
      Cookie: getCookie(),
    },
    body: JSON.stringify({ loyaltyCardId }),
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
