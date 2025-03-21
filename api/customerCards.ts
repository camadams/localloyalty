import { CardInUseResponse } from "@/app/api/customer/card+api";

export async function getCardsInUse(userId: string) {
  return fetch(`/api/customer/card`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  }).then(async (response) => {
    if (response.ok) {
      return (await response.json()) as CardInUseResponse;
    } else {
      const error = await response.json();
      throw new Error(error.error);
    }
  });
}
