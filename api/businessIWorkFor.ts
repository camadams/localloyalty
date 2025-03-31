import { BusinessIWorkForResponse } from "@/app/api/businessIWorkFor/getBusinessIWorkFor+api";
import { getCookie } from "@/lib/auth-client";

export async function getBusinessesIWorkFor() {
  return fetch(`/api/businessIWorkFor/getBusinessIWorkFor`, {
    method: "POST",
    headers: {
      Cookie: getCookie(),
      "Content-Type": "application/json",
    },
  }).then(async (response) => {
    const respJson = await response.json();
    if (response.ok) {
      return respJson.data as {
        id: number;
        name: string;
        canGivePoints: boolean;
        myEmploymentStatus: string;
      }[];
    } else {
      throw new Error(respJson.message || "Failed to fetch businesses you work for");
    }
  });
}