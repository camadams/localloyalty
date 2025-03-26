import { BusinessWithEmployees } from "@/app/api/business+api";
import { CardResponse } from "@/app/api/business/getBusinessLoyaltyCards+api";
import { GetBusinessEmployeesResponse } from "@/app/api/business/getBusinessEmployees+api";
import { NewCard } from "@/db/schema";

export async function getBusinessesForUser(userId: string) {
  return fetch(`/api/business`, {
    method: "POST",
    body: JSON.stringify({ userId }),
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

export async function getBusinessLoyaltyCards(businessId: number) {
  return fetch(`/api/business/getBusinessLoyaltyCards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ businessId }),
  }).then(async (response) => {
    const respJson = await response.json();
    if (response.ok) {
      return respJson.data as CardResponse[];
    } else {
      throw new Error(respJson.error || "Failed to fetch loyalty cards");
    }
  });
}

export async function getBusinessEmployees(businessId: number) {
  return fetch(`/api/business/getBusinessEmployees`, {
    method: "POST",
    headers: {
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
