import { BusinessWithEmployees } from "@/app/api/business/business+api";
import { CardResponse } from "@/app/api/business/getBusinessLoyaltyCards+api";
import { GetBusinessEmployeesResponse } from "@/app/api/business/getBusinessEmployees+api";
import { NewCard, Card } from "@/db/schema";
import { getCookie } from "@/lib/auth-client";

export async function getBusinessesForUser() {
  return fetch(`/api/business/business`, {
    method: "POST",
    headers: {
      Cookie: getCookie(),
    },
  }).then(async (response) => {
    if (response.ok) {
      const respJson = await response.json();
      return respJson.ownedBusinessesAndEmployees as BusinessWithEmployees[];
    } else {
      const error = await response.json();
      throw new Error(error.error);
    }
  });
}

export async function createLoyaltyCard(cardData: Omit<NewCard, "id">) {
  return fetch(`/api/business/addBusinessLoyaltyCard`, {
    method: "POST",
    headers: {
      Cookie: getCookie(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cardData),
  }).then(async (response) => {
    const respJson = await response.json();
    if (response.ok) {
      return respJson;
    } else {
      throw new Error(respJson.error || "Failed to create loyalty card");
    }
  });
}

export async function getBusinessLoyaltyCards(
  businessId: number
): Promise<Card[]> {
  try {
    const response = await fetch(`/api/business/getBusinessLoyaltyCards`, {
      method: "POST",
      headers: {
        Cookie: getCookie(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ businessId }),
    });

    const respJson = await response.json();

    if (response.ok) {
      return respJson.data as Card[];
    } else {
      const error = new Error(
        respJson.error || "Failed to fetch loyalty cards"
      );
      // Add status code to the error object for better error handling
      (error as any).statusCode = response.status;
      throw error;
    }
  } catch (err) {
    // Re-throw any network errors or errors from the API
    throw err as Error;
  }
}

export async function getBusinessEmployees(businessId: number) {
  return fetch(`/api/business/getBusinessEmployees`, {
    method: "POST",
    headers: {
      Cookie: getCookie(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ businessId }),
  }).then(async (response) => {
    const respJson = await response.json();
    if (response.ok) {
      return respJson.data as GetBusinessEmployeesResponse;
    } else {
      throw new Error(respJson.error || "Failed to fetch business employees");
    }
  });
}
