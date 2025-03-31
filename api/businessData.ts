import { BusinessWithEmployees } from "@/app/api/business/business+api";
import { GetOwnedAndEmployeedByBusinessesResponse } from "@/app/api/business/getOwnedAndEmployeedByBusinesses+api";
import { GetOwnedAndEmployeedByLoyaltyCardsResponse } from "@/app/api/business/getOwnedAndEmployeedByLoyaltyCards+api";
import { GetOwnedBusinessIdsResponse } from "@/app/api/business/getOwnedBusinessIds+api";
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

export async function getBusinessLoyaltyCards(businessId: number) {
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
      return respJson.data as {
        employeeId: number;
        employeeName: string;
        employeeEmail: string;
        canGivePoints: boolean;
        employeeImage: string | null;
        status: string;
      }[];
    } else {
      throw new Error(respJson.error || "Failed to fetch business employees");
    }
  });
}

export async function createBusiness(name: string) {
  return fetch(`/api/newbusiness`, {
    method: "POST",
    headers: {
      Cookie: getCookie(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  }).then(async (response) => {
    const respJson = await response.json();
    if (response.ok) {
      return respJson;
    } else {
      throw new Error(respJson.message || "Failed to create business");
    }
  });
}

export async function applyForJob(businessId: number) {
  return fetch(`/api/business/applyForJob`, {
    method: "POST",
    headers: {
      Cookie: getCookie(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ businessId }),
  }).then(async (response) => {
    const respJson = await response.json();
    if (response.ok) {
      return respJson;
    } else {
      throw new Error(respJson.message || "Failed to apply for job");
    }
  });
}

export async function updateEmployeeStatus(
  employeeId: number,
  businessId: number,
  status: "active" | "suspended" | "revoked",
  canGivePoints: boolean
) {
  return fetch(`/api/business/updateEmployeeStatus`, {
    method: "POST",
    headers: {
      Cookie: getCookie(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ employeeId, businessId, status, canGivePoints }),
  }).then(async (response) => {
    const respJson = await response.json();
    if (response.ok) {
      return respJson;
    } else {
      throw new Error(respJson.message || "Failed to update employee status");
    }
  });
}

export async function getAllBusinesses(): Promise<
  { id: number; name: string }[]
> {
  return fetch(`/api/business/getAllBusinesses`, {
    method: "POST",
    headers: {
      Cookie: getCookie(),
      "Content-Type": "application/json",
    },
  }).then(async (response) => {
    const respJson = await response.json();
    if (response.ok) {
      return respJson.data;
    } else {
      throw new Error(respJson.message || "Failed to fetch businesses");
    }
  });
}

export async function getOwnedBusinessIds() {
  return fetch(`/api/business/getOwnedBusinessIds`, {
    method: "POST",
    headers: {
      Cookie: getCookie(),
      "Content-Type": "application/json",
    },
  }).then(async (response) => {
    const respJson = await response.json();
    if (response.ok) {
      return respJson.data as GetOwnedBusinessIdsResponse;
    } else {
      throw new Error(respJson.message || "Failed to fetch businesses");
    }
  });
}

export async function getOwnedAndEmployeedByBusinesses() {
  return fetch(`/api/business/getOwnedAndEmployeedByBusinesses`, {
    method: "POST",
    headers: {
      Cookie: getCookie(),
      "Content-Type": "application/json",
    },
  }).then(async (response) => {
    const respJson = await response.json();
    if (response.ok) {
      return respJson as GetOwnedAndEmployeedByBusinessesResponse;
    } else {
      throw new Error(respJson.message || "Failed to fetch businesses");
    }
  });
}

export async function getOwnedAndEmployeedByLoyaltyCards(businessId: number) {
  return fetch(`/api/business/getOwnedAndEmployeedByLoyaltyCards`, {
    method: "POST",
    headers: {
      Cookie: getCookie(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ businessId }),
  }).then(async (response) => {
    const respJson = await response.json();
    if (response.ok) {
      return respJson as GetOwnedAndEmployeedByLoyaltyCardsResponse;
    } else {
      throw new Error(respJson.message || "Failed to fetch businesses");
    }
  });
}
