import { UsersCardResponse } from "@/app/api/customer/card+api";

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

export async function createNewCard({
  businessId,
  userId,
}: {
  businessId: string;
  userId: string;
}) {
  return fetch("/api/customer/newCard", {
    method: "POST",
    body: JSON.stringify({ businessId, userId }),
  }).then(async (response) => {
    if (response.ok) {
      const respJson = await response.json();
      return respJson.data as UsersCardResponse;
    } else {
      const error = await response.json();
      throw new Error(error.error);
    }
  });
}
